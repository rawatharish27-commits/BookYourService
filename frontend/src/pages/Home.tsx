import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

// ============================================
// LANDING PAGE (MVP - NO EXTERNAL LIBS)
// ============================================
// Purpose: Hero Section + Features + "How it Works".
// Stack: React + Tailwind CSS (Standard HTML).
// Type: Production-Grade (Vibrant, Static, Brief).
// 
// IMPORTANT:
// 1. Hero Section: High Impact (Headline + CTA).
// 2. Features Grid: Text/Emoji + Brief Text.
// 3. "How it Works": Step-by-step visual.
// 4. Removed `motion` (Framer Motion - Missing Lib).
// 5. Removed `lucide-react` icons (Replaced with Emojis).
// ============================================

export const Home = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* ============================================
           1. NAVBAR (STICKY + GLASSMORPHISM)
           ============================================ */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-primary mr-2 text-2xl">⚡</span> {/* Zap Emoji */}
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">BookYourService</h1>
          </div>
          <div className="space-x-4">
            <Link to="/login">
              <Button variant="ghost" size="sm">Login</Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ============================================
           2. HERO SECTION (HIGH IMPACT)
           ============================================ */}
      <section className="pt-32 pb-12 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6">
            Find Trusted Services<br />Near You
          </h2>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Book cleaning, repair, and maintenance services from verified professionals in minutes.
          </p>
          <div className="flex justify-center space-x-4">
            <Button size="lg" className="shadow-xl">
              <span className="mr-2">👥</span> {/* Users Emoji */}
              Book a Service
            </Button>
            <Button variant="secondary" size="lg" className="shadow-xl">
              Become a Provider
              <span className="ml-2">⭐</span> {/* Star Emoji */}
            </Button>
          </div>
        </div>
      </section>

      {/* ============================================
           3. FEATURES SECTION (GRAPHICS DESIGN)
           ============================================ */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h3 className="text-3xl font-bold text-center mb-12 text-slate-900">
            Why Choose Us?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card>
              <div className="flex flex-col items-center text-center p-4">
                <div className="bg-blue-100 p-4 rounded-full mb-4">
                  <span className="text-blue-600 text-2xl">⚡</span> {/* Zap Emoji */}
                </div>
                <h4 className="text-xl font-bold mb-2 text-slate-800">Instant Booking</h4>
                <p className="text-slate-600">Book services in under 60 seconds with our real-time engine.</p>
              </div>
            </Card>
            {/* Feature 2 */}
            <Card>
              <div className="flex flex-col items-center text-center p-4">
                <div className="bg-green-100 p-4 rounded-full mb-4">
                  <span className="text-green-600 text-2xl">✅</span> {/* Check Emoji */}
                </div>
                <h4 className="text-xl font-bold mb-2 text-slate-800">Verified Providers</h4>
                <p className="text-slate-600">All providers are ID-verified and background checked.</p>
              </div>
            </Card>
            {/* Feature 3 */}
            <Card>
              <div className="flex flex-col items-center text-center p-4">
                <div className="bg-purple-100 p-4 rounded-full mb-4">
                  <span className="text-purple-600 text-2xl">📅</span> {/* Calendar Emoji */}
                </div>
                <h4 className="text-xl font-bold mb-2 text-slate-800">Flexible Scheduling</h4>
                <p className="text-slate-600">Choose a time that works for you. Reschedule anytime.</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ============================================
           4. "HOW IT WORKS" (BRIEF & VISUAL)
           ============================================ */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-6">
          <h3 className="text-3xl font-bold text-center mb-12 text-slate-900">How It Works</h3>
          
          <div className="space-y-8 max-w-4xl mx-auto">
            {/* Step 1 */}
            <div className="flex items-start">
              <div className="bg-primary text-white rounded-full flex items-center justify-center h-10 w-10 font-bold text-xl mr-4 shadow-lg flex-shrink-0">
                1
              </div>
              <div>
                <h4 className="text-xl font-bold mb-2 text-slate-800">Describe Your Job</h4>
                <p className="text-slate-600">Select a service category, date, and location.</p>
              </div>
            </div>
            {/* Step 2 */}
            <div className="flex items-start">
              <div className="bg-primary text-white rounded-full flex items-center justify-center h-10 w-10 font-bold text-xl mr-4 shadow-lg flex-shrink-0">
                2
              </div>
              <div>
                <h4 className="text-xl font-bold mb-2 text-slate-800">Match & Book</h4>
                <p className="text-slate-600">Our AI engine matches you with the best provider nearby.</p>
              </div>
            </div>
            {/* Step 3 */}
            <div className="flex items-start">
              <div className="bg-primary text-white rounded-full flex items-center justify-center h-10 w-10 font-bold text-xl mr-4 shadow-lg flex-shrink-0">
                3
              </div>
              <div>
                <h4 className="text-xl font-bold mb-2 text-slate-800">Service Complete</h4>
                <p className="text-slate-600">Provider arrives, completes job, and gets paid automatically.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
           5. FOOTER
           ============================================ */}
      <footer className="bg-slate-900 text-slate-400 py-12 mt-auto">
        <div className="container mx-auto px-6 text-center">
          <p>&copy; 2025 BookYourService. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
