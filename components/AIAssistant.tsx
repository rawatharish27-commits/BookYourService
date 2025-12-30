
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type } from '@google/genai';

interface AIAssistantProps {
  role: 'USER' | 'PROVIDER';
  city: string;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ role, city }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [status, setStatus] = useState('Standby');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sessionPromiseRef = useRef<any>(null);

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
            setupMicrophone(sessionPromise);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.modelTurn?.parts[0]?.inlineData?.data) {
              playAudio(message.serverContent.modelTurn.parts[0].inlineData.data);
            }
            if (message.serverContent?.outputTranscription) {
              setTranscription(prev => prev + ' ' + message.serverContent?.outputTranscription?.text);
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
          systemInstruction: `You are the DoorStep Pro Hub Intelligence. Help the ${role} in ${city} manage their services. You can identify problems, suggest nearby hardware stores using Maps, and guide through SOPs.`,
          tools: [{ googleMaps: {} }]
        }
      });

      sessionPromiseRef.current = sessionPromise;
    } catch (err) {
      console.error(err);
      setStatus('Failed');
    }
  };

  const setupMicrophone = async (promise: Promise<any>) => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const inputCtx = new AudioContext({ sampleRate: 16000 });
    const source = inputCtx.createMediaStreamSource(stream);
    const processor = inputCtx.createScriptProcessor(4096, 1, 1);

    processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      const int16 = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
      
      const base64 = btoa(String.fromCharCode(...new Uint8Array(int16.buffer)));
      promise.then(session => {
        session.sendRealtimeInput({ media: { data: base64, mimeType: 'audio/pcm;rate=16000' } });
      });
    };

    source.connect(processor);
    processor.connect(inputCtx.destination);
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
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}></div>
              <span className="text-[10px] font-black text-white uppercase tracking-widest">{status}</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white">✕</button>
          </div>
          
          <div className="flex-1 p-8 overflow-y-auto custom-scrollbar flex flex-col justify-center items-center text-center space-y-6">
            {!isLive ? (
              <>
                <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-4xl shadow-2xl shadow-blue-600/20 cursor-pointer" onClick={startLiveSession}>🎙️</div>
                <h4 className="text-white font-black uppercase italic tracking-tighter text-xl">Tap to Speak</h4>
                <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Connect with Hub Intelligence for voice booking and repair guidance.</p>
              </>
            ) : (
              <div className="space-y-8 w-full">
                <div className="flex justify-center gap-1 h-12 items-end">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="w-1 bg-blue-500 rounded-full animate-bounce" style={{ height: `${Math.random()*100}%`, animationDelay: `${i*0.1}s` }}></div>
                  ))}
                </div>
                <p className="text-white text-xs font-medium italic opacity-80 leading-relaxed px-4">"{transcription || 'Listening to your request...'}"</p>
                <button onClick={() => setIsLive(false)} className="bg-rose-500/10 text-rose-500 px-6 py-3 rounded-full text-[9px] font-black uppercase tracking-widest border border-rose-500/20">End Session</button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <button onClick={() => setIsOpen(true)} className="w-16 h-16 bg-blue-600 text-white rounded-[2rem] shadow-2xl flex items-center justify-center hover:scale-110 transition-all group">
          <span className="text-2xl group-hover:rotate-12">🤖</span>
        </button>
      )}
    </div>
  );
};

export default AIAssistant;
