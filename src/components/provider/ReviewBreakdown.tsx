import React from 'react';
import { Star } from 'lucide-react';

interface RatingStats {
  star: number;
  count: number;
  total: number;
}

interface ReviewBreakdownProps {
  stats: RatingStats[];
}

export default function ReviewBreakdown({ stats }: ReviewBreakdownProps) {
  return (
    <div className="space-y-3">
      {stats.sort((a, b) => b.star - a.star).map((row) => (
        <div key={row.star} className="flex items-center gap-4">
          <div className="flex items-center gap-1 min-w-[30px]">
            <span className="text-xs font-black text-gray-900">{row.star}</span>
            <Star className="w-3 h-3 text-yellow-400 fill-current" />
          </div>
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 rounded-full transition-all duration-1000"
              style={{ width: `${(row.count / row.total) * 100}%` }}
            ></div>
          </div>
          <span className="text-[10px] font-black text-gray-400 min-w-[20px] text-right">
            {row.count}
          </span>
        </div>
      ))}
    </div>
  );
}