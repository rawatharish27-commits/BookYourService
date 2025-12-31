
import { GoogleGenAI } from "@google/genai";
import { Problem } from './types';
import { db } from './DatabaseService';

class VisualDiagnosticsService {
  async analyzeProblemImage(base64Image: string, mimeType: string): Promise<{ suggestedProblem: Problem | null; confidence: number; reasoning: string }> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const ontologySample = db.getProblems().slice(0, 50);
      
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

      const result = JSON.parse(response.text || '{}');
      const matched = db.getProblems().find(p => p.title === result.matchedTitle);

      return {
        suggestedProblem: matched || null,
        confidence: result.confidence || 0,
        reasoning: result.reasoning || "Visual node processed."
      };
    } catch (error) {
      console.error("AI Node Critical Error", error);
      throw error;
    }
  }
}

export const visualAI = new VisualDiagnosticsService();
