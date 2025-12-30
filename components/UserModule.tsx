
import React, { useState, useEffect, useMemo } from 'react';
import { Problem, Booking, User, BookingStatus, SLATier, PaymentStatus } from '../types';
import { CATEGORIES } from '../constants';
import { db } from '../DatabaseService';
import { bookingService } from '../BookingService';
import { customerService } from '../CustomerService';
import { visualAI } from '../VisualDiagnosticsService';

interface UserModuleProps {
  problems: Problem[];
  user: User;
}

type Screen = 'DASHBOARD' | 'PROBLEM_LIST' | 'PROBLEM_DETAIL' | 'ACTIVITY' | 'PROFILE';

const UserModule: React.FC<UserModuleProps> = ({ problems, user }) => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('DASHBOARD');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const refresh = () => setBookings(customerService.getHistory(user.id));
    refresh();
    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
  }, [user.id]);

  const filteredProblems = useMemo(() => {
    if (!searchTerm) return [];
    const term = searchTerm.toLowerCase();
    return problems.filter(p => 
      p.title.toLowerCase().includes(term) || 
      p.category.toLowerCase().includes(term) ||
      p.subCategory.toLowerCase().includes(term)
    ).slice(0, 15);
  }, [searchTerm, problems]);

  const handleVisualScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsScanning(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      try {
        const result = await visualAI.analyzeProblemImage(base64, file.type);
        if (result.suggestedProblem) {
          setSelectedProblem(result.suggestedProblem);
          setCurrentScreen('PROBLEM_DETAIL');
        } else {
          alert("AI Diagnosis inconclusive. Please search manually.");
        }
      } catch (err) {
        alert("Vision Cluster Offline.");
      } finally {
        setIsScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBooking = async () => {
    if (!selectedProblem) return;
    try {
      const b = await bookingService.create(user.id, selectedProblem, user.city);
      setActiveBookingId(b.id);
      setCurrentScreen('ACTIVITY');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white relative pb-32 animate-fadeIn font-inter shadow-2xl">
      <header className="px-8 py-8 bg-white/90 backdrop-blur-xl sticky top-0 z-[100] flex justify-between items-center border-b border-slate-100">
        <div className="flex items-center gap-4">
           {currentScreen !== 'DASHBOARD' && (
             <button onClick={() => setCurrentScreen('DASHBOARD')} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-[#0A2540]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"></path></svg>
             </button>
           )}
           <h2 className="text-sm font-black text-[#0A2540] uppercase tracking-[0.2em] italic">
             {currentScreen === 'DASHBOARD' ? user.city + ' NODE' : currentScreen.replace('_', ' ')}
           </h2>
        </div>
        <div onClick={() => setCurrentScreen('PROFILE')} className="w-10 h-10 bg-[#0A2540] text-white rounded-xl flex items-center justify-center font-black shadow-lg cursor-pointer text-xs">
           {user.name[0]}
        </div>
      </header>

      <main className="px-8 py-10">
        {currentScreen === 'DASHBOARD' && (
          <div className="space-y-12 animate-slideUp">
             <div className="space-y-6">
               <div className="flex justify-between items-end">
                  <h1 className="text-5xl font-black text-[#0A2540] tracking-tighter uppercase italic leading-[0.9]">Home<br/><span className="text-blue-500">Ops.</span></h1>
                  <label className="bg-blue-600 text-white p-5 rounded-3xl shadow-xl shadow-blue-500/30 cursor-pointer active:scale-95 transition-transform flex items-center justify-center">
                     {isScanning ? <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full"></div> : <span className="text-xl">📷</span>}
                     <input type="file" accept="image/*" className="hidden" onChange={handleVisualScan} disabled={isScanning} />
                  </label>
               </div>
               <div className="relative group">
                 <input 
                   type="text" 
                   placeholder="Identify your problem..." 
                   className="w-full bg-slate-50 border-2 border-slate-100 p-6 rounded-3xl text-sm font-bold pl-12 outline-none focus:border-blue-500 focus:bg-white transition-all"
                   value={searchTerm}
                   onChange={e => setSearchTerm(e.target.value)}
                 />
                 <span className="absolute left-5 top-1/2 -translate-y-1/2 opacity-30">🔍</span>
               </div>
               {searchTerm && (
                 <div className="bg-white border-2 border-slate-100 rounded-3xl overflow-hidden shadow-2xl animate-fadeIn">
                    {filteredProblems.map(p => (
                      <button key={p.id} onClick={() => { setSelectedProblem(p); setCurrentScreen('PROBLEM_DETAIL'); }} className="w-full p-5 text-left hover:bg-slate-50 border-b border-slate-50 last:border-0 flex justify-between items-center group">
                         <div>
                            <p className="text-xs font-black text-[#0A2540] uppercase">{p.title}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.category}</p>
                         </div>
                         <span className="text-[#0A2540] font-black italic text-xs">₹{p.basePrice}</span>
                      </button>
                    ))}
                 </div>
               )}
             </div>

             <div className="grid grid-cols-4 gap-4">
                {CATEGORIES.slice(0, 8).map(cat => (
                  <button key={cat.id} onClick={() => { setSearchTerm(cat.name); }} className="flex flex-col items-center gap-2 group">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-slate-100 group-hover:border-blue-500 group-hover:bg-white transition-all">{cat.icon}</div>
                    <p className="text-[7px] font-black uppercase text-slate-400 tracking-widest text-center">{cat.name}</p>
                  </button>
                ))}
             </div>

             {bookings.some(b => b.status !== BookingStatus.COMPLETED) && (
               <div onClick={() => setCurrentScreen('ACTIVITY')} className="bg-[#0A2540] p-8 rounded-[2.5rem] text-white space-y-4 shadow-2xl relative overflow-hidden group cursor-pointer">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-300">Live Operation</p>
                  <h3 className="text-xl font-black italic tracking-tighter">Tracking Active Dispatch</h3>
               </div>
             )}
          </div>
        )}

        {currentScreen === 'PROBLEM_DETAIL' && selectedProblem && (
          <div className="space-y-10 animate-slideUp">
             <div className="aspect-square bg-slate-100 rounded-[3rem] flex items-center justify-center text-9xl shadow-inner">
                {CATEGORIES.find(c => c.name === selectedProblem.category)?.icon || '🛠️'}
             </div>
             <div className="space-y-4 text-center">
                <span className="bg-blue-100 text-blue-600 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">{selectedProblem.category}</span>
                <h2 className="text-4xl font-black text-[#0A2540] tracking-tighter uppercase italic leading-none">{selectedProblem.title}</h2>
                <p className="text-xs text-slate-400 font-medium px-4">{selectedProblem.description}</p>
             </div>
             <div className="bg-[#0A2540] p-10 rounded-[3rem] text-white shadow-2xl flex justify-between items-center">
                <div className="space-y-1">
                   <p className="text-[9px] font-black uppercase tracking-widest text-blue-300">System Lock Price</p>
                   <p className="text-4xl font-black italic leading-none">₹{selectedProblem.basePrice}</p>
                </div>
                <div className="text-right space-y-1">
                   <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Max Cap</p>
                   <p className="text-lg font-black italic text-white/50">₹{selectedProblem.maxPrice}</p>
                </div>
             </div>
             <button onClick={handleBooking} className="w-full bg-blue-600 text-white py-8 rounded-[2.5rem] font-black uppercase text-sm tracking-[0.2em] shadow-xl shadow-blue-500/20 active:scale-95 transition-all">Confirm Dispatch</button>
          </div>
        )}

        {currentScreen === 'ACTIVITY' && (
          <div className="space-y-8 animate-fadeIn">
             <h2 className="text-4xl font-black text-[#0A2540] tracking-tighter uppercase italic leading-none">Your<br/><span className="text-blue-500">History.</span></h2>
             <div className="space-y-4">
                {bookings.length === 0 ? (
                  <div className="py-20 text-center opacity-20 space-y-4">
                     <span className="text-6xl">📭</span>
                     <p className="text-[10px] font-black uppercase tracking-widest">No operations recorded.</p>
                  </div>
                ) : bookings.map(b => (
                  <div key={b.id} className="bg-white border-2 border-slate-50 p-6 rounded-3xl shadow-sm space-y-4">
                     <div className="flex justify-between items-start">
                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${b.status === BookingStatus.COMPLETED ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600 animate-pulse'}`}>{b.status}</span>
                        <span className="text-[9px] font-mono text-slate-300">#{b.id.slice(-6)}</span>
                     </div>
                     <h4 className="text-sm font-black text-[#0A2540] uppercase italic">{b.problemTitle}</h4>
                     <div className="flex justify-between items-end border-t border-slate-50 pt-4">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(b.createdAt).toLocaleDateString()}</p>
                        <p className="text-lg font-black italic text-[#0A2540]">₹{b.total || b.basePrice}</p>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {currentScreen === 'PROFILE' && (
          <div className="space-y-12 animate-fadeIn">
             <div className="flex flex-col items-center gap-4">
                <div className="w-32 h-32 bg-[#0A2540] text-white rounded-[3rem] flex items-center justify-center text-4xl font-black shadow-2xl">{user.name[0]}</div>
                <div className="text-center">
                   <h3 className="text-2xl font-black text-[#0A2540] tracking-tighter uppercase italic">{user.name}</h3>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID: {user.id.slice(-8)}</p>
                </div>
             </div>
             <div className="bg-slate-50 p-8 rounded-[2.5rem] space-y-6">
                {[
                  { label: 'Market Node', val: user.city },
                  { label: 'Wallet Node', val: `₹${user.walletBalance}` },
                  { label: 'Trust Score', val: `${user.qualityScore}%` },
                  { label: 'Role Access', val: user.role }
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center border-b border-slate-200/50 pb-4 last:border-0 last:pb-0">
                     <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{item.label}</span>
                     <span className="text-xs font-black text-[#0A2540] italic">{item.val}</span>
                  </div>
                ))}
             </div>
             <button onClick={() => window.location.reload()} className="w-full py-6 rounded-3xl border-2 border-rose-100 text-rose-500 font-black uppercase text-[10px] tracking-widest hover:bg-rose-50 transition-all">Terminate Session</button>
          </div>
        )}
      </main>

      <nav className="fixed bottom-8 left-8 right-8 bg-[#0A2540]/95 backdrop-blur-2xl p-4 rounded-[3rem] shadow-[0_40px_80px_rgba(0,0,0,0.4)] z-[200] flex justify-around items-center">
         {(['DASHBOARD', 'ACTIVITY', 'PROFILE'] as const).map(screen => (
           <button 
             key={screen} 
             onClick={() => setCurrentScreen(screen as any)} 
             className={`p-5 rounded-[2rem] transition-all relative ${currentScreen === screen ? 'bg-blue-600 text-white' : 'text-white/20 hover:text-white/40'}`}
           >
              <span className="text-2xl">{screen === 'DASHBOARD' ? '🏠' : screen === 'ACTIVITY' ? '📋' : '👤'}</span>
              {currentScreen === screen && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>}
           </button>
         ))}
      </nav>
    </div>
  );
};

export default UserModule;
