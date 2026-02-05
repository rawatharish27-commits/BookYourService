import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface Crumb {
  label: string;
  path?: string;
}

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6 select-none overflow-x-auto no-scrollbar whitespace-nowrap">
      <Link to="/" className="hover:text-indigo-600 transition-colors flex items-center gap-1.5 shrink-0">
        <Home className="w-3 h-3" /> Home
      </Link>
      
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-3 h-3 opacity-30 shrink-0" />
          {item.path ? (
            <Link to={item.path} className="hover:text-indigo-600 transition-colors shrink-0">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 shrink-0">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}