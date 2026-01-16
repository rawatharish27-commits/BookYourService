import React from 'react';

// ============================================
// CARD COMPONENT (MVP - NO EXTERNAL LIBS)
// ============================================
// Purpose: Container for Content (Dashboards, Listings).
// Stack: React + Tailwind CSS (Standard HTML).
// Type: Production-Grade (Hover Lift, Shadow).
// 
// IMPORTANT:
// 1. Micro-interaction (Hover Scale).
// 2. Lift Effect (Shadow Increase).
// 3. Glassmorphism (Blur).
// ============================================

interface CardProps {
  children: React.ReactNode;
  className?: string;
  isInteractive?: boolean;
}

export const Card = ({ children, className, isInteractive = true }: CardProps) => {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-100 shadow-lg p-6 ${isInteractive ? 'cursor-pointer hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 ease-in-out' : ''} ${className}`}
    >
      {children}
    </div>
  );
};
