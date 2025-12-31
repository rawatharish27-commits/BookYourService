import { GoogleGenAI } from "@google/genai";
import { Problem } from './types';
import { db } from './DatabaseService';

class VisualDiagnosticsService {
  async analyzeProblemImage(base64Image: string, mimeType: string): Promise<{ suggestedProblem: Problem | null; confidence: number; reasoning: string }> {
    try {
      const key = process.env.API_KEY || "";
      const ai = new GoogleGenAI({ apiKey: key });
      
      const allProblems = db.getProblems();
      const ontologySample = (allProblems || []).slice(0, 50);
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: {
          parts: [
            { inlineData: { data: base64Image, mimeType } },
            { text: `System Diagnostic Mode: Identify technical fault from image. Compare against known ontology nodes: ${ontologySample.map(p => p.title).join(', ')}. Return JSON format: { "matchedTitle": string, "confidence": number, "reasoning": string }` }
          ]
        },
        config: {
          thinkingConfig: { thinkingBudget: 4000 },
          responseMimeType: 'application/json'
        }
      });

      const responseText = response.text || '{}';
      const result = JSON.parse(responseText);
      const matched = (allProblems || []).find(p => p.title === result.matchedTitle);

      return {
        suggestedProblem: matched || null,
        confidence: result.confidence || 0,
        reasoning: result.reasoning || "Visual node processed successfully."
      };
    } catch (error) {
      console.error("AI Node Critical Error:", error);
      throw error;
    }
  }
}

export const visualAI = new VisualDiagnosticsService();