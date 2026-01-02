
import React, { useState } from 'react';
import { UserRole } from '../types';
import { auth } from '../services/AuthService';

interface AuthModuleProps {
  onLogin: (user: any, token: string) => void;
}

const AuthModule: React.FC<AuthModuleProps> = ({ onLogin }) => {
  const [role, setRole] = useState<UserRole>(UserRole.USER);
  const [step, setStep] = useState<'select' | 'admin-login' | 'customer-signup' | 'customer-verify' | 'customer-login' | 'provider-signup' | 'provider-upload' | 'provider-login'>('select');

  // Admin login state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Customer states
  const [customerSignup, setCustomerSignup] = useState({ name: '', email: '', phone: '', password: '' });
  const [customerVerify, setCustomerVerify] = useState({ userId: '', emailOtp: '', phoneOtp: '' });
  const [customerLogin, setCustomerLogin] = useState({ email: '', password: '' });

  // Provider states
  const [providerSignup, setProviderSignup] = useState({ name: '', email: '', phone: '', password: '', businessName: '', address: '', category: '' });
  const [providerLogin, setProviderLogin] = useState({ email: '', password: '' });

  const handleAdminLogin = async () => {
    const result = await auth.adminLogin(adminEmail, adminPassword);
    if (result) {
      onLogin(result.user, result.token);
    } else {
      alert('Invalid credentials');
    }
  };

  const handleCustomerSignup = async () => {
    const result = await auth.customerSignup(customerSignup);
    if (result.success && result.user) {
      setCustomerVerify({ ...customerVerify, userId: result.user.id });
      setStep('customer-verify');
    } else {
      alert(result.message);
    }
  };

  const handleCustomerVerify = async () => {
    const result = await auth.verifyCustomer(customerVerify.userId, customerVerify.emailOtp, customerVerify.phoneOtp);
    if (result.success) {
      setStep('customer-login');
    } else {
      alert(result.message);
    }
  };

  const handleCustomerLogin = async () => {
    const result = await auth.customerLogin(customerLogin.email, customerLogin.password);
    if (result) {
      onLogin(result.user, result.token);
    } else {
      alert('Invalid credentials or account not verified');
    }
  };

  const handleProviderSignup = async () => {
    const result = await auth.providerSignup(providerSignup);
    if (result.success && result.user) {
      setStep('provider-upload');
    } else {
      alert(result.message);
    }
  };

  const handleProviderUpload = async () => {
    // Simulate document upload
    const result = await auth.uploadProviderDocuments('temp', {}); // Need userId
    if (result.success) {
      alert('Documents uploaded. Awaiting admin approval.');
      setStep('provider-login');
    } else {
      alert(result.message);
    }
  };

  const handleProviderLogin = async () => {
    const result = await auth.providerLogin(providerLogin.email, providerLogin.password);
    if (result) {
      onLogin(result.user, result.token);
    } else {
      alert('Invalid credentials or account not approved');
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
            <button onClick={() => { setRole(UserRole.ADMIN); setStep('admin-login'); }} className="w-full bg-[#0A2540] text-white py-4 rounded-[2rem] font-black uppercase text-sm tracking-widest">Admin Login</button>
            <button onClick={() => { setRole(UserRole.USER); setStep('customer-signup'); }} className="w-full bg-blue-600 text-white py-4 rounded-[2rem] font-black uppercase text-sm tracking-widest">Customer Signup</button>
            <button onClick={() => { setRole(UserRole.PROVIDER); setStep('provider-signup'); }} className="w-full bg-green-600 text-white py-4 rounded-[2rem] font-black uppercase text-sm tracking-widest">Service Provider Signup</button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'admin-login') {
    return (
      <div className="min-h-screen bg-[#0A2540] flex flex-col items-center justify-center p-6">
        <div className="bg-white w-full max-w-md rounded-[4rem] p-12 shadow-3xl space-y-10 animate-slideUp">
          <div className="text-center">
            <h1 className="text-4xl font-black text-[#0A2540] tracking-tighter italic uppercase leading-none">Admin<br/><span className="text-blue-500">Login</span></h1>
          </div>
          <div className="space-y-6">
            <input type="email" placeholder="Admin Email" className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-3xl font-bold text-[#0A2540]" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} />
            <input type="password" placeholder="Password" className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-3xl font-bold text-[#0A2540]" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} />
            <button onClick={handleAdminLogin} className="w-full bg-[#0A2540] text-white py-4 rounded-[2rem] font-black uppercase text-sm tracking-widest">Login</button>
            <button onClick={() => setStep('select')} className="w-full text-slate-400 text-sm font-bold uppercase">Back</button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'customer-signup') {
    return (
      <div className="min-h-screen bg-[#0A2540] flex flex-col items-center justify-center p-6">
        <div className="bg-white w-full max-w-md rounded-[4rem] p-12 shadow-3xl space-y-10 animate-slideUp">
          <div className="text-center">
            <h1 className="text-4xl font-black text-[#0A2540] tracking-tighter italic uppercase leading-none">Customer<br/><span className="text-blue-500">Signup</span></h1>
          </div>
          <div className="space-y-4">
            <input type="text" placeholder="Full Name" className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-3xl font-bold text-[#0A2540]" value={customerSignup.name} onChange={e => setCustomerSignup({ ...customerSignup, name: e.target.value })} />
            <input type="email" placeholder="Email" className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-3xl font-bold text-[#0A2540]" value={customerSignup.email} onChange={e => setCustomerSignup({ ...customerSignup, email: e.target.value })} />
            <input type="tel" placeholder="Phone" className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-3xl font-bold text-[#0A2540]" value={customerSignup.phone} onChange={e => setCustomerSignup({ ...customerSignup, phone: e.target.value })} />
            <input type="password" placeholder="Password" className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-3xl font-bold text-[#0A2540]" value={customerSignup.password} onChange={e => setCustomerSignup({ ...customerSignup, password: e.target.value })} />
            <button onClick={handleCustomerSignup} className="w-full bg-blue-600 text-white py-4 rounded-[2rem] font-black uppercase text-sm tracking-widest">Signup</button>
            <button onClick={() => setStep('select')} className="w-full text-slate-400 text-sm font-bold uppercase">Back</button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'customer-verify') {
    return (
      <div className="min-h-screen bg-[#0A2540] flex flex-col items-center justify-center p-6">
        <div className="bg-white w-full max-w-md rounded-[4rem] p-12 shadow-3xl space-y-10 animate-slideUp">
          <div className="text-center">
            <h1 className="text-4xl font-black text-[#0A2540] tracking-tighter italic uppercase leading-none">Verify<br/><span className="text-blue-500">Account</span></h1>
          </div>
          <div className="space-y-4">
            <input type="text" placeholder="Email OTP (1234)" className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-3xl font-bold text-center text-[#0A2540]" value={customerVerify.emailOtp} onChange={e => setCustomerVerify({ ...customerVerify, emailOtp: e.target.value })} />
            <input type="text" placeholder="Phone OTP (1234)" className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-3xl font-bold text-center text-[#0A2540]" value={customerVerify.phoneOtp} onChange={e => setCustomerVerify({ ...customerVerify, phoneOtp: e.target.value })} />
            <button onClick={handleCustomerVerify} className="w-full bg-blue-600 text-white py-4 rounded-[2rem] font-black uppercase text-sm tracking-widest">Verify</button>
            <button onClick={() => setStep('customer-signup')} className="w-full text-slate-400 text-sm font-bold uppercase">Back</button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'customer-login') {
    return (
      <div className="min-h-screen bg-[#0A2540] flex flex-col items-center justify-center p-6">
        <div className="bg-white w-full max-w-md rounded-[4rem] p-12 shadow-3xl space-y-10 animate-slideUp">
          <div className="text-center">
            <h1 className="text-4xl font-black text-[#0A2540] tracking-tighter italic uppercase leading-none">Customer<br/><span className="text-blue-500">Login</span></h1>
          </div>
          <div className="space-y-4">
            <input type="email" placeholder="Email" className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-3xl font-bold text-[#0A2540]" value={customerLogin.email} onChange={e => setCustomerLogin({ ...customerLogin, email: e.target.value })} />
            <input type="password" placeholder="Password" className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-3xl font-bold text-[#0A2540]" value={customerLogin.password} onChange={e => setCustomerLogin({ ...customerLogin, password: e.target.value })} />
            <button onClick={handleCustomerLogin} className="w-full bg-blue-600 text-white py-4 rounded-[2rem] font-black uppercase text-sm tracking-widest">Login</button>
            <button onClick={() => setStep('select')} className="w-full text-slate-400 text-sm font-bold uppercase">Back</button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'provider-signup') {
    return (
      <div className="min-h-screen bg-[#0A2540] flex flex-col items-center justify-center p-6">
        <div className="bg-white w-full max-w-md rounded-[4rem] p-12 shadow-3xl space-y-10 animate-slideUp">
          <div className="text-center">
            <h1 className="text-4xl font-black text-[#0A2540] tracking-tighter italic uppercase leading-none">Provider<br/><span className="text-blue-500">Signup</span></h1>
          </div>
          <div className="space-y-4">
            <input type="text" placeholder="Full Name" className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-3xl font-bold text-[#0A2540]" value={providerSignup.name} onChange={e => setProviderSignup({ ...providerSignup, name: e.target.value })} />
            <input type="email" placeholder="Email" className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-3xl font-bold text-[#0A2540]" value={providerSignup.email} onChange={e => setProviderSignup({ ...providerSignup, email: e.target.value })} />
            <input type="tel" placeholder="Phone" className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-3xl font-bold text-[#0A2540]" value={providerSignup.phone} onChange={e => setProviderSignup({ ...providerSignup, phone: e.target.value })} />
            <input type="password" placeholder="Password" className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-3xl font-bold text-[#0A2540]" value={providerSignup.password} onChange={e => setProviderSignup({ ...providerSignup, password: e.target.value })} />
            <input type="text" placeholder="Business Name" className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-3xl font-bold text-[#0A2540]" value={providerSignup.businessName} onChange={e => setProviderSignup({ ...providerSignup, businessName: e.target.value })} />
            <input type="text" placeholder="Address" className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-3xl font-bold text-[#0A2540]" value={providerSignup.address} onChange={e => setProviderSignup({ ...providerSignup, address: e.target.value })} />
            <input type="text" placeholder="Service Category" className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-3xl font-bold text-[#0A2540]" value={providerSignup.category} onChange={e => setProviderSignup({ ...providerSignup, category: e.target.value })} />
            <button onClick={handleProviderSignup} className="w-full bg-green-600 text-white py-4 rounded-[2rem] font-black uppercase text-sm tracking-widest">Signup</button>
            <button onClick={() => setStep('select')} className="w-full text-slate-400 text-sm font-bold uppercase">Back</button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'provider-upload') {
    return (
      <div className="min-h-screen bg-[#0A2540] flex flex-col items-center justify-center p-6">
        <div className="bg-white w-full max-w-md rounded-[4rem] p-12 shadow-3xl space-y-10 animate-slideUp">
          <div className="text-center">
            <h1 className="text-4xl font-black text-[#0A2540] tracking-tighter italic uppercase leading-none">Upload<br/><span className="text-blue-500">Documents</span></h1>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">Upload ID Proof, Address Proof, Certificates, GST (optional)</p>
            <input type="file" multiple className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-3xl font-bold text-[#0A2540]" />
            <button onClick={handleProviderUpload} className="w-full bg-green-600 text-white py-4 rounded-[2rem] font-black uppercase text-sm tracking-widest">Upload & Continue</button>
            <button onClick={() => setStep('provider-signup')} className="w-full text-slate-400 text-sm font-bold uppercase">Back</button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'provider-login') {
    return (
      <div className="min-h-screen bg-[#0A2540] flex flex-col items-center justify-center p-6">
        <div className="bg-white w-full max-w-md rounded-[4rem] p-12 shadow-3xl space-y-10 animate-slideUp">
          <div className="text-center">
            <h1 className="text-4xl font-black text-[#0A2540] tracking-tighter italic uppercase leading-none">Provider<br/><span className="text-blue-500">Login</span></h1>
          </div>
          <div className="space-y-4">
            <input type="email" placeholder="Email" className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-3xl font-bold text-[#0A2540]" value={providerLogin.email} onChange={e => setProviderLogin({ ...providerLogin, email: e.target.value })} />
            <input type="password" placeholder="Password" className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-3xl font-bold text-[#0A2540]" value={providerLogin.password} onChange={e => setProviderLogin({ ...providerLogin, password: e.target.value })} />
            <button onClick={handleProviderLogin} className="w-full bg-green-600 text-white py-4 rounded-[2rem] font-black uppercase text-sm tracking-widest">Login</button>
            <button onClick={() => setStep('select')} className="w-full text-slate-400 text-sm font-bold uppercase">Back</button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthModule;
