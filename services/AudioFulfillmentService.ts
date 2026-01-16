import { GoogleGenAI, Modality } from "@google/genai";

class AudioFulfillmentService {
  async playVoiceSOP(sopSteps: string[], providerName: string) {
    try {
      const apiKey = process.env.VITE_GEMINI_API_KEY || "";
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Joe and Jane discuss SOP: ${sopSteps.join(', ')} for partner ${providerName}.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            multiSpeakerVoiceConfig: {
              speakerVoiceConfigs: [
                { speaker: 'Joe', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
                { speaker: 'Jane', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } }
              ]
            }
          }
        }
      });

      const parts = response.candidates?.[0]?.content?.parts;
      const audioPart = parts?.find(p => p.inlineData);
      const base64Audio = audioPart?.inlineData?.data;

      if (base64Audio) {
        const audioContext = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new audioContext({ sampleRate: 24000 });
        
        const binaryString = atob(base64Audio);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const dataInt16 = new Int16Array(bytes.buffer);
        const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < dataInt16.length; i++) {
          channelData[i] = dataInt16[i] / 32768.0;
        }
        
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start();
      }
    } catch (error) {
      console.error("Audio Error:", error);
    }
  }
}

export const voiceAI = new AudioFulfillmentService();