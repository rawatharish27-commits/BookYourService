
import React, { useState, useEffect } from 'react';
import { UserRole, User } from './types';
import { auth } from './AuthService';
import UserModule from './components/UserModule';
import ProviderModule from './components/ProviderModule';
import AdminModule from './components/AdminModule';
import AIAssistant from './components/AIAssistant';
import { generateProblems } from './constants';

const App: React.FC = () => {
  const [session, setSession] = useState<{ user: User; token: string } | null>(null);
  const [problems] = useState(generateProblems());
  const [view, setView] = useState<'login' | 'app'>('login');

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.USER);
  const [step, setStep] = useState<'phone' | 'otp'>('phone');

  useEffect(() => {
    const existing = auth.getSession();
    if (existing) {
      setSession(existing);
      setView('app');
    }
  }, []);

  const handleSendOtp = async () => {
    await auth.sendOtp(phone);
    setStep('otp');
  };

  const handleVerify = async () => {
    const res = await auth.verifyOtp(phone, otp, role);
    if (res) {
      setSession(res);
      setView('app');
    } else {
      alert("Invalid OTP (Hint: 1234)");
    }
  };

  const handleLogout = () => {
    auth.logout();
    setSession(null);
    setView('login');
    setStep('phone');
  };

  if (view === 'login') {
    return (
      <div className="min-h-screen bg-[#0A2540] flex items-center justify-center p-6 relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[150px] rounded-full"></div>

        <div className="bg-white w-full max-w-md rounded-[4rem] p-12 shadow-2xl space-y-10 relative z-10 border border-white/20">
          <div className="text-center">
            <h1 className="text-4xl font-black text-[#0A2540] tracking-tighter italic">
              DOORSTEP<span className="text-blue-500">PRO</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-3">Enterprise Gateway</p>
          </div>

          {step === 'phone' ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-400 px-2 tracking-widest">Portal Access</label>
                <select 
                  className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-3xl font-bold text-slate-900 appearance-none" 
                  value={role} 
                  onChange={e => setRole(e.target.value as UserRole)}
                >
                  <option value={UserRole.USER}>Customer Hub</option>
                  <option value={UserRole.PROVIDER}>Service Partner</option>
                  <option value={UserRole.ADMIN}>Admin Controller</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-400 px-2 tracking-widest">Mobile Number</label>
                <input 
                  type="tel" 
                  placeholder="9876543210" 
                  className="w-full bg-slate-50 border-2 border-slate-100 p-6 rounded-3xl font-black text-xl text-center focus:border-blue-500 outline-none transition-all" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)} 
                />
              </div>
              <button 
                onClick={handleSendOtp} 
                className="w-full bg-[#0A2540] text-white py-6 rounded-3xl font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-transform active:scale-95"
              >
                Send Verification Code
              </button>
            </div>
          ) : (
            <div className="space-y-8 text-center">
              <div className="space-y-4">
                <p className="text-xs font-bold text-slate-400">Code sent to {phone}</p>
                <input 
                  type="text" 
                  placeholder="0000" 
                  className="w-full bg-slate-50 border-2 border-slate-100 p-6 rounded-3xl font-black text-4xl text-center tracking-[0.5em] focus:border-blue-500 outline-none" 
                  maxLength={4} 
                  value={otp} 
                  onChange={e => setOtp(e.target.value)} 
                />
              </div>
              <button 
                onClick={handleVerify} 
                className="w-full bg-blue-500 text-white py-6 rounded-3xl font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-transform"
              >
                Verify & Enter
              </button>
              <button 
                onClick={() => setStep('phone')} 
                className="text-slate-400 text-[9px] font-black uppercase tracking-widest border-b border-slate-200 pb-1"
              >
                Change Number
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-blue-100 selection:text-blue-900">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-5 flex justify-between items-center sticky top-0 z-[100]">
        <div className="flex items-center gap-6">
          <h2 className="text-2xl font-black text-[#0A2540] italic tracking-tighter">
            DOORSTEP<span className="text-blue-500">PRO</span>
          </h2>
          <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
          <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] hidden md:block">
            {session?.user.role} NODE 6.0
          </span>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black uppercase text-[#0A2540]">{session?.user.name}</p>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{session?.user.city} Hub</p>
          </div>
          <button 
            onClick={handleLogout} 
            className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all border border-slate-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          </button>
        </div>
      </header>

      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        {session?.user.role === UserRole.USER && <UserModule problems={problems} user={session.user} />}
        {session?.user.role === UserRole.PROVIDER && <ProviderModule providerId={session.user.id} />}
        {session?.user.role === UserRole.ADMIN && <AdminModule />}
      </main>

      <AIAssistant role={session?.user.role === UserRole.PROVIDER ? 'PROVIDER' : 'USER'} contextProblems={problems} />
    </div>
  );
};

export default App;
