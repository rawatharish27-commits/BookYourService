import React from 'react';

interface AvatarProps {
  src?: string;
  alt?: string;
  initials?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  initials,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
  }[size];

  if (src) {
    return (
      <div
        className={`
          flex items-center justify-center
          rounded-full overflow-hidden
          bg-gray-200
          ${sizeClasses[size]}
          ${className}
        `}
      >
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className={`
        flex items-center justify-center
        rounded-full
        bg-gradient-to-br from-blue-500 to-purple-600
        text-white font-semibold
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {initials}
    </div>
  );
};
