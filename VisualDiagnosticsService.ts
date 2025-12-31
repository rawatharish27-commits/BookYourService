import { GoogleGenAI } from "@google/genai";
import { Problem } from './types';
import { db } from './DatabaseService';

class VisualDiagnosticsService {
  async analyzeProblemImage(base64Image: string, mimeType: string): Promise<{ suggestedProblem: Problem | null; confidence: number; reasoning: string }> {
    try {
      const apiKey = process.env.API_KEY || "";
      const ai = new GoogleGenAI({ apiKey });
      const problems = db.getProblems();
      const ontologySample = problems.slice(0, 50);
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: {
          parts: [
            { inlineData: { data: base64Image, mimeType } },
            { text: `SYSTEM ANALYSIS: Identify technical fault from image. Compare against ontology: ${ontologySample.map(p => p.title).join(', ')}. Return valid JSON: { "matchedTitle": string, "confidence": number, "reasoning": string }` }
          ]
        },
        config: {
          thinkingConfig: { thinkingBudget: 4000 },
          responseMimeType: 'application/json'
        }
      });

      const responseText = response.text || '{}';
      const result = JSON.parse(responseText);
      const matched = problems.find(p => p.title === result.matchedTitle) || null;

      return {
        suggestedProblem: matched,
        confidence: result.confidence || 0,
        reasoning: result.reasoning || "Node diagnostic processing finalized."
      };
    } catch (error) {
      console.error("AI Diagnostic Node Critical Error:", error);
      throw error;
    }
  }
}

export const visualAI = new VisualDiagnosticsService();