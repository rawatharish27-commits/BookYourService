import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

interface TrustScoreProps {
  score: number;
}

export default function TrustScore({ score }: TrustScoreProps) {
  const getColor = (s: number) => {
    if (s >= 80) return 'text-green-600 bg-green-50 border-green-100';
    if (s >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-100';
    return 'text-red-600 bg-red-50 border-red-100';
  };

  const getLabel = (s: number) => {
    if (s >= 90) return 'Elite Professional';
    if (s >= 75) return 'Highly Trusted';
    if (s >= 50) return 'Standard';
    return 'At Risk';
  };

  return (
    <div className={`p-6 rounded-[2rem] border transition-all ${getColor(score)}`}>
      <div className="flex justify-between items-start mb-6">
        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Trust Score</p>
          <h4 className="text-3xl font-black">{score}%</h4>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="h-2 w-full bg-white/50 rounded-full overflow-hidden">
          <div 
            className="h-full bg-current transition-all duration-1000 ease-out" 
            style={{ width: `${score}%` }}
          ></div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs font-black uppercase tracking-tighter">{getLabel(score)}</span>
          <button className="p-1 hover:opacity-50 transition-opacity">
            <Info className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}