/**
 * PublicLayout - Landing, legal, help pages
 * No authentication required
 */

import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

const PublicLayout: React.FC = () => {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Transparent on landing, solid on other pages */}
      <header className={`${isLandingPage ? 'absolute top-0 left-0 right-0 z-50' : 'bg-white border-b border-slate-100'} px-6 py-4`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#0A2540] rounded-xl flex items-center justify-center text-white text-xl font-black italic">
              D
            </div>
            <span className="text-2xl font-black text-[#0A2540] italic tracking-tighter">
              DOORSTEP<span className="text-blue-500">PRO</span>
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/services" className="text-sm font-bold text-slate-600 hover:text-[#0A2540] transition-colors">
              Services
            </Link>
            <Link to="/about" className="text-sm font-bold text-slate-600 hover:text-[#0A2540] transition-colors">
              About
            </Link>
            <Link to="/help" className="text-sm font-bold text-slate-600 hover:text-[#0A2540] transition-colors">
              Help
            </Link>
            <Link to="/faq" className="text-sm font-bold text-slate-600 hover:text-[#0A2540] transition-colors">
              FAQ
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            <Link 
              to="/login" 
              className="px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-[#0A2540] transition-colors"
            >
              Login
            </Link>
            <Link 
              to="/signup" 
              className="px-6 py-2.5 bg-[#0A2540] text-white rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-[#0A2540]/90 transition-all shadow-lg"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-[#0A2540] text-white px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#0A2540] text-xl font-black italic">
                  D
                </div>
                <span className="text-2xl font-black italic tracking-tighter">
                  DOORSTEP<span className="text-blue-400">PRO</span>
                </span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Professional home services at your doorstep. Quality assured, transparent pricing, and customer first.
              </p>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-bold uppercase tracking-widest text-xs mb-6 text-slate-400">Services</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/services/electrical" className="text-slate-300 hover:text-white transition-colors">Electrical</Link></li>
                <li><Link to="/services/plumbing" className="text-slate-300 hover:text-white transition-colors">Plumbing</Link></li>
                <li><Link to="/services/ac-repair" className="text-slate-300 hover:text-white transition-colors">AC Repair</Link></li>
                <li><Link to="/services/cleaning" className="text-slate-300 hover:text-white transition-colors">Cleaning</Link></li>
                <li><Link to="/services" className="text-slate-300 hover:text-white transition-colors">View All</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-bold uppercase tracking-widest text-xs mb-6 text-slate-400">Company</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/about" className="text-slate-300 hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/careers" className="text-slate-300 hover:text-white transition-colors">Careers</Link></li>
                <li><Link to="/blog" className="text-slate-300 hover:text-white transition-colors">Blog</Link></li>
                <li><Link to="/press" className="text-slate-300 hover:text-white transition-colors">Press</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-bold uppercase tracking-widest text-xs mb-6 text-slate-400">Support</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/help" className="text-slate-300 hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to="/faq" className="text-slate-300 hover:text-white transition-colors">FAQs</Link></li>
                <li><Link to="/contact" className="text-slate-300 hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link to="/terms" className="text-slate-300 hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link to="/privacy" className="text-slate-300 hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-slate-700 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-400 text-xs">
              © 2024 DoorstepPro. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;

