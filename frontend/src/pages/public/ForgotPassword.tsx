/**
 * Forgot Password Page
 */
import React, { useState } from 'react';

const ForgotPassword: React.FC = () => {
  const [phone, setPhone] = useState('');

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-6xl mb-4">🔐</div>
        <h2 className="text-2xl font-black text-[#0A2540] italic">Forgot Password?</h2>
        <p className="text-xs text-slate-400 uppercase tracking-widest mt-2">Enter your phone number to reset</p>
      </div>

      <div>
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Phone Number</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">+91</span>
          <input type="tel" placeholder="Mobile number" value={phone} onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-slate-50 border-2 border-slate-100 p-4 pl-14 rounded-2xl font-bold outline-none focus:border-blue-500 transition-all" />
        </div>
      </div>

      <button className="w-full py-4 bg-[#0A2540] text-white rounded-[2.5rem] font-black uppercase text-xs tracking-widest shadow-xl">Send Reset Link</button>
    </div>
  );
};

export default ForgotPassword;

