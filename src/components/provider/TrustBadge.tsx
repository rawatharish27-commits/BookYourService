import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface TrustBadgeProps {
  score: number; // 0–100
}

export default function TrustBadge({ score }: TrustBadgeProps) {
  const getStyles = (s: number) => {
    if (s >= 80) return "bg-green-50 text-green-700 border-green-100";
    if (s >= 60) return "bg-yellow-50 text-yellow-700 border-yellow-100";
    return "bg-red-50 text-red-700 border-red-100";
  };

  const getLabel = (s: number) => {
    if (s >= 90) return "Elite";
    if (s >= 80) return "Highly Trusted";
    if (s >= 60) return "Standard";
    return "At Risk";
  };

  return (
    <div className={`px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${getStyles(score)}`}>
      <ShieldCheck className="w-3.5 h-3.5" />
      Trust Score: {score} • {getLabel(score)}
    </div>
  );
}
