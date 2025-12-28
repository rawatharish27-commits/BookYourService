
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Problem } from '../types';

interface AIAssistantProps {
  role: 'USER' | 'PROVIDER';
  contextProblems?: Problem[];
  onSuggestionSelect?: (problem: Problem) => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ role, contextProblems, onSuggestionSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'ai' | 'user'; text: string }[]>([
    { role: 'ai', text: role === 'USER' 
      ? "Hi! I'm your DoorStep AI. Describe your problem in plain words (e.g., 'my tap is making a weird clicking sound'), and I'll find the right service for you." 
      : "Technical Support Node Active. Ask me for troubleshooting steps or wiring diagrams based on the current job." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  // Fixed: Moved ref declaration up and removed the faulty line 21
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      // Always initialize with apiKey from process.env.API_KEY
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const systemPrompt = role === 'USER' 
        ? `You are a helpful home service assistant for DoorStep Pro. 
           Analyze the user's problem and recommend one of these categories: ${contextProblems?.map(p => p.category).join(', ')}.
           Be concise. If you identify a specific problem, suggest it.`
        : `You are a senior technical advisor for field engineers. 
           Provide step-by-step troubleshooting for household repairs. Be extremely professional and safety-conscious.`;

      // Use generateContent with systemInstruction in config as per guidelines
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: {
          systemInstruction: systemPrompt
        }
      });

      // Directly access .text property from response object
      const aiText = response.text || "I'm having trouble processing that right now. Please try again.";
      setMessages(prev => [...prev, { role: 'ai', text: aiText }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "Connection to Intelligence Node lost. Please check your network." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[500]">
      {isOpen ? (
        <div className="bg-white w-80 md:w-96 h-[500px] rounded-[2.5rem] shadow-3xl border border-gray-100 flex flex-col overflow-hidden animate-slideUp">
          <div className="bg-[#0A2540] p-6 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#00D4FF] rounded-full flex items-center justify-center text-[#0A2540] text-xs font-black">AI</div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-300 leading-none">Intelligence</p>
                <p className="font-bold text-sm">Diagnostic Hub</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white">×</button>
          </div>
          
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-gray-50/50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-3xl text-xs font-medium leading-relaxed ${
                  m.role === 'user' ? 'bg-[#00D4FF] text-[#0A2540] rounded-tr-none' : 'bg-white text-[#0A2540] shadow-sm rounded-tl-none border border-gray-100'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-3xl animate-pulse flex gap-1">
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-white border-t border-gray-100 flex gap-2">
            <input 
              type="text" 
              placeholder="Ask anything..." 
              className="flex-1 bg-gray-50 rounded-2xl px-4 py-3 text-sm outline-none font-medium focus:ring-2 focus:ring-[#00D4FF]"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSend()}
            />
            <button onClick={handleSend} className="bg-[#0A2540] text-white p-3 rounded-2xl">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
            </button>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-[#0A2540] text-white w-16 h-16 rounded-full shadow-3xl flex items-center justify-center hover:scale-110 transition-all border-4 border-white animate-bounce"
        >
          <div className="text-xl">🤖</div>
        </button>
      )}
    </div>
  );
};

export default AIAssistant;
