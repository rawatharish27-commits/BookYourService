import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, X } from 'lucide-react';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('bys_consent');
    if (!consent) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleConsent = (status: 'accepted' | 'rejected') => {
    localStorage.setItem('bys_consent', status);
    setIsVisible(false);
    // Reload if accepted to initialize ads immediately
    if (status === 'accepted') {
      window.location.reload();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 z-[100] animate-in slide-in-from-bottom-10 duration-700">
      <div className="max-w-4xl mx-auto bg-gray-900 text-white rounded-[2rem] p-6 md:p-8 shadow-2xl border border-white/10 backdrop-blur-xl flex flex-col md:flex-row items-center gap-6">
        <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
          <ShieldCheck className="w-8 h-8 text-white" />
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-lg font-black tracking-tight mb-1">Your Privacy Choice</h3>
          <p className="text-xs text-gray-400 leading-relaxed font-medium">
            We use cookies to enhance your discovery experience and serve personalized ads. 
            By clicking "Accept", you agree to our <Link to="/privacy" className="text-indigo-400 underline font-bold">Privacy Policy</Link> and <Link to="/terms" className="text-indigo-400 underline font-bold">Terms</Link>.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={() => handleConsent('rejected')}
            className="flex-1 md:flex-none px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
          >
            Decline
          </button>
          <button 
            onClick={() => handleConsent('accepted')}
            className="flex-1 md:flex-none px-8 py-3 rounded-xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg active:scale-95"
          >
            Accept All
          </button>
        </div>

        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}