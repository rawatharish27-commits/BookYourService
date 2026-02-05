import React from 'react';

export default function Loader() {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
      <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
      <p className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Optimizing Experience...</p>
    </div>
  );
}