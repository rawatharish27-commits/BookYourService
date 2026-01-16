import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${variant === 'default' ? 'bg-gray-100 text-gray-800' : ''}
        ${variant === 'success' ? 'bg-green-100 text-green-800' : ''}
        ${variant === 'warning' ? 'bg-yellow-100 text-yellow-800' : ''}
        ${variant === 'error' ? 'bg-red-100 text-red-800' : ''}
        ${variant === 'info' ? 'bg-blue-100 text-blue-800' : ''}
        ${size === 'sm' ? 'px-2 py-0.5 text-xs' : ''}
        ${size === 'md' ? 'px-2.5 py-0.5 text-xs' : ''}
        ${className}
      `}
    >
      {children}
    </span>
  );
};
