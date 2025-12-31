import { GoogleGenAI } from "@google/genai";
import { Problem } from '../types';
import { db } from './DatabaseService';

class VisualDiagnosticsService {
  async analyzeProblemImage(base64Image: string, mimeType: string): Promise<{ suggestedProblem: Problem | null; confidence: number; reasoning: string }> {
    try {
      // Ensure API_KEY is available or at least not causing a syntax error
      const apiKey = process.env.API_KEY || "";
      const ai = new GoogleGenAI({ apiKey });
      
      const problems = db.getProblems();
      const ontologySample = (problems || []).slice(0, 50);
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-latest',
        contents: [{
          parts: [
            { inlineData: { data: base64Image, mimeType } },
            { text: `TECHNICAL ANALYSIS: Identify home service fault from image. Match against ontology: ${ontologySample.map(p => p.title).join(', ')}. Return JSON ONLY: { "matchedTitle": string, "confidence": number, "reasoning": string }` }
          ]
        }],
        config: {
          responseMimeType: 'application/json'
        }
      });

      const responseText = response.text || '{}';
      const result = JSON.parse(responseText);
      const matched = (problems || []).find(p => p.title === result.matchedTitle);

      return {
        suggestedProblem: matched || null,
        confidence: result.confidence || 0,
        reasoning: result.reasoning || "Diagnostic processing complete."
      };
    } catch (error) {
      console.error("AI Node Error:", error);
      throw error;
    }
  }
}

export const visualAI = new VisualDiagnosticsService();