
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Problem, Booking, User, BookingStatus, UserRole, SLATier } from '../types';
import { CATEGORIES } from '../constants';
import { db } from '../DatabaseService';
import { bookingService } from '../BookingService';
import { customerService } from '../CustomerService';

interface UserModuleProps {
  problems: Problem[];
  user: User;
}

type Screen = 'DASHBOARD' | 'PROBLEM_LIST' | 'PROBLEM_DETAIL' | 'SLOT_PICKER' | 'ACTIVITY' | 'BOOKING_DETAIL' | 'PROFILE' | 'CITY_PICKER' | 'HELP' | 'CHAT';

const UserModule: React.FC<UserModuleProps> = ({ problems, user }) => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('DASHBOARD');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);
  const [isMatching, setIsMatching] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  
  const [ratingBookingId, setRatingBookingId] = useState<string | null>(null);
  const [stars, setStars] = useState(5);

  const bookings = customerService.getHistory(user.id);
  const activeBooking = activeBookingId ? bookings.find(b => b.id === activeBookingId) : null;
  const scrollRef = useRef<HTMLDivElement>(null);

  // Efficiency: Use memoized search for 2000 problems
  const filteredProblems = useMemo(() => {
    if (!searchTerm) return [];
    const term = searchTerm.toLowerCase();
    return problems.filter(p => 
      p.title.toLowerCase().includes(term) || 
      p.category.toLowerCase().includes(term) ||
      p.subCategory.toLowerCase().includes(term)
    ).slice(0, 20);
  }, [searchTerm, problems]);

  const pendingRating = bookings.find(b => b.status === BookingStatus.COMPLETED && !b.rating);

  useEffect(() => {
    if (pendingRating && !ratingBookingId) {
       setRatingBookingId(pendingRating.id);
    }
  }, [pendingRating]);

  useEffect(() => {
    if (isMatching && activeBookingId) {
      const timer = setTimeout(() => {
        const provs = db.getUsers().filter(u => u.role === UserRole.PROVIDER && u.city === user.city);
        const randomPro = provs[Math.floor(Math.random() * provs.length)];
        if (randomPro) {
          db.updateBooking(activeBookingId, { 
            providerId: randomPro.id, 
            status: BookingStatus.ACCEPTED,
            assignedAt: new Date().toISOString()
          });
        }
        setIsMatching(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isMatching, activeBookingId]);

  const handleBooking = async () => {
    if (!selectedProblem || !selectedSlot) return;
    try {
      const b = await bookingService.create(user.id, selectedProblem, user.city);
      await db.updateBooking(b.id, { scheduledAt: selectedSlot });
      setActiveBookingId(b.id);
      setIsMatching(true);
      setCurrentScreen('BOOKING_DETAIL');
      setSelectedProblem(null);
      setSelectedSlot(null);
    } catch (e) {
      alert("Booking failure. Hub saturated.");
    }
  };

  const renderTimeline = (booking: Booking) => {
    const steps = [
      { label: 'Booking Placed', done: true, time: booking.createdAt },
      { label: 'Finding Pro', done: !!booking.providerId || isMatching, active: isMatching, time: booking.assignedAt },
      { label: 'Pro Arriving', done: [BookingStatus.ACCEPTED, BookingStatus.IN_PROGRESS, BookingStatus.COMPLETED].includes(booking.status), time: booking.acceptedAt },
      { label: 'Job Started', done: [BookingStatus.IN_PROGRESS, BookingStatus.COMPLETED].includes(booking.status), time: booking.startedAt },
      { label: 'Completed', done: booking.status === BookingStatus.COMPLETED, time: booking.completedAt }
    ];

    return (
      <div className="space-y-8">
        {steps.map((s, i) => (
          <div key={i} className="flex gap-6 items-start group">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full border-4 flex items-center justify-center transition-all duration-700 ${s.done ? 'bg-emerald-500 border-emerald-100 text-white' : s.active ? 'bg-blue-500 border-blue-100 animate-pulse text-white' : 'bg-slate-100 border-white text-slate-300'}`}>
                {s.done && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
              </div>
              {i < steps.length - 1 && <div className={`w-1 h-16 transition-all duration-700 ${s.done ? 'bg-emerald-500' : 'bg-slate-100'}`}></div>}
            </div>
            <div className="pt-1">
              <p className={`text-[11px] font-black uppercase tracking-[0.2em] ${s.done || s.active ? 'text-slate-900' : 'text-slate-300'}`}>{s.label}</p>
              {s.time && <p className="text-[10px] font-bold text-slate-400 mt-1">{new Date(s.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>}
              {s.active && <p className="text-[9px] font-black text-blue-500 mt-2 uppercase animate-pulse">Scanning local node cluster...</p>}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 relative pb-32 animate-fadeIn selection:bg-blue-500 selection:text-white font-inter">
      
      {/* HEADER NODE */}
      <header className="px-8 py-10 bg-white/80 backdrop-blur-3xl sticky top-0 z-[100] flex justify-between items-center border-b border-slate-100">
        <div className="flex items-center gap-4">
           {currentScreen !== 'DASHBOARD' && (
             <button onClick={() => setCurrentScreen('DASHBOARD')} className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-[#0A2540] hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"></path></svg>
             </button>
           )}
           <div>
              {currentScreen === 'DASHBOARD' ? (
                <div onClick={() => setCurrentScreen('CITY_PICKER')} className="cursor-pointer group">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] leading-none group-hover:text-blue-500 transition-colors">Operational Hub</p>
                   <h4 className="text-lg font-black text-[#0A2540] flex items-center gap-2 mt-1 uppercase italic tracking-tighter">
                     {user.city} NODE <span className="text-[10px] text-blue-500 animate-bounce">▼</span>
                   </h4>
                </div>
              ) : (
                <h2 className="text-xl font-black text-[#0A2540] uppercase italic tracking-tighter">{currentScreen.replace('_', ' ')}</h2>
              )}
           </div>
        </div>
        <div onClick={() => setCurrentScreen('PROFILE')} className="w-12 h-12 bg-gradient-to-br from-[#0A2540] to-slate-800 text-white rounded-[1.2rem] flex items-center justify-center font-black text-sm shadow-xl cursor-pointer hover:scale-110 transition-transform active:scale-95 border-2 border-white">
           {user.name[0]}
        </div>
      </header>

      <main className="px-8 py-10">
        {currentScreen === 'DASHBOARD' && (
          <div className="space-y-14">
             <div className="space-y-6">
               <h1 className="text-6xl font-black text-[#0A2540] tracking-tighter leading-[0.9] uppercase italic">Hub<br/><span className="text-blue-500">Search.</span></h1>
               <div className="relative group">
                 <input 
                   type="text" 
                   placeholder="Identify Problem Node..." 
                   className="w-full bg-white border-4 border-slate-100 p-7 rounded-[3rem] shadow-xl text-lg font-black pl-16 outline-none focus:border-blue-500 transition-all uppercase tracking-tighter"
                   value={searchTerm}
                   onChange={e => setSearchTerm(e.target.value)}
                   onFocus={() => setCurrentScreen('PROBLEM_LIST')}
                 />
                 <svg className="w-8 h-8 absolute left-6 top-7 text-slate-300 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
               </div>
             </div>

             <div className="grid grid-cols-4 gap-6">
                {CATEGORIES.slice(0, 16).map(cat => (
                  <button 
                    key={cat.id} 
                    onClick={() => { setSearchTerm(cat.name); setCurrentScreen('PROBLEM_LIST'); }}
                    className="flex flex-col items-center gap-3 group active:scale-90 transition-transform"
                  >
                    <div className="w-20 h-20 bg-white rounded-[2.2rem] flex items-center justify-center text-3xl shadow-lg border border-slate-50 group-hover:border-blue-500 group-hover:shadow-blue-500/10 transition-all">{cat.icon}</div>
                    <p className="text-[8px] font-black uppercase text-slate-400 text-center tracking-[0.3em] leading-tight">{cat.name}</p>
                  </button>
                ))}
             </div>

             <div className="bg-[#0A2540] p-12 rounded-[5rem] text-white space-y-8 relative overflow-hidden shadow-3xl border-t-8 border-blue-500">
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
                <div className="flex justify-between items-start relative z-10">
                  <div className="space-y-2">
                    <p className="text-[11px] font-black uppercase tracking-[0.5em] text-blue-300">Governance Node</p>
                    <h3 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Market Price<br/>Integrity.</h3>
                  </div>
                  <span className="text-5xl opacity-20">🛡️</span>
                </div>
                <p className="text-xs font-medium opacity-50 leading-relaxed italic relative z-10">"Every service node is audited. Price-lock prevents arbitrary on-site negotiation. No hidden fees."</p>
             </div>
          </div>
        )}

        {currentScreen === 'PROBLEM_LIST' && (
          <div className="space-y-8 animate-slideUp">
             <div className="relative">
                 <input 
                   autoFocus
                   type="text" 
                   placeholder="Describe problem..." 
                   className="w-full bg-white border-4 border-slate-100 p-7 rounded-[3rem] shadow-xl text-lg font-black pl-16 outline-none focus:border-blue-500 transition-all uppercase tracking-tighter"
                   value={searchTerm}
                   onChange={e => setSearchTerm(e.target.value)}
                 />
                 <svg className="w-8 h-8 absolute left-6 top-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
             </div>

             <div className="space-y-4">
                {filteredProblems.length === 0 ? (
                  <div className="text-center py-24 opacity-10">
                     <p className="text-sm font-black uppercase tracking-[0.8em]">Empty Node Cluster</p>
                  </div>
                ) : filteredProblems.map(p => (
                    <div 
                      key={p.id} 
                      onClick={() => { setSelectedProblem(p); setCurrentScreen('PROBLEM_DETAIL'); }}
                      className="bg-white p-8 rounded-[3rem] border border-slate-100 flex justify-between items-center group active:scale-95 transition-all cursor-pointer hover:border-blue-500 hover:shadow-2xl"
                    >
                      <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase text-blue-500 tracking-[0.4em]">{p.category}</p>
                        <h4 className="font-black text-[#0A2540] text-lg uppercase italic tracking-tighter leading-none">{p.title}</h4>
                        <div className="flex gap-6 mt-2">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cap: ₹{p.maxPrice}</p>
                           <span className={`text-[10px] font-black uppercase tracking-widest ${p.slaTier === SLATier.GOLD ? 'text-amber-500' : 'text-slate-300'}`}>{p.slaTier} Node</span>
                        </div>
                      </div>
                      <div className="w-14 h-14 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-200 group-hover:bg-[#0A2540] group-hover:text-white transition-all shadow-sm">
                         <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg>
                      </div>
                    </div>
                  ))}
             </div>
          </div>
        )}

        {currentScreen === 'PROBLEM_DETAIL' && selectedProblem && (
          <div className="space-y-14 animate-slideUp">
             <div className="space-y-8">
                <span className="bg-blue-600 text-white px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.5em] shadow-lg shadow-blue-500/20">{selectedProblem.category} Node</span>
                <h2 className="text-6xl font-black text-[#0A2540] tracking-tighter leading-[0.95] uppercase italic">{selectedProblem.title}</h2>
                <div className="grid grid-cols-2 gap-6">
                   <div className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-xl">
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Base Dispatch</p>
                      <p className="text-4xl font-black text-[#0A2540] italic mt-2 tracking-tighter">₹{selectedProblem.basePrice}</p>
                   </div>
                   <div className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-xl">
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Max Billing</p>
                      <p className="text-4xl font-black text-rose-500 italic mt-2 tracking-tighter">₹{selectedProblem.maxPrice}</p>
                   </div>
                </div>
             </div>

             <div className="bg-[#0A2540] p-12 rounded-[5rem] text-white space-y-10 shadow-3xl">
                <h3 className="text-xs font-black uppercase tracking-[0.5em] text-blue-300">Operational SOPs</h3>
                <div className="space-y-6">
                   {[
                     "Diagnostic health check mandatory",
                     "Parts from verified hub cluster only",
                     "30-Day Node Warranty Active",
                     "Digital billing only - No cash negotiations"
                   ].map(s => (
                     <div key={s} className="flex gap-6 items-center">
                        <div className="w-8 h-8 bg-blue-500 text-white rounded-2xl flex items-center justify-center text-xs font-black shadow-lg">✓</div>
                        <p className="text-sm font-black uppercase tracking-tighter opacity-80">{s}</p>
                     </div>
                   ))}
                </div>
             </div>

             <button 
               onClick={() => setCurrentScreen('SLOT_PICKER')}
               className="w-full bg-blue-600 text-white py-10 rounded-[3.5rem] font-black uppercase text-sm tracking-widest shadow-2xl shadow-blue-500/30 hover:scale-[1.03] transition-all active:scale-95"
             >
               Pick Dispatch Window
             </button>
          </div>
        )}

        {currentScreen === 'BOOKING_DETAIL' && activeBooking && (
          <div className="space-y-12 animate-fadeIn pb-16">
             <div className="text-center space-y-8 py-14">
                <div className={`w-32 h-32 rounded-[4rem] flex items-center justify-center text-5xl mx-auto shadow-[0_40px_80px_rgba(0,0,0,0.1)] transition-all duration-1000 ${isMatching ? 'bg-blue-50 text-blue-500 animate-pulse' : 'bg-emerald-50 text-emerald-500'}`}>
                   {isMatching ? '📡' : '👤'}
                </div>
                <div className="space-y-3">
                   <h2 className="text-5xl font-black text-[#0A2540] tracking-tighter uppercase italic leading-none">
                      {isMatching ? 'Scanning Hub...' : 'Pro Assigned.'}
                   </h2>
                   <p className="text-[11px] font-black text-slate-400 px-14 leading-relaxed uppercase tracking-[0.3em] italic opacity-60">
                      {isMatching ? 'Syncing local node supply clusters...' : 'Technician established. Telemetry linked.'}
                   </p>
                </div>
             </div>

             <div className="bg-white p-14 rounded-[5rem] border border-slate-100 shadow-2xl space-y-14 relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <p className="text-[11px] font-black uppercase text-blue-500 tracking-[0.5em]">Node-ID: {activeBooking.id.slice(-8)}</p>
                    <h3 className="text-4xl font-black text-[#0A2540] tracking-tighter leading-tight uppercase italic">{activeBooking.problemTitle}</h3>
                  </div>
                  <button onClick={() => setCurrentScreen('CHAT')} className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-center text-[#0A2540] hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                  </button>
                </div>

                <div className="h-px bg-slate-100"></div>

                {renderTimeline(activeBooking)}

                {activeBooking.providerId && (
                   <div className="bg-[#0A2540] p-12 rounded-[4rem] flex items-center justify-between group animate-slideUp border-t-8 border-blue-500 shadow-3xl">
                      <div className="flex gap-8 items-center">
                         <div className="w-20 h-20 bg-white/10 rounded-[2.5rem] flex items-center justify-center text-4xl shadow-inner border border-white/5">👤</div>
                         <div>
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.6em] mb-1">Elite Partner</p>
                            <p className="font-black text-white text-2xl uppercase tracking-tighter italic">Pro-{activeBooking.providerId.slice(-4)}</p>
                            <div className="flex gap-1 mt-1">
                               {[1,2,3,4,5].map(i => <span key={i} className="text-amber-500 text-[10px]">★</span>)}
                            </div>
                         </div>
                      </div>
                      <button className="bg-blue-600 text-white w-16 h-16 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-500/40 hover:scale-110 active:scale-95 transition-transform">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79a15.15 15.15 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.27 11.72 11.72 0 00.59 3.7 1 1 0 011 1V20a1 1 0 01-1 1A16 16 0 013 5a1 1 0 011-1h3.41a1 1 0 011 1 11.72 11.72 0 00.59 3.7 1 1 0 01-.27 1.11l-2.2 2.2z"/></svg>
                      </button>
                   </div>
                )}
             </div>
          </div>
        )}

        {currentScreen === 'CHAT' && activeBooking && (
          <div className="h-[70vh] flex flex-col animate-fadeIn">
             <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar pb-10">
                <div className="flex justify-start">
                   <div className="bg-white p-6 rounded-[2rem] rounded-tl-none border border-slate-100 max-w-[80%] shadow-sm">
                      <p className="text-sm font-medium text-[#0A2540]">Hi! I've started the journey to your node. Should arrive in 12 mins. Any specific parking info?</p>
                      <p className="text-[8px] font-black text-slate-300 uppercase mt-2">10:42 AM</p>
                   </div>
                </div>
                <div className="flex justify-end">
                   <div className="bg-[#0A2540] p-6 rounded-[2rem] rounded-tr-none text-white max-w-[80%] shadow-xl">
                      <p className="text-sm font-medium">Please park at the visitors area near Gate 3. I'll be there.</p>
                      <p className="text-[8px] font-black text-white/30 uppercase mt-2 text-right">10:45 AM</p>
                   </div>
                </div>
             </div>
             <div className="bg-white p-6 rounded-[3rem] border-2 border-slate-100 flex gap-4 shadow-2xl">
                <input 
                   type="text" 
                   placeholder="Type message..." 
                   className="flex-1 bg-transparent font-bold text-sm outline-none px-4"
                />
                <button className="bg-blue-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg">
                   <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
                </button>
             </div>
          </div>
        )}

        {currentScreen === 'ACTIVITY' && (
           <div className="space-y-10 animate-slideUp">
              <h2 className="text-5xl font-black text-[#0A2540] tracking-tighter italic uppercase">Job History.</h2>
              <div className="space-y-6">
                 {bookings.length === 0 ? (
                   <div className="text-center py-20 opacity-10">
                      <p className="text-sm font-black uppercase tracking-[0.8em]">No Active Nodes</p>
                   </div>
                 ) : bookings.map(b => (
                   <div key={b.id} onClick={() => { setActiveBookingId(b.id); setCurrentScreen('BOOKING_DETAIL'); }} className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-sm flex justify-between items-center group hover:border-blue-500 transition-all cursor-pointer">
                      <div className="space-y-2">
                         <span className={`px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${b.status === BookingStatus.COMPLETED ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                            {b.status}
                         </span>
                         <h4 className="text-xl font-black text-[#0A2540] uppercase italic tracking-tighter leading-none">{b.problemTitle}</h4>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(b.createdAt).toDateString()}</p>
                      </div>
                      <div className="w-14 h-14 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 group-hover:bg-[#0A2540] group-hover:text-white transition-all">→</div>
                   </div>
                 ))}
              </div>
           </div>
        )}
      </main>

      {/* MOBILE PERSISTENCE BAR */}
      <nav className="fixed bottom-10 left-10 right-10 bg-[#0A2540]/90 backdrop-blur-3xl border border-white/10 p-4 rounded-[3.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.4)] z-[200] flex justify-around items-center">
         {(['DASHBOARD', 'ACTIVITY', 'PROFILE'] as const).map(screen => (
           <button 
             key={screen}
             onClick={() => setCurrentScreen(screen)}
             className={`px-12 py-5 rounded-[2.5rem] transition-all flex flex-col items-center gap-2 ${currentScreen === screen ? 'bg-blue-600 text-white shadow-2xl shadow-blue-500/40 scale-105' : 'text-white/20 hover:text-white/50'}`}
           >
              <span className="text-2xl">{screen === 'DASHBOARD' ? '🏠' : screen === 'ACTIVITY' ? '📋' : '👤'}</span>
              <span className="text-[9px] font-black uppercase tracking-[0.4em]">{screen === 'DASHBOARD' ? 'HUB' : screen === 'ACTIVITY' ? 'JOBS' : 'ME'}</span>
           </button>
         ))}
      </nav>
    </div>
  );
};

export default UserModule;
