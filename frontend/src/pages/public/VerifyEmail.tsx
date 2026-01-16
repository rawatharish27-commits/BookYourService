/**
 * Verify Email Page
 */
import React from 'react';

const VerifyEmail: React.FC = () => (
  <div className="space-y-6">
    <div className="text-center">
      <div className="text-6xl mb-4">📧</div>
      <h2 className="text-2xl font-black text-[#0A2540] italic">Verify Email</h2>
      <p className="text-xs text-slate-400 uppercase tracking-widest mt-2">We've sent a verification link</p>
    </div>

    <div className="bg-slate-50 rounded-[2rem] p-6 text-center">
      <p className="text-sm text-slate-600">Please check your email and click the verification link to activate your account.</p>
    </div>

    <button className="w-full py-4 bg-[#0A2540] text-white rounded-[2.5rem] font-black uppercase text-xs tracking-widest shadow-xl">Resend Email</button>
  </div>
);

export default VerifyEmail;

