
import React, { useState } from 'react';
import { PITCH_SLIDES } from '../constants';

const PitchModule: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % PITCH_SLIDES.length);
  const prevSlide = () => setCurrentSlide(prev => (prev - 1 + PITCH_SLIDES.length) % PITCH_SLIDES.length);

  const slide = PITCH_SLIDES[currentSlide];

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-[#0A2540] rounded-[4rem] text-white shadow-3xl relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#00D4FF] opacity-5 blur-[120px] rounded-full -mr-48 -mt-48"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500 opacity-5 blur-[120px] rounded-full -ml-48 -mb-48"></div>

      <div className="relative z-10 w-full max-w-3xl text-center space-y-12">
        <div className="space-y-4">
          <p className="text-[#00D4FF] font-black uppercase tracking-[0.4em] text-xs">Investor Deck Slide {slide.id}/12</p>
          <h2 className="text-6xl font-black tracking-tighter leading-tight animate-slideUp">
            {slide.title}
          </h2>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-12 rounded-[3rem] min-h-[300px] flex items-center justify-center">
          <p className="text-2xl font-medium text-blue-100/80 leading-relaxed italic animate-fadeIn">
            "{slide.content}"
          </p>
        </div>

        <div className="flex items-center justify-between gap-8 pt-8">
          <button 
            onClick={prevSlide}
            className="p-6 bg-white/5 border border-white/10 rounded-full hover:bg-white hover:text-[#0A2540] transition-all"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"></path></svg>
          </button>
          
          <div className="flex gap-2">
            {PITCH_SLIDES.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 transition-all rounded-full ${i === currentSlide ? 'w-8 bg-[#00D4FF]' : 'w-2 bg-white/20'}`}
              ></div>
            ))}
          </div>

          <button 
            onClick={nextSlide}
            className="p-6 bg-[#00D4FF] text-[#0A2540] rounded-full hover:scale-110 transition-all shadow-xl shadow-blue-500/20"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PitchModule;
