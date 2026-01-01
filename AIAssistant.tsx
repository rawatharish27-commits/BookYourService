import React, { useState, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

interface AIAssistantProps {
  role: 'USER' | 'PROVIDER';
  city: string;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ role, city }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [status, setStatus] = useState('Standby');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);

  const startLiveSession = async () => {
    try {
      setStatus('Connecting...');
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsLive(true);
            setStatus('Listening...');
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.modelTurn?.parts[0]?.inlineData?.data) {
              playAudio(message.serverContent.modelTurn.parts[0].inlineData.data);
            }
          },
          onerror: (e) => console.error("Live Error", e),
          onclose: () => {
            setIsLive(false);
            setStatus('Standby');
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: `You are the DoorStep Pro Hub Intelligence. Help the ${role} in ${city} manage their services. You can identify problems and suggest nearby hardware stores using Maps.`,
          tools: [{ googleMaps: {} }]
        }
      });
    } catch (err) {
      console.error(err);
      setStatus('Failed');
    }
  };

  const playAudio = async (base64: string) => {
    const ctx = audioContextRef.current!;
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    
    const dataInt16 = new Int16Array(bytes.buffer);
    const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
    const channel = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) channel[i] = dataInt16[i] / 32768.0;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    
    nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
    source.start(nextStartTimeRef.current);
    nextStartTimeRef.current += buffer.duration;
  };

  return (
    <div className="fixed bottom-10 right-10 z-[500] font-inter">
      {isOpen ? (
        <div className="bg-[#0A2540] w-80 md:w-96 h-[500px] rounded-[3rem] shadow-3xl flex flex-col overflow-hidden border border-white/10 animate-slideUp">
          <div className="p-8 flex justify-between items-center bg-white/5 border-b border-white/5">
            <span className="text-[10px] font-black text-white uppercase tracking-widest">{status}</span>
            <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white">✕</button>
          </div>
          <div className="flex-1 p-8 flex flex-col justify-center items-center text-center space-y-6">
            <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-4xl cursor-pointer" onClick={startLiveSession}>🎙️</div>
            <h4 className="text-white font-black uppercase italic">Speak to Hub</h4>
          </div>
        </div>
      ) : (
        <button onClick={() => setIsOpen(true)} className="w-16 h-16 bg-blue-600 text-white rounded-[2rem] shadow-2xl flex items-center justify-center transition-all group">
          <span className="text-2xl group-hover:rotate-12">🤖</span>
        </button>
      )}
    </div>
  );
};

export default AIAssistant;