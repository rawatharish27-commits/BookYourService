import { GoogleGenAI } from "@google/genai";
import { Problem } from './types';
import db from './DatabaseService';

class VisualDiagnosticsService {
  async analyzeProblemImage(base64Image: string, mimeType: string): Promise<{ suggestedProblem: Problem | null; confidence: number; reasoning: string }> {
    try {
      const apiKeyVal: string = process.env.API_KEY || "";
      const ai = new GoogleGenAI({ apiKey: apiKeyVal });
      
      const allProblemsList: Problem[] = db.getProblems();
      const sampleSet: Problem[] = allProblemsList.slice(0, 50);
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: {
          parts: [
            { inlineData: { data: base64Image, mimeType: mimeType } },
            { text: `TECHNICAL ANALYSIS: Identify technical fault from image. Compare against ontology: ${sampleSet.map(p => p.title).join(', ')}. Return JSON ONLY: { "matchedTitle": string, "confidence": number, "reasoning": string }` }
          ]
        },
        config: {
          thinkingConfig: { thinkingBudget: 4000 },
          responseMimeType: 'application/json'
        }
      });

      const responseTextVal: string = response.text || '{}';
      const resultObj = JSON.parse(responseTextVal);
      const matchedNode: Problem | null = allProblemsList.find(p => p.title === resultObj.matchedTitle) || null;

      const finalOutcome = {
        suggestedProblem: matchedNode,
        confidence: resultObj.confidence || 0,
        reasoning: resultObj.reasoning || "Node processing complete."
      };
      
      return finalOutcome;
    } catch (error) {
      console.error("AI Node Error:", error);
      throw error;
    }
  }
}

export const visualAI = new VisualDiagnosticsService();
export default visualAI;