import React, { useState } from 'react';
import { PITCH_SLIDES } from './constants';

const InvestorModule: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  const nextSlide = () => setCurrentSlide((prev: number) => (prev + 1) % PITCH_SLIDES.length);
  const prevSlide = () => setCurrentSlide((prev: number) => (prev - 1 + PITCH_SLIDES.length) % PITCH_SLIDES.length);

  const slide = PITCH_SLIDES[currentSlide];

  // Guaranteed initializers for all local constants to prevent SyntaxErrors
  const targetRoiValue: string = "24.5%";
  const momGrowthValue: string = "18%";
  const profileRiskValue: string = "Minimal";

  const metricsData = {
    roi: targetRoiValue,
    growth: momGrowthValue,
    risk: profileRiskValue
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-[#0A2540] rounded-[4rem] text-white shadow-3xl relative overflow-hidden">
      <div className="relative z-10 w-full max-w-3xl text-center space-y-12">
        <div className="space-y-4">
          <p className="text-blue-400 font-black uppercase tracking-[0.4em] text-xs text-center">Investor Deck Slide {slide.id}/12</p>
          <h2 className="text-6xl font-black tracking-tighter leading-tight animate-slideUp text-center">
            {slide.title}
          </h2>
        </div>
        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-12 rounded-[3rem] min-h-[300px] flex items-center justify-center">
          <p className="text-2xl font-medium text-blue-100/80 leading-relaxed italic animate-fadeIn text-center">
            "{slide.content}"
          </p>
        </div>
        
        <div className="grid grid-cols-3 gap-4 w-full">
            <div className="bg-white/5 p-6 rounded-3xl text-center">
                <p className="text-[10px] uppercase text-blue-400 font-black">Target ROI</p>
                <p className="text-2xl font-black">{metricsData.roi}</p>
            </div>
            <div className="bg-white/5 p-6 rounded-3xl text-center">
                <p className="text-[10px] uppercase text-blue-400 font-black">MoM Growth</p>
                <p className="text-2xl font-black">{metricsData.growth}</p>
            </div>
            <div className="bg-white/5 p-6 rounded-3xl text-center">
                <p className="text-[10px] uppercase text-blue-400 font-black">Risk Node</p>
                <p className="text-2xl font-black">{metricsData.risk}</p>
            </div>
        </div>

        <div className="flex justify-between items-center w-full pt-8 px-4">
            <button onClick={prevSlide} className="p-6 bg-white/10 rounded-full hover:bg-white/20 transition-all text-2xl">←</button>
            <div className="flex gap-2">
                {PITCH_SLIDES.map((_, i) => (
                    <div key={i} className={`w-2 h-2 rounded-full ${i === currentSlide ? 'bg-blue-500' : 'bg-white/20'}`}></div>
                ))}
            </div>
            <button onClick={nextSlide} className="p-6 bg-blue-600 rounded-full hover:bg-blue-700 transition-all text-2xl shadow-xl shadow-blue-500/20">→</button>
        </div>
      </div>
    </div>
  );
};

export default InvestorModule;