import { GoogleGenAI } from "@google/genai";
import { Problem } from '../types';
import { db } from './DatabaseService';

class VisualDiagnosticsService {
  async analyzeProblemImage(base64Image: string, mimeType: string): Promise<{ suggestedProblem: Problem | null; confidence: number; reasoning: string }> {
    try {
      const apiKey: string = process.env.VITE_GEMINI_API_KEY || "";
      const ai = new GoogleGenAI({ apiKey });
      
      const allProblems: Problem[] = db.getProblems();
      const ontologySample: Problem[] = allProblems.slice(0, 50);
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: {
          parts: [
            { inlineData: { data: base64Image, mimeType: mimeType } },
            { text: `TECHNICAL ANALYSIS: Identify technical fault from image. Compare against ontology: ${ontologySample.map(p => p.title).join(', ')}. Return JSON ONLY: { "matchedTitle": string, "confidence": number, "reasoning": string }` }
          ]
        },
        config: {
          thinkingConfig: { thinkingBudget: 4000 },
          responseMimeType: 'application/json'
        }
      });

      const responseText: string = response.text || '{}';
      const result = JSON.parse(responseText);
      const matched: Problem | null = allProblems.find(p => p.title === result.matchedTitle) || null;

      const finalResult = {
        suggestedProblem: matched,
        confidence: result.confidence || 0,
        reasoning: result.reasoning || "Node processing complete."
      };
      
      return finalResult;
    } catch (error) {
      console.error("AI Node Error:", error);
      throw error;
    }
  }
}

export const visualAI = new VisualDiagnosticsService();