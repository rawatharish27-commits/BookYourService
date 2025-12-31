
import React, { useState, useEffect, useMemo } from 'react';
import { Problem, Booking, User, BookingStatus } from '../types';
import { CATEGORIES } from '../constants';
import { db } from '../services/DatabaseService';
import { bookingService } from '../services/BookingService';
import { customerService } from '../services/CustomerService';
import { visualAI } from '../services/VisualDiagnosticsService';

interface UserModuleProps {
  problems: Problem[];
  user: User;
}

type Screen = 'DASHBOARD' | 'PROBLEM_DETAIL' | 'ACTIVITY' | 'PROFILE';

const DashboardModule: React.FC<UserModuleProps> = ({ problems, user }) => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('DASHBOARD');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const refresh = () => setBookings(customerService.getHistory(user.id));
    refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [user.id]);

  const filteredProblems = useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) return [];
    const term = searchTerm.toLowerCase();
    return problems.filter(p => 
      p.title.toLowerCase().includes(term) || 
      p.category.toLowerCase().includes(term)
    ).slice(0, 10);
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
          alert("Visual AI inconclusive. Use search node.");
        }
      } catch (err) {
        alert("Diagnostics Cluster Offline.");
      } finally {
        setIsScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBooking = async () => {
    if (!selectedProblem) return;
    try {
      await bookingService.create(user.id, selectedProblem, user.city);
      setCurrentScreen('ACTIVITY');
      setSearchTerm('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 relative pb-32 font-inter shadow-2xl animate-fadeIn">
      <header className="px-8 py-8 bg-white sticky top-0 z-[100] border-b border-slate-100 flex justify-between items-center shadow-sm">
        <h2 className="text-sm font-black text-[#0A2540] uppercase tracking-widest italic">Node: {user.city}</h2>
        <div className="w-10 h-10 bg-[#0A2540] text-white rounded-xl flex items-center justify-center font-black shadow-lg">
           {user.name[0]}
        </div>
      </header>

      <main className="p-8">
        {currentScreen === 'DASHBOARD' && (
          <div className="space-y-10 animate-slideUp">
             <div className="space-y-6">
                <div className="flex justify-between items-end">
                   <h1 className="text-4xl font-black text-[#0A2540] tracking-tighter uppercase leading-none">Book<br/><span className="text-blue-500">Service.</span></h1>
                   <label className="bg-blue-600 text-white p-5 rounded-3xl shadow-xl cursor-pointer hover:scale-105 transition-transform">
                      {isScanning ? "..." : "📷"}
                      <input type="file" accept="image/*" className="hidden" onChange={handleVisualScan} disabled={isScanning} />
                   </label>
                </div>
                <div className="relative">
                   <input 
                     type="text" 
                     placeholder="Search 2000+ problem nodes..." 
                     className="w-full bg-white border-2 border-slate-100 p-6 rounded-3xl font-bold pl-12 shadow-sm outline-none focus:border-blue-500 transition-all"
                     value={searchTerm}
                     onChange={e => setSearchTerm(e.target.value)}
                   />
                   <span className="absolute left-5 top-1/2 -translate-y-1/2">🔍</span>
                </div>
                {searchTerm.length > 1 && (
                  <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
                    {filteredProblems.map(p => (
                      <button key={p.id} onClick={() => { setSelectedProblem(p); setCurrentScreen('PROBLEM_DETAIL'); }} className="w-full p-5 text-left hover:bg-slate-50 border-b border-slate-50 flex justify-between items-center group">
                        <div>
                           <p className="text-xs font-black text-[#0A2540] uppercase">{p.title}</p>
                           <p className="text-[10px] text-slate-400 font-bold">{p.category}</p>
                        </div>
                        <span className="text-xs font-black text-blue-600">₹{p.basePrice}</span>
                      </button>
                    ))}
                  </div>
                )}
             </div>

             <div className="grid grid-cols-4 gap-4">
                {CATEGORIES.slice(0, 8).map(cat => (
                  <button key={cat.id} onClick={() => setSearchTerm(cat.name)} className="flex flex-col items-center gap-2 group">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-all">
                       {cat.icon}
                    </div>
                    <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest text-center">{cat.name}</p>
                  </button>
                ))}
             </div>

             {bookings.some(b => b.status !== BookingStatus.COMPLETED && b.status !== BookingStatus.CANCELLED) && (
               <div onClick={() => setCurrentScreen('ACTIVITY')} className="bg-[#0A2540] p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden cursor-pointer animate-pulse">
                  <div className="relative z-10">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-300">Operational Update</p>
                    <h3 className="text-lg font-black italic">Active Dispatch Tracking...</h3>
                  </div>
               </div>
             )}
          </div>
        )}

        {currentScreen === 'PROBLEM_DETAIL' && selectedProblem && (
          <div className="space-y-8 animate-slideUp">
             <button onClick={() => setCurrentScreen('DASHBOARD')} className="text-xs font-black text-slate-400 uppercase tracking-widest">← Back</button>
             <div className="bg-white p-10 rounded-[4rem] shadow-2xl space-y-8 border border-slate-100 text-center">
                <div className="text-6xl mx-auto">{CATEGORIES.find(c => c.name === selectedProblem.category)?.icon || '🛠️'}</div>
                <div className="space-y-4">
                  <span className="bg-blue-100 text-blue-600 px-4 py-1.5 rounded-full text-[9px] font-black uppercase">{selectedProblem.category}</span>
                  <h2 className="text-3xl font-black text-[#0A2540] tracking-tighter uppercase italic">{selectedProblem.title}</h2>
                  <p className="text-xs text-slate-400 font-medium px-4">{selectedProblem.description}</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-3xl flex justify-between items-center border border-slate-100">
                   <div className="text-left">
                      <p className="text-[9px] font-black text-slate-400 uppercase">Locked Price</p>
                      <p className="text-3xl font-black text-[#0A2540]">₹{selectedProblem.basePrice}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-[9px] font-black text-slate-400 uppercase">Max Cap</p>
                      <p className="text-xl font-black text-slate-300 italic">₹{selectedProblem.maxPrice}</p>
                   </div>
                </div>
                <button onClick={handleBooking} className="w-full bg-blue-600 text-white py-6 rounded-3xl font-black uppercase text-sm tracking-widest shadow-xl hover:bg-blue-700 transition-colors">Request Service Node</button>
             </div>
          </div>
        )}

        {currentScreen === 'ACTIVITY' && (
          <div className="space-y-8 animate-fadeIn">
             <h2 className="text-4xl font-black text-[#0A2540] tracking-tighter uppercase italic">Your<br/><span className="text-blue-500">History.</span></h2>
             <div className="space-y-4">
                {bookings.map(b => (
                  <div key={b.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                    <div className="flex justify-between items-start">
                       <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${b.status === BookingStatus.COMPLETED ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>{b.status}</span>
                       <span className="text-[9px] font-mono text-slate-300">#{b.id.slice(-6)}</span>
                    </div>
                    <h4 className="text-sm font-black text-[#0A2540] uppercase italic leading-tight">{b.problemTitle}</h4>
                    <div className="flex justify-between items-end border-t border-slate-50 pt-4">
                       <p className="text-[9px] font-bold text-slate-400 uppercase">{new Date(b.createdAt).toLocaleDateString()}</p>
                       <p className="text-lg font-black italic text-[#0A2540]">₹{b.total || b.basePrice}</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-8 left-8 right-8 bg-[#0A2540]/95 backdrop-blur-xl p-4 rounded-[3rem] shadow-2xl flex justify-around items-center z-[200]">
         {(['DASHBOARD', 'ACTIVITY', 'PROFILE'] as const).map(screen => (
           <button 
             key={screen} 
             onClick={() => setCurrentScreen(screen as any)} 
             className={`p-4 rounded-2xl transition-all ${currentScreen === screen ? 'bg-blue-600 text-white' : 'text-white/20 hover:text-white/40'}`}
           >
              <span className="text-xl">{screen === 'DASHBOARD' ? '🏠' : screen === 'ACTIVITY' ? '📋' : '👤'}</span>
           </button>
         ))}
      </nav>
    </div>
  );
};

export default DashboardModule;
