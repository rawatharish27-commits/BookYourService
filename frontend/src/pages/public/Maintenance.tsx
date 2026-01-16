/**
 * Maintenance Page
 */
import React from 'react';

const Maintenance: React.FC = () => (
  <div className="text-center py-20">
    <div className="text-8xl mb-6">🔧</div>
    <h1 className="text-4xl font-black text-[#0A2540] italic tracking-tighter mb-4">Under Maintenance</h1>
    <p className="text-slate-500 max-w-md mx-auto mb-8">We're performing scheduled maintenance. We'll be back shortly.</p>
    <p className="text-xs text-slate-400">Est. time: 30 minutes</p>
  </div>
);

export default Maintenance;

