/**
 * Reset Password Page
 */
import React from 'react';

const ResetPassword: React.FC = () => (
  <div className="space-y-6">
    <div className="text-center">
      <div className="text-6xl mb-4">🔑</div>
      <h2 className="text-2xl font-black text-[#0A2540] italic">Reset Password</h2>
      <p className="text-xs text-slate-400 uppercase tracking-widest mt-2">Enter your new password</p>
    </div>

    <div>
      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">New Password</label>
      <input type="password" placeholder="Enter new password"
        className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-blue-500 transition-all" />
    </div>

    <div>
      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Confirm Password</label>
      <input type="password" placeholder="Confirm password"
        className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-blue-500 transition-all" />
    </div>

    <button className="w-full py-4 bg-[#0A2540] text-white rounded-[2.5rem] font-black uppercase text-xs tracking-widest shadow-xl">Reset Password</button>
  </div>
);

export default ResetPassword;

