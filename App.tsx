
import React, { useState, useEffect } from 'react';
import { UserRole, User } from './types';
import { auth } from './AuthService';
import { migrationService } from './MigrationService';
import UserModule from './components/UserModule';
import ProviderModule from './components/ProviderModule';
import AdminModule from './components/AdminModule';
import AIAssistant from './components/AIAssistant';
import { generateProblems } from './constants';

const App: React.FC = () => {
  const [session, setSession] = useState<{ user: User; token: string } | null>(null);
  const [problems] = useState(generateProblems());
  const [view, setView] = useState<'splash' | 'login' | 'app'>('splash');

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.USER);
  const [step, setStep] = useState<'phone' | 'otp' | 'mfa'>('phone');
  const [error, setError] = useState('');

  useEffect(() => {
    const init = async () => {
      // Run migrations before mounting app
      await migrationService.runMigrations();
      
      const existing = auth.getSession();
      if (existing) {
        setSession(existing);
        setView('app');
      } else {
        setView('login');
      }
    };
    
    const timer = setTimeout(init, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleSendOtp = async () => {
    setError('');
    const res = await auth.sendOtp(phone);
    if (res.success) {
      setStep('otp');
    } else {
      setError(res.message);
    }
  };

  const handleVerify = async () => {
    setError('');
    const res = await auth.verifyOtp(phone, otp, role);
    if (res) {
      if (res.mfaRequired) {
        localStorage.setItem('DP_USER_PENDING', JSON.stringify(res.user));
        setStep('mfa');
      } else {
        setSession(res);
        setView('app');
      }
    } else {
      setError("Invalid OTP (Default: 1234)");
    }
  };

  const handleLogout = () => {
    auth.logout();
    setSession(null);
    setView('login');
  };

  if (view === 'splash') {
    return (
      <div className="min-h-screen bg-[#0A2540] flex flex-col items-center justify-center p-6 space-y-6">
         <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center text-4xl shadow-2xl animate-pulse">🛠️</div>
         <h1 className="text-3xl font-black text-white italic tracking-tighter">DOORSTEP<span className="text-blue-400">PRO</span></h1>
         <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-blue-400 animate-loading-bar"></div>
         </div>
         <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Ensuring Data Integrity...</p>
      </div>
    );
  }

  // Login view remains unchanged...
  if (view === 'login') {
    return (
      <div className="min-h-screen bg-[#0A2540] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="bg-white w-full max-w-md rounded-[4rem] p-12 shadow-2xl space-y-10 relative z-10 border border-white/20">
          <div className="text-center">
            <h1 className="text-4xl font-black text-[#0A2540] tracking-tighter italic">DOORSTEP<span className="text-blue-500">PRO</span></h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-3">Identity Node Security</p>
          </div>

          {error && <div className="bg-rose-50 text-rose-500 p-4 rounded-2xl text-[10px] font-black uppercase text-center border border-rose-100">{error}</div>}

          {step === 'phone' ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-400 px-2 tracking-widest">Portal Access</label>
                <select className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-3xl font-bold text-slate-900" value={role} onChange={e => setRole(e.target.value as UserRole)}>
                  <option value={UserRole.USER}>Customer Hub</option>
                  <option value={UserRole.PROVIDER}>Service Partner</option>
                  <option value={UserRole.ADMIN}>Admin Controller</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-400 px-2 tracking-widest">Mobile Number</label>
                <input type="tel" placeholder="9876543210" className="w-full bg-slate-50 border-2 border-slate-100 p-6 rounded-3xl font-black text-xl text-center focus:border-blue-500 outline-none" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              <button onClick={handleSendOtp} className="w-full bg-[#0A2540] text-white py-6 rounded-3xl font-black uppercase text-xs tracking-[0.2em] shadow-xl">Send Verification Code</button>
            </div>
          ) : (
            <div className="space-y-8 text-center">
              <input type="text" placeholder="0000" className="w-full bg-slate-50 border-2 border-slate-100 p-6 rounded-3xl font-black text-4xl text-center tracking-[0.5em] focus:border-blue-500 outline-none" maxLength={4} value={otp} onChange={e => setOtp(e.target.value)} />
              <button onClick={handleVerify} className="w-full bg-blue-500 text-white py-6 rounded-3xl font-black uppercase text-xs tracking-[0.2em] shadow-xl">Verify & Continue</button>
              <button onClick={() => setStep('phone')} className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Go Back</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-blue-100 selection:text-blue-900">
      <main>
        {session?.user.role === UserRole.USER && <UserModule problems={problems} user={session.user} />}
        {session?.user.role === UserRole.PROVIDER && (
          <>
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-5 flex justify-between items-center sticky top-0 z-[100]">
              <h2 className="text-2xl font-black text-[#0A2540] italic tracking-tighter">DOORSTEP<span className="text-blue-500">PRO</span></h2>
              <button onClick={handleLogout} className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-rose-500 border border-slate-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
              </button>
            </header>
            <ProviderModule providerId={session.user.id} />
          </>
        )}
        {session?.user.role === UserRole.ADMIN && (
          <>
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-5 flex justify-between items-center sticky top-0 z-[100]">
              <h2 className="text-2xl font-black text-[#0A2540] italic tracking-tighter">DOORSTEP<span className="text-blue-500">PRO</span></h2>
              <button onClick={handleLogout} className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-rose-500 border border-slate-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
              </button>
            </header>
            <AdminModule />
          </>
        )}
      </main>
      <AIAssistant role={session?.user.role === UserRole.PROVIDER ? 'PROVIDER' : 'USER'} contextProblems={problems} />
    </div>
  );
};

export default App;
