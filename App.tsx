
import React, { useState, useEffect } from 'react';
import { UserRole, User } from './types';
import { auth } from './services/AuthService';
import { migrationService } from './services/MigrationService';
import DashboardModule from './modules/DashboardModule';
import ProviderModule from './modules/ProviderModule';
import AdminModule from './modules/AdminModule';
import AIAssistant from './components/AIAssistant';
import { generateProblems } from './constants';

const App: React.FC = () => {
  const [session, setSession] = useState<{ user: User; token: string } | null>(null);
  const [problems] = useState(generateProblems());
  const [view, setView] = useState<'splash' | 'login' | 'app' | 'key_select'>('splash');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.USER);
  const [step, setStep] = useState<'phone' | 'otp'>('phone');

  useEffect(() => {
    const init = async () => {
      await migrationService.runMigrations();
      const hasKey = await (window as any).aistudio?.hasSelectedApiKey();
      
      if (!hasKey && process.env.NODE_ENV === 'production') {
        setView('key_select');
      } else {
        const existing = auth.getSession();
        if (existing) {
          setSession(existing);
          setView('app');
        } else {
          setView('login');
        }
      }
    };
    setTimeout(init, 1500);
  }, []);

  const handleOpenKeySelect = async () => {
    await (window as any).aistudio?.openSelectKey();
    setView('login');
  };

  if (view === 'splash') {
    return (
      <div className="min-h-screen bg-[#0A2540] flex flex-col items-center justify-center p-6 space-y-6">
         <div className="w-24 h-24 bg-white rounded-[3rem] flex items-center justify-center text-5xl shadow-3xl animate-pulse">🛠️</div>
         <h1 className="text-3xl font-black text-white italic tracking-tighter">DOORSTEP<span className="text-blue-500">PRO</span></h1>
         <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 animate-loading-bar"></div>
         </div>
      </div>
    );
  }

  if (view === 'key_select') {
    return (
      <div className="min-h-screen bg-[#0A2540] flex flex-col items-center justify-center p-12 text-center space-y-8 animate-fadeIn">
        <div className="text-8xl">🔑</div>
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">Authentication Required</h2>
          <p className="text-xs text-white/40 uppercase font-black tracking-widest max-w-xs mx-auto">Please select a paid API key to unlock enterprise diagnostic features.</p>
        </div>
        <button onClick={handleOpenKeySelect} className="bg-blue-600 text-white px-10 py-6 rounded-[2.5rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl">Select Key</button>
        <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-blue-400 text-[10px] font-black uppercase underline underline-offset-4">Billing Documentation</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {view === 'login' ? (
        <div className="min-h-screen bg-[#0A2540] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-[4rem] p-12 shadow-3xl space-y-10 animate-slideUp">
            <div className="text-center">
              <h1 className="text-4xl font-black text-[#0A2540] tracking-tighter italic">DOORSTEP<span className="text-blue-500">PRO</span></h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Identity Node Login</p>
            </div>
            {step === 'phone' ? (
              <div className="space-y-6">
                <select className="w-full bg-slate-50 border-2 border-slate-100 p-6 rounded-3xl font-bold" value={role} onChange={e => setRole(e.target.value as UserRole)}>
                  <option value={UserRole.USER}>Customer</option>
                  <option value={UserRole.PROVIDER}>Partner</option>
                  <option value={UserRole.ADMIN}>Admin</option>
                </select>
                <input type="tel" placeholder="Mobile Node" className="w-full bg-slate-50 border-2 border-slate-100 p-6 rounded-3xl font-black text-center text-xl outline-none focus:border-blue-500" value={phone} onChange={e => setPhone(e.target.value)} />
                <button onClick={() => setStep('otp')} className="w-full bg-[#0A2540] text-white py-6 rounded-[2.5rem] font-black uppercase text-xs tracking-widest shadow-xl">Send OTP</button>
              </div>
            ) : (
              <div className="space-y-6">
                <input type="text" placeholder="0000" className="w-full bg-slate-50 border-2 border-slate-100 p-6 rounded-3xl font-black text-center text-4xl tracking-widest outline-none" maxLength={4} value={otp} onChange={e => setOtp(e.target.value)} />
                <button onClick={async () => {
                  const res = await auth.verifyOtp(phone, otp, role);
                  if (res) { setSession(res); setView('app'); }
                }} className="w-full bg-blue-600 text-white py-6 rounded-[2.5rem] font-black uppercase text-xs tracking-widest shadow-xl">Verify</button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <main>
            {session?.user.role === UserRole.USER && <DashboardModule problems={problems} user={session.user} />}
            {session?.user.role === UserRole.PROVIDER && <ProviderModule providerId={session.user.id} />}
            {session?.user.role === UserRole.ADMIN && <AdminModule />}
          </main>
          <AIAssistant role={session?.user.role as any} city={session?.user.city || 'Delhi'} />
        </>
      )}
    </div>
  );
};

export default App;
