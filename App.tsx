import React, { useState, useEffect } from 'react';
import { UserRole, User } from './types';
import auth from './AuthService';
import DashboardModule from './DashboardModule';
import ProviderModule from './ProviderModule';
import AdminModule from './AdminModule';
import InvestorModule from './InvestorModule';
import AIAssistant from './AIAssistant';
import AuthModule from './modules/AuthModule';
import { generateProblems } from './constants';

const App: React.FC = () => {
  const [session, setSession] = useState<{ user: User; token: string } | null>(null);
  const [problems] = useState<any[]>(() => generateProblems());
  const [view, setView] = useState<'splash' | 'login' | 'app' | 'key_select'>('splash');

  useEffect(() => {
    const init = async () => {
      const aistudio: any = (window as any).aistudio;
      const hasKey: boolean = aistudio ? await aistudio.hasSelectedApiKey() : true;
      
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
    const timer = setTimeout(init, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleOpenKeySelect = async () => {
    const aistudio: any = (window as any).aistudio;
    if (aistudio) {
      await aistudio.openSelectKey();
    }
    setView('login');
  };

  const handleLogin = (user: User, token: string) => {
    setSession({ user, token });
    setView('app');
  };

  const handleLogout = () => {
    auth.logout();
    setSession(null);
    setView('login');
  };

  if (view === 'splash') {
    return (
      <div className="min-h-screen bg-[#0A2540] flex flex-col items-center justify-center p-6 space-y-6">
         <div className="w-24 h-24 bg-white rounded-[3rem] flex items-center justify-center text-5xl shadow-3xl animate-pulse">🛠️</div>
         <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none text-center">Book<br/><span className="text-blue-500">YourService</span></h1>
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
          <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none text-center">Authorization Required</h2>
          <p className="text-blue-100/60 text-sm max-w-sm mx-auto font-medium text-center uppercase tracking-widest leading-relaxed">Please select a paid API key to unlock enterprise diagnostic features.</p>
        </div>
        <button onClick={handleOpenKeySelect} className="bg-blue-600 text-white px-10 py-6 rounded-[2.5rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:scale-105 transition-transform">Select Key</button>
        <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-blue-400 text-[10px] font-black uppercase underline underline-offset-4">Billing Documentation</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {view === 'login' ? (
        <AuthModule onLogin={handleLogin} />
      ) : (
        <>
          <main className="animate-fadeIn">
            {session?.user.role === UserRole.USER && <DashboardModule problems={problems} user={session.user} />}
            {session?.user.role === UserRole.PROVIDER && <ProviderModule providerId={session.user.id} />}
            {session?.user.role === UserRole.ADMIN && <AdminModule />}
          </main>
          {session?.user && <AIAssistant role={session.user.role as any} city={session.user.city || 'Delhi'} />}
          <button onClick={handleLogout} className="fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded">Logout</button>
        </>
      )}
    </div>
  );
};

export default App;