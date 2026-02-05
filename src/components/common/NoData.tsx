import React from 'react';
import { Ghost, Search } from 'lucide-react';

interface NoDataProps {
  title: string;
  description: string;
  type?: 'search' | 'empty';
}

export default function NoData({ title, description, type = 'empty' }: NoDataProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-in fade-in duration-700">
      <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center mb-6 text-gray-200 border border-gray-100">
        {type === 'search' ? <Search className="w-10 h-10" /> : <Ghost className="w-10 h-10" />}
      </div>
      <h3 className="text-xl font-black text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed font-medium">
        {description}
      </p>
    </div>
  );
}