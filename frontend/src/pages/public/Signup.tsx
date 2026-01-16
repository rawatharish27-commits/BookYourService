/**
 * Signup Page - New user registration
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserRole } from '../../types';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'role' | 'details' | 'otp'>('role');
  const [role, setRole] = useState<UserRole>(UserRole.USER);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setStep('details');
  };

  const handleSubmitDetails = async () => {
    if (!name || !phone) return;
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setStep('otp');
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (role === UserRole.USER) navigate('/customer/dashboard');
    else if (role === UserRole.PROVIDER) navigate('/provider/dashboard');
    else navigate('/admin/dashboard');
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      {/* Step 1: Select Role */}
      {step === 'role' && (
        <>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-black text-[#0A2540] italic">Create Account</h2>
            <p className="text-xs text-slate-400 uppercase tracking-widest mt-2">Choose your account type</p>
          </div>

          <div className="space-y-4">
            {[
              { role: UserRole.USER, icon: '👤', title: 'Customer', desc: 'Book services for your home' },
              { role: UserRole.PROVIDER, icon: '👨‍🔧', title: 'Service Partner', desc: 'Offer your services & earn' }
            ].map((option) => (
              <button
                key={option.role}
                onClick={() => handleRoleSelect(option.role)}
                className="w-full p-6 bg-slate-50 rounded-[2rem] text-left hover:bg-blue-50 hover:border-blue-200 border-2 border-transparent transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#0A2540] rounded-[1.5rem] flex items-center justify-center text-2xl text-white group-hover:bg-blue-600 transition-all">
                    {option.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#0A2540]">{option.title}</h3>
                    <p className="text-xs text-slate-400">{option.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Step 2: Enter Details */}
      {step === 'details' && (
        <>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-black text-[#0A2540] italic">Your Details</h2>
            <p className="text-xs text-slate-400 uppercase tracking-widest mt-2">We'll verify your identity</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Full Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Phone Number</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">+91</span>
                <input
                  type="tel"
                  placeholder="Mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 p-4 pl-14 rounded-2xl font-bold outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Email (Optional)</label>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <button
            onClick={handleSubmitDetails}
            disabled={loading || !name || !phone}
            className="w-full py-4 bg-[#0A2540] text-white rounded-[2.5rem] font-black uppercase text-xs tracking-widest shadow-xl hover:bg-[#0A2540]/90 transition-all disabled:opacity-50"
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </>
      )}

      {/* Step 3: Verify OTP */}
      {step === 'otp' && (
        <>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-black text-[#0A2540] italic">Verify Phone</h2>
            <p className="text-xs text-slate-400 uppercase tracking-widest mt-2">Enter the OTP sent to +91 {phone}</p>
          </div>

          <input
            type="text"
            placeholder="4-digit OTP"
            maxLength={4}
            className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-black text-center text-2xl tracking-[1em] outline-none focus:border-blue-500 transition-all mb-4"
          />

          <button
            onClick={handleVerifyOtp}
            disabled={loading}
            className="w-full py-4 bg-blue-500 text-white rounded-[2.5rem] font-black uppercase text-xs tracking-widest shadow-xl hover:bg-blue-600 transition-all disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </>
      )}

      {/* Back Button */}
      {step !== 'role' && (
        <button
          onClick={() => setStep(step === 'otp' ? 'details' : 'role')}
          className="w-full py-3 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-600"
        >
          ← Back
        </button>
      )}
    </div>
  );
};

export default Signup;

