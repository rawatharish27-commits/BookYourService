/**
 * Stat Card Component - Display statistics
 */
import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'emerald';
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, change, changeType = 'neutral', color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
    emerald: 'bg-emerald-500',
  };

  const changeColors = {
    positive: 'text-emerald-500',
    negative: 'text-red-500',
    neutral: 'text-slate-400',
  };

  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <span className="text-2xl">{icon}</span>
        {change && (
          <span className={`text-xs font-bold ${changeColors[changeType]}`}>
            {change}
          </span>
        )}
      </div>
      <p className="text-2xl font-black text-[#0A2540] italic">{value}</p>
      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{label}</p>
    </div>
  );
};

export default StatCard;

