import React from 'react';

// ============================================
// PAGE TRANSITION COMPONENT (MVP - NO EXTERNAL LIBS)
// ============================================
// Purpose: Wrapper for Page Content (Simplified).
// Stack: React + Tailwind CSS.
// Type: Production-Grade (Static Wrapper).
// 
// IMPORTANT:
// 1. Wraps Page Content.
// 2. Removed `AnimatePresence` (Framer Motion - Missing Lib).
// 3. Removed `motion` (Framer Motion - Missing Lib).
// 4. Simple `div` with CSS transitions if needed.
// ============================================

export const PageTransition = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-full h-full min-h-screen bg-slate-50 animate-fade-in">
      {children}
    </div>
  );
};
