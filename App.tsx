
import React, { useState, useEffect, useCallback } from 'react';
import { UserRole, Booking, Problem, UserEntity, BookingStatus } from './types';
import { generateProblems, PLATFORM_FEE, VISIT_CHARGE } from './constants';
import { db } from './DatabaseService';
import { auth } from './AuthService';
import UserModule from './components/UserModule';
import ProviderModule from './components/ProviderModule';
import AdminModule from './components/AdminModule';
import PitchModule from './components/PitchModule';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserEntity | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [problems] = useState<Problem[]>(generateProblems());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [view, setView] = useState<'main' | 'pitch'>('main');
  const [sysStatus, setSysStatus] = useState('Syncing...');
  
  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const loadData = useCallback(async (user: UserEntity) => {
    const allRequests = (db as any).db.requests as any[];
    
    let filtered = allRequests;
    if (user.role_id === UserRole.USER) {
      filtered = allRequests.filter(r => r.user_id === user.id);
    } else if (user.role_id === UserRole.PROVIDER || user.role_id === UserRole.ADMIN) {
      filtered = allRequests.filter(r => r.state_code === user.state_code);
    }
    
    const enriched = filtered.map(r => {
      const prob = problems.find(p => p.id === r.service_id) || problems[0];
      return {
        ...r,
        userName: user.name, 
        problemTitle: prob.title,
        category: prob.category,
        subCategory: prob.subCategory,
        ontologyId: prob.ontologyId,
        slaTier: prob.slaTier,
        severity: prob.severity,
        basePrice: prob.basePrice,
        visitCharge: VISIT_CHARGE,
        platformFee: PLATFORM_FEE,
        providerEarnings: (r.total_amount || 0) - PLATFORM_FEE,
        address: 'B-402, Signature Towers, Gurgaon',
        history: []
      } as Booking;
    });
    
    setBookings(enriched);
  }, [problems]);

  useEffect(() => {
    const checkSession = async () => {
      const session = auth.getSession();
      if (session) {
        const latestUsers = await db.getUsers();
        const latestUser = latestUsers.find(u => u.id === session.user.id);
        if (latestUser && latestUser.status === 'BANNED') {
          auth.logout();
          setCurrentUser(null);
          alert('ACCESS DENIED: Account Banned.');
          return;
        }
        setCurrentUser(session.user);
        setSessionToken(session.token);
        await loadData(session.user);
      }
      setSysStatus('Connected');
    };
    checkSession();
  }, [loadData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const result = await auth.login(email, password);
    if (result) {
      if (result.user.status === 'BANNED') {
         setAuthError('CRITICAL: ACCOUNT BANNED.');
         auth.logout();
         return;
      }
      setCurrentUser(result.user);
      setSessionToken(result.token);
      await loadData(result.user);
    } else {
      setAuthError('Invalid credentials.');
    }
  };

  const handleLogout = () => {
    auth.logout();
    setCurrentUser(null);
    setSessionToken(null);
    setBookings([]);
    setView('main');
  };

  const handleBooking = useCallback(async (booking: Booking) => {
    if (!currentUser) return;
    const req = await db.createRequest({
      user_id: currentUser.id,
      service_id: booking.service_id,
      state_code: currentUser.state_code,
      total_amount: booking.total_amount,
      payment_method: booking.payment_method,
      payment_status: booking.payment_status
    });
    setBookings(prev => [{...booking, id: req.id, user_id: currentUser.id}, ...prev]);
  }, [currentUser]);

  const updateBookingStatus = useCallback(async (id: string, updates: Partial<Booking>) => {
    await db.updateRequest(id, {
      status: updates.status,
      provider_id: updates.provider_id,
      total_amount: updates.total_amount,
      scheduledTime: updates.scheduledTime
    });
    setBookings(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  }, []);

  // Fix: Implemented renderModule to handle role-based navigation
  const renderModule = () => {
    if (view === 'pitch') return <PitchModule />;
    if (!currentUser) return null;

    switch (currentUser.role_id) {
      case UserRole.ADMIN:
        return <AdminModule bookings={bookings} problems={problems} />;
      case UserRole.PROVIDER:
        return (
          <ProviderModule 
            bookings={bookings} 
            providerId={currentUser.id} 
            onUpdateBooking={updateBookingStatus} 
            problems={problems} 
          />
        );
      case UserRole.USER:
        return (
          <UserModule 
            problems={problems} 
            bookings={bookings} 
            user={currentUser} 
            onBook={handleBooking} 
          />
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center p-20 bg-white rounded-[3rem] shadow-sm border border-gray-100">
             <h2 className="text-2xl font-black text-[#0A2540] uppercase tracking-tighter">Access Level Restricted</h2>
             <p className="text-gray-400 font-bold mt-2">Your role does not have access to a dashboard module.</p>
          </div>
        );
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0A2540] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-[#00D4FF] rounded-full opacity-5 blur-[150px] -mr-40 -mt-40"></div>
        
        <div className="bg-white/5 backdrop-blur-3xl p-12 rounded-[4rem] border border-white/10 w-full max-w-md shadow-2xl relative z-10">
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-[#00D4FF] rounded-[2rem] mx-auto flex items-center justify-center text-[#0A2540] font-black text-4xl shadow-2xl shadow-blue-500/20 mb-6">D</div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">DoorStep <span className="text-[#00D4FF]">Pro</span></h1>
            <p className="text-blue-200/50 text-[10px] font-black uppercase tracking-[0.4em] mt-3">Founder-Ready Infrastructure</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-blue-300 uppercase tracking-widest ml-4">Authorized Identity</label>
              <input 
                type="email" 
                placeholder="email@doorstep.gov.in"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-white placeholder:text-white/20 outline-none focus:ring-4 focus:ring-blue-500/20 transition-all font-bold"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-blue-300 uppercase tracking-widest ml-4">Access Secret</label>
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-white placeholder:text-white/20 outline-none focus:ring-4 focus:ring-blue-500/20 transition-all font-bold"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            {authError && <p className="text-red-400 text-[10px] font-black uppercase tracking-widest text-center">{authError}</p>}

            <button 
              type="submit"
              className="w-full bg-[#00D4FF] text-[#0A2540] font-black py-6 rounded-2xl hover:bg-white transition-all shadow-2xl shadow-blue-500/20 uppercase tracking-widest text-sm"
            >
              Enter Dashboard
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-white/10 text-center space-y-4">
             <div className="flex justify-center gap-6">
                <button onClick={() => {setEmail('admin@doorstep.gov.in'); setPassword('password123');}} className="text-[9px] font-black text-blue-400/60 uppercase underline">Demo Admin</button>
                <button onClick={() => {setEmail('rajesh@provider.com'); setPassword('password123');}} className="text-[9px] font-black text-blue-400/60 uppercase underline">Demo Provider</button>
             </div>
            <p className="text-[8px] text-blue-300/20 font-black uppercase tracking-widest">Enterprise Platform v3.5.2 • 256-bit Node Security</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('main')}>
            <div className="w-10 h-10 bg-[#0A2540] rounded-xl flex items-center justify-center text-[#00D4FF] font-black text-xl">D</div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-[#0A2540] tracking-tighter">DoorStep<span className="text-[#00D4FF]">PRO</span></span>
                <span className="bg-[#00D4FF]/20 text-[#00D4FF] text-[8px] font-black px-2 py-0.5 rounded-full">v3.5</span>
              </div>
              <span className="text-[8px] font-black text-gray-400 uppercase tracking-[0.3em] -mt-1">City Node: {currentUser.state_code}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            {currentUser.role_id === UserRole.ADMIN && (
              <button 
                onClick={() => setView(view === 'main' ? 'pitch' : 'main')}
                className="hidden md:block px-6 py-2 bg-[#0A2540] text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#00D4FF] hover:text-[#0A2540] transition-all"
              >
                {view === 'main' ? 'Investor Deck' : 'Back Dashboard'}
              </button>
            )}
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black text-[#0A2540] uppercase tracking-tighter">{currentUser.name}</p>
              <p className="text-[8px] text-green-500 font-bold uppercase">{currentUser.role_id}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="bg-gray-100 hover:bg-red-50 text-gray-400 hover:text-red-500 p-3 rounded-xl transition-all border border-gray-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3 3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-10">
        {renderModule()}
      </main>

      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.4em]">Proprietary Framework • Urban Services Operating System v3.5</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
