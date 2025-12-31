
import React, { useState } from 'react';
import { PITCH_SLIDES } from '../constants';

const InvestorModule: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % PITCH_SLIDES.length);
  const prevSlide = () => setCurrentSlide(prev => (prev - 1 + PITCH_SLIDES.length) % PITCH_SLIDES.length);

  const slide = PITCH_SLIDES[currentSlide];

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-[#0A2540] rounded-[4rem] text-white shadow-3xl relative overflow-hidden">
      <div className="relative z-10 w-full max-w-3xl text-center space-y-12">
        <div className="space-y-4">
          <p className="text-[#00D4FF] font-black uppercase tracking-[0.4em] text-xs">Investor Deck {slide.id}/12</p>
          <h2 className="text-6xl font-black tracking-tighter leading-tight animate-slideUp">
            {slide.title}
          </h2>
        </div>
        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-12 rounded-[3rem] min-h-[300px] flex items-center justify-center">
          <p className="text-2xl font-medium text-blue-100/80 leading-relaxed italic animate-fadeIn">
            "{slide.content}"
          </p>
        </div>
        <div className="flex justify-between items-center w-full">
            <button onClick={prevSlide} className="p-4 bg-white/10 rounded-full">←</button>
            <button onClick={nextSlide} className="p-4 bg-blue-600 rounded-full">→</button>
        </div>
      </div>
    </div>
  );
};

export default InvestorModule;
