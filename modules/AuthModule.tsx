
import React, { useState } from 'react';
import { UserRole } from '../types';
import { auth } from '../services/AuthService';

interface AuthModuleProps {
  onLogin: (user: any, token: string) => void;
}

const AuthModule: React.FC<AuthModuleProps> = ({ onLogin }) => {
  const [role, setRole] = useState<UserRole>(UserRole.USER);
  const [step, setStep] = useState<'select' | 'login' | 'register' | 'verify' | 'forgot-password' | 'reset-password'>('select');

  // Login state
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  // Register state
  const [registerData, setRegisterData] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    password: '',
    businessName: '',
    address: '',
    category: ''
  });

  // Verify state
  const [verifyData, setVerifyData] = useState({ userId: '', emailOtp: '', phoneOtp: '' });

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleLogin = async () => {
    let result;
    if (role === UserRole.ADMIN) {
      result = await auth.adminLogin(loginData.email, loginData.password);
    } else if (role === UserRole.USER) {
      result = await auth.customerLogin(loginData.email, loginData.password);
    } else if (role === UserRole.PROVIDER) {
      result = await auth.providerLogin(loginData.email, loginData.password);
    }

    if (result) {
      onLogin(result.user, result.token);
    } else {
      alert('Invalid credentials or account not verified/approved');
    }
  };

  const handleRegister = async () => {
    let result;
    if (role === UserRole.USER) {
      result = await auth.customerSignup({
        name: registerData.name,
        email: registerData.email,
        phone: registerData.phone,
        password: registerData.password
      });
    } else if (role === UserRole.PROVIDER) {
      result = await auth.providerSignup({
        name: registerData.name,
        email: registerData.email,
        phone: registerData.phone,
        password: registerData.password,
        businessName: registerData.businessName,
        address: registerData.address,
        category: registerData.category
      });
      
      // For providers, auto-upload documents for demo
      if (result?.success && result.user) {
        await auth.uploadProviderDocuments(result.user.id, {});
        await auth.approveProvider(result.user.id);
      }
    }

    if (result?.success && result.user) {
      if (role === UserRole.USER) {
        setVerifyData({ ...verifyData, userId: result.user.id });
        setStep('verify');
      } else {
        // Provider is auto-approved
        alert('Provider account created and approved! You can now login.');
        setStep('login');
      }
    } else {
      alert(result?.message || 'Registration failed');
    }
  };

  const handleVerify = async () => {
    const result = await auth.verifyCustomer(verifyData.userId, verifyData.emailOtp, verifyData.phoneOtp);
    if (result.success) {
      alert('Verification successful! You can now login.');
      setStep('login');
    } else {
      alert(result.message);
    }
  };

  const handleForgotPassword = async () => {
    const result = await auth.forgotPassword(forgotEmail);
    if (result.success) {
      alert('Reset instructions sent to your email. Check console for demo token.');
      setResetToken(result.resetToken || '');
      setStep('reset-password');
    } else {
      alert(result.message);
    }
  };

  const handleResetPassword = async () => {
    const result = await auth.resetPassword(resetToken, newPassword);
    if (result.success) {
      alert('Password reset successfully! You can now login.');
      setStep('login');
    } else {
      alert(result.message);
    }
  };

  if (step === 'select') {
    return (
      <div className="min-h-screen bg-[#0A2540] flex flex-col items-center justify-center p-6">
        <div className="bg-white w-full max-w-md rounded-[4rem] p-12 shadow-3xl space-y-10 animate-slideUp">
          <div className="text-center">
            <h1 className="text-4xl font-black text-[#0A2540] tracking-tighter italic uppercase leading-none">DoorStep<br/><span className="text-blue-500">Pro</span></h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Select Your Role</p>
          </div>
          <div className="space-y-4">
            <button onClick={() => { setRole(UserRole.ADMIN); setStep('login'); }} className="w-full bg-[#0A2540] text-white py-4 rounded-[2rem] font-black uppercase text-sm tracking-widest">Admin Login</button>
            <button onClick={() => { setRole(UserRole.USER); setStep('login'); }} className="w-full bg-blue-600 text-white py-4 rounded-[2rem] font-black uppercase text-sm tracking-widest">Customer</button>
            <button onClick={() => { setRole(UserRole.PROVIDER); setStep('login'); }} className="w-full bg-green-600 text-white py-4 rounded-[2rem] font-black uppercase text-sm tracking-widest">Service Provider</button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'login') {
    const roleName = role === UserRole.ADMIN ? 'Admin' : role === UserRole.USER ? 'Customer' : 'Provider';
    const buttonColor = role === UserRole.ADMIN ? '#0A2540' : role === UserRole.USER ? 'blue-600' : 'green-600';
    
    return (
      <div className="min-h-screen bg-[#0A2540] flex flex-col items-center justify-center p-6">
        <div className="bg-white w-full max-w-md rounded-[4rem] p-12 shadow-3xl space-y-10 animate-slideUp">
          <div className="text-center">
            <h1 className="text-4xl font-black text-[#0A2540] tracking-tighter italic uppercase leading-none">{roleName}<br/><span className="text-blue-500">Login</span></h1>
          </div>
          <div className="space-y-4">
            <input 
              type="email" 
              placeholder="Email" 
              className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-3xl font-bold text-[#0A2540]" 
              value={loginData.email} 
              onChange={e => setLoginData({ ...loginData, email: e.target.value })} 
            />
            <input 
              type="password" 
              placeholder="Password" 
              className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-3xl font-bold text-[#0A2540]" 
              value={loginData.password} 
              onChange={e => setLoginData({ ...loginData, password: e.target.value })} 
            />
            <button 
              onClick={handleLogin} 
              className={`w-full bg-${buttonColor} text-white py-4 rounded-[2rem] font-black uppercase text-sm tracking-widest`}
            >
              Login
            </button>
            {role !== UserRole.ADMIN && (
              <button 
                onClick={() => setStep('register')} 
                className="w-full text-slate-400 text-sm font-bold uppercase"
              >
                Don't have an account? Register
              </button>
            )}
            {role !== UserRole.ADMIN && (
              <button 
                onClick={() => setStep('forgot-password')} 
                className="w-full text-slate-400 text-sm font-bold uppercase"
              >
                Forgot Password?
              </button>
            )}
            <button onClick={() => setStep('select')} className="w-full text-slate-400 text-sm font-bold uppercase">Back</button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'register') {
    const roleName = role === UserRole.USER ? 'Customer' : 'Provider';
    const buttonColor = role === UserRole.USER ? 'blue-600' : 'green-600';
    
    return (
      <div className="min-h-screen bg-[#0A2540] flex flex-col items-center justify-center p-6">
        <div className="bg-white w-full max-w-md rounded-[4rem] p-12 shadow-3xl space-y-10 animate-slideUp">
          <div className="text-center">
            <h1 className="text-4xl font-black text-[#0A2540] tracking-tighter italic uppercase leading-none">{roleName}<br/><span className="text-blue-500">Register</span></h1>
          </div>
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Full Name" 
              className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-3xl font-bold text-[#0A2540]" 
              value={registerData.name} 
              onChange={e => setRegisterData({ ...registerData, name: e.target.value })} 
            />
            <input 
              type="email" 
              placeholder="Email" 
              className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-3xl font-bold text-[#0A2540]" 
              value={registerData.email} 
              onChange={e => setRegisterData({ ...registerData, email: e.target.value })} 
            />
            <input 
              type="tel" 
              placeholder="Phone" 
              className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-3xl font-bold text-[#0A2540]" 
              value={registerData.phone} 
              onChange={e => setRegisterData({ ...registerData, phone: e.target.value })} 
            />
            <input 
              type="password" 
              placeholder="Password" 
              className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-3xl font-bold text-[#0A2540]" 
              value={registerData.password} 
              onChange={e => setRegisterData({ ...registerData, password: e.target.value })} 
            />
            {role === UserRole.PROVIDER && (
              <>
                <input 
                  type="text" 
                  placeholder="Business Name" 
                  className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-3xl font-bold text-[#0A2540]" 
                  value={registerData.businessName} 
                  onChange={e => setRegisterData({ ...registerData, businessName: e.target.value })} 
                />
                <input 
                  type="text" 
                  placeholder="Address" 
                  className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-3xl font-bold text-[#0A2540]" 
                  value={registerData.address} 
                  onChange={e => setRegisterData({ ...registerData, address: e.target.value })} 
                />
                <input 
                  type="text" 
                  placeholder="Service Category" 
                  className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-3xl font-bold text-[#0A2540]" 
                  value={registerData.category} 
                  onChange={e => setRegisterData({ ...registerData, category: e.target.value })} 
                />
              </>
            )}
            <button 
              onClick={handleRegister} 
              className={`w-full bg-${buttonColor} text-white py-4 rounded-[2rem] font-black uppercase text-sm tracking-widest`}
            >
              Register
            </button>
            <button onClick={() => setStep('login')} className="w-full text-slate-400 text-sm font-bold uppercase">Back to Login</button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'verify') {
    return (
      <div className="min-h-screen bg-[#0A2540] flex flex-col items-center justify-center p-6">
        <div className="bg-white w-full max-w-md rounded-[4rem] p-12 shadow-3xl space-y-10 animate-slideUp">
          <div className="text-center">
            <h1 className="text-4xl font-black text-[#0A2540] tracking-tighter italic uppercase leading-none">Verify<br/><span className="text-blue-500">Account</span></h1>
          </div>
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Email OTP (1234)" 
              className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-3xl font-bold text-center text-[#0A2540]" 
              value={verifyData.emailOtp} 
              onChange={e => setVerifyData({ ...verifyData, emailOtp: e.target.value })} 
            />
            <input 
              type="text" 
              placeholder="Phone OTP (1234)" 
              className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-3xl font-bold text-center text-[#0A2540]" 
              value={verifyData.phoneOtp} 
              onChange={e => setVerifyData({ ...verifyData, phoneOtp: e.target.value })} 
            />
            <button onClick={handleVerify} className="w-full bg-blue-600 text-white py-4 rounded-[2rem] font-black uppercase text-sm tracking-widest">Verify</button>
            <button onClick={() => setStep('register')} className="w-full text-slate-400 text-sm font-bold uppercase">Back</button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'forgot-password') {
    return (
      <div className="min-h-screen bg-[#0A2540] flex flex-col items-center justify-center p-6">
        <div className="bg-white w-full max-w-md rounded-[4rem] p-12 shadow-3xl space-y-10 animate-slideUp">
          <div className="text-center">
            <h1 className="text-4xl font-black text-[#0A2540] tracking-tighter italic uppercase leading-none">Forgot<br/><span className="text-blue-500">Password</span></h1>
            <p className="text-sm text-slate-600 mt-2">Enter your email to reset your password</p>
          </div>
          <div className="space-y-4">
            <input 
              type="email" 
              placeholder="Email" 
              className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-3xl font-bold text-[#0A2540]" 
              value={forgotEmail} 
              onChange={e => setForgotEmail(e.target.value)} 
            />
            <button onClick={handleForgotPassword} className="w-full bg-blue-600 text-white py-4 rounded-[2rem] font-black uppercase text-sm tracking-widest">Send Reset Code</button>
            <button onClick={() => setStep('login')} className="w-full text-slate-400 text-sm font-bold uppercase">Back to Login</button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'reset-password') {
    return (
      <div className="min-h-screen bg-[#0A2540] flex flex-col items-center justify-center p-6">
        <div className="bg-white w-full max-w-md rounded-[4rem] p-12 shadow-3xl space-y-10 animate-slideUp">
          <div className="text-center">
            <h1 className="text-4xl font-black text-[#0A2540] tracking-tighter italic uppercase leading-none">Reset<br/><span className="text-blue-500">Password</span></h1>
            <p className="text-sm text-slate-600 mt-2">Enter the reset token and new password</p>
          </div>
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Reset Token" 
              className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-3xl font-bold text-[#0A2540]" 
              value={resetToken} 
              onChange={e => setResetToken(e.target.value)} 
            />
            <input 
              type="password" 
              placeholder="New Password" 
              className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-3xl font-bold text-[#0A2540]" 
              value={newPassword} 
              onChange={e => setNewPassword(e.target.value)} 
            />
            <button onClick={handleResetPassword} className="w-full bg-blue-600 text-white py-4 rounded-[2rem] font-black uppercase text-sm tracking-widest">Reset Password</button>
            <button onClick={() => setStep('forgot-password')} className="w-full text-slate-400 text-sm font-bold uppercase">Back</button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthModule;
