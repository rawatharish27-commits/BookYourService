import React from 'react';

// ============================================
// BUTTON COMPONENT (MVP - NO EXTERNAL LIBS)
// ============================================
// Purpose: Primary UI Action Component.
// Stack: React + Tailwind CSS (Standard HTML).
// Type: Production-Grade (Accessible, Static Styles).
// 
// IMPORTANT:
// 1. Micro-interaction (Hover Scale).
// 2. Loading State (Text "Loading...").
// 3. Disabled State (Greyed Out).
// ============================================

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: string; // Text/Emoji
  rightIcon?: string; // Text/Emoji
  className?: string;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, className, children, ...props }, ref
) => {
    // Variants (Color + Style)
    const baseStyles = "inline-flex items-center justify-center rounded-2xl font-semibold transition-all duration-300 ease-in-out";
    
    const variants = {
      primary: "bg-primary text-white hover:bg-primary/90 hover:scale-105 shadow-lg hover:shadow-primary/50 active:scale-95",
      secondary: "bg-secondary text-white hover:bg-secondary/90 hover:scale-105 shadow-lg hover:shadow-secondary/50 active:scale-95",
      ghost: "bg-transparent text-slate-700 hover:bg-slate-100 hover:scale-105",
      destructive: "bg-red-500 text-white hover:bg-red-600 hover:scale-105 shadow-lg",
    };

    const sizes = {
      sm: "h-9 px-4 text-sm",
      md: "h-11 px-6 text-base",
      lg: "h-12 px-8 text-lg",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className} disabled:opacity-50`}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <span className="animate-pulse mr-2">⏳</span> {/* Loading Spinner Emoji */}
        ) : (
          <>
            {leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="ml-2">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  });
});

Button.displayName = "Button";
