import React, { useState, useEffect } from 'react';
import { UserRole, User } from './types';
import { auth } from './services/AuthService';
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
      // Check for AI Studio Key in production
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

  const handleLogin = async () => {
    const res = await auth.verifyOtp(phone, otp, role);
    if (res) {
      setSession(res);
      setView('app');
    } else {
      alert("Invalid identity node.");
    }
  };

  if (view === 'splash') {
    return (
      <div className="min-h-screen bg-[#0A2540] flex flex-col items-center justify-center p-6 space-y-6">
         <div className="w-24 h-24 bg-white rounded-[3rem] flex items-center justify-center text-5xl shadow-3xl animate-pulse">🛠️</div>
         <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">DoorStep<span className="text-blue-500">Pro</span></h1>
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
        <div className="space-y-4">
          <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">Authorization Required</h2>
          <p className="text-blue-100/60 text-sm max-w-sm mx-auto font-medium">Please select a paid API key to unlock the enterprise-grade AI diagnostic features.</p>
        </div>
        <button onClick={handleOpenKeySelect} className="bg-blue-600 text-white px-10 py-6 rounded-[2.5rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:scale-105 transition-transform">Select Key</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {view === 'login' ? (
        <div className="min-h-screen bg-[#0A2540] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-[4rem] p-12 shadow-3xl space-y-10 animate-slideUp">
            <div className="text-center">
              <h1 className="text-4xl font-black text-[#0A2540] tracking-tighter italic uppercase">DoorStep<span className="text-blue-500">Pro</span></h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Identity Node Authorization</p>
            </div>
            {step === 'phone' ? (
              <div className="space-y-6">
                <select className="w-full bg-slate-50 border-2 border-slate-100 p-6 rounded-3xl font-bold appearance-none text-[#0A2540]" value={role} onChange={e => setRole(e.target.value as UserRole)}>
                  <option value={UserRole.USER}>Customer Interface</option>
                  <option value={UserRole.PROVIDER}>Partner Interface</option>
                  <option value={UserRole.ADMIN}>Admin Governance</option>
                </select>
                <input type="tel" placeholder="Mobile Node" className="w-full bg-slate-50 border-2 border-slate-100 p-6 rounded-3xl font-black text-center text-xl outline-none focus:border-blue-500 text-[#0A2540]" value={phone} onChange={e => setPhone(e.target.value)} />
                <button onClick={() => setStep('otp')} className="w-full bg-[#0A2540] text-white py-6 rounded-[2.5rem] font-black uppercase text-xs tracking-widest shadow-xl hover:bg-slate-800 transition-colors">Send OTP</button>
              </div>
            ) : (
              <div className="space-y-6">
                <input type="text" placeholder="0000" className="w-full bg-slate-50 border-2 border-slate-100 p-6 rounded-3xl font-black text-center text-4xl tracking-widest outline-none text-[#0A2540]" maxLength={4} value={otp} onChange={e => setOtp(e.target.value)} />
                <button onClick={handleLogin} className="w-full bg-blue-600 text-white py-6 rounded-[2.5rem] font-black uppercase text-xs tracking-widest shadow-xl hover:bg-blue-700 transition-colors">Verify Node</button>
                <button onClick={() => setStep('phone')} className="w-full text-slate-400 text-[10px] font-bold uppercase tracking-widest">Wrong Number?</button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <main className="animate-fadeIn">
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