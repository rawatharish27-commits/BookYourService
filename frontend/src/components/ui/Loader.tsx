import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
}

export const Loader: React.FC<LoaderProps> = ({
  size = 'md',
  text,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  }[size];

  return (
    <div
      className={`
        flex flex-col items-center justify-center
        space-y-3
        ${className}
      `}
    >
      <Loader2
        className={`animate-spin ${sizeClasses[size]} text-blue-600`}
      />
      {text && <p className="text-sm text-gray-600 mt-2">{text}</p>}
    </div>
  );
};
