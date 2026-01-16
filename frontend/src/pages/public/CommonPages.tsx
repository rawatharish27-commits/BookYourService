/**
 * Placeholder Public Pages - Help, FAQ, Terms, Privacy, etc.
 */

import React from 'react';
import { Link } from 'react-router-dom';

// Reusable placeholder component
const PlaceholderPage: React.FC<{ title: string; icon: string }> = ({ title, icon }) => (
  <div className="text-center py-20">
    <div className="text-8xl mb-6">{icon}</div>
    <h1 className="text-4xl font-black text-[#0A2540] italic tracking-tighter mb-4">
      {title}
    </h1>
    <p className="text-slate-500 max-w-md mx-auto">
      This page is under construction. Please check back later.
    </p>
    <Link
      to="/"
      className="inline-block mt-8 px-8 py-4 bg-[#0A2540] text-white rounded-[2.5rem] font-bold uppercase text-xs tracking-widest hover:bg-[#0A2540]/90 transition-all"
    >
      Back to Home
    </Link>
  </div>
);

export const Help: React.FC = () => <PlaceholderPage title="Help Center" icon="💬" />;
export const FAQ: React.FC = () => <PlaceholderPage title="FAQ" icon="❓" />;
export const Terms: React.FC = () => <PlaceholderPage title="Terms of Service" icon="📋" />;
export const Privacy: React.FC = () => <PlaceholderPage title="Privacy Policy" icon="🔒" />;
export const Maintenance: React.FC = () => (
  <div className="text-center py-20">
    <div className="text-8xl mb-6">🔧</div>
    <h1 className="text-4xl font-black text-[#0A2540] italic tracking-tighter mb-4">
      Under Maintenance
    </h1>
    <p className="text-slate-500 max-w-md mx-auto mb-8">
      We're performing scheduled maintenance. We'll be back shortly.
    </p>
    <p className="text-xs text-slate-400">Est. time: 30 minutes</p>
  </div>
);
export const NotFound: React.FC = () => (
  <div className="text-center py-20">
    <div className="text-8xl mb-6">404</div>
    <h1 className="text-4xl font-black text-[#0A2540] italic tracking-tighter mb-4">
      Page Not Found
    </h1>
    <p className="text-slate-500 max-w-md mx-auto mb-8">
      The page you're looking for doesn't exist or has been moved.
    </p>
    <Link
      to="/"
      className="inline-block px-8 py-4 bg-[#0A2540] text-white rounded-[2.5rem] font-bold uppercase text-xs tracking-widest hover:bg-[#0A2540]/90 transition-all"
    >
      Go to Home
    </Link>
  </div>
);

// Forgot Password Page
export const ForgotPassword: React.FC = () => (
  <div className="space-y-6">
    <div className="text-center">
      <div className="text-6xl mb-4">🔐</div>
      <h2 className="text-2xl font-black text-[#0A2540] italic">Forgot Password?</h2>
      <p className="text-xs text-slate-400 uppercase tracking-widest mt-2">
        Enter your phone number to reset
      </p>
    </div>

    <div>
      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">
        Phone Number
      </label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">+91</span>
        <input
          type="tel"
          placeholder="Mobile number"
          className="w-full bg-slate-50 border-2 border-slate-100 p-4 pl-14 rounded-2xl font-bold outline-none focus:border-blue-500 transition-all"
        />
      </div>
    </div>

    <button className="w-full py-4 bg-[#0A2540] text-white rounded-[2.5rem] font-black uppercase text-xs tracking-widest shadow-xl">
      Send Reset Link
    </button>
  </div>
);

// Reset Password Page
export const ResetPassword: React.FC = () => (
  <div className="space-y-6">
    <div className="text-center">
      <div className="text-6xl mb-4">🔑</div>
      <h2 className="text-2xl font-black text-[#0A2540] italic">Reset Password</h2>
      <p className="text-xs text-slate-400 uppercase tracking-widest mt-2">
        Enter your new password
      </p>
    </div>

    <div>
      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">
        New Password
      </label>
      <input
        type="password"
        placeholder="Enter new password"
        className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-blue-500 transition-all"
      />
    </div>

    <div>
      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">
        Confirm Password
      </label>
      <input
        type="password"
        placeholder="Confirm password"
        className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-blue-500 transition-all"
      />
    </div>

    <button className="w-full py-4 bg-[#0A2540] text-white rounded-[2.5rem] font-black uppercase text-xs tracking-widest shadow-xl">
      Reset Password
    </button>
  </div>
);

// Verify Email Page
export const VerifyEmail: React.FC = () => (
  <div className="space-y-6">
    <div className="text-center">
      <div className="text-6xl mb-4">📧</div>
      <h2 className="text-2xl font-black text-[#0A2540] italic">Verify Email</h2>
      <p className="text-xs text-slate-400 uppercase tracking-widest mt-2">
        We've sent a verification link
      </p>
    </div>

    <div className="bg-slate-50 rounded-[2rem] p-6 text-center">
      <p className="text-sm text-slate-600">
        Please check your email and click the verification link to activate your account.
      </p>
    </div>

    <button className="w-full py-4 bg-[#0A2540] text-white rounded-[2.5rem] font-black uppercase text-xs tracking-widest shadow-xl">
      Resend Email
    </button>
  </div>
);

export default {
  Help,
  FAQ,
  Terms,
  Privacy,
  Maintenance,
  NotFound,
  ForgotPassword,
  ResetPassword,
  VerifyEmail
};

