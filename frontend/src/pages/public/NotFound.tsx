/**
 * Not Found Page (404)
 */
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => (
  <div className="text-center py-20">
    <div className="text-8xl mb-6">404</div>
    <h1 className="text-4xl font-black text-[#0A2540] italic tracking-tighter mb-4">Page Not Found</h1>
    <p className="text-slate-500 max-w-md mx-auto mb-8">The page you're looking for doesn't exist or has been moved.</p>
    <Link to="/" className="inline-block px-8 py-4 bg-[#0A2540] text-white rounded-[2.5rem] font-bold uppercase text-xs tracking-widest hover:bg-[#0A2540]/90 transition-all">Go to Home</Link>
  </div>
);

export default NotFound;

