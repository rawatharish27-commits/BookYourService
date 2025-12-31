import React from 'react';
import { db } from '../services/DatabaseService';
import { BookingStatus, UserRole } from '../types';

const AdminModule: React.FC = () => {
  const users = db.getUsers();
  const bookings = db.getBookings();
  const ledger = db.getLedger();

  const stats = [
    { label: 'System Revenue', val: `₹${ledger.reduce((s, l) => s + (l.category === 'PLATFORM_FEE' ? l.amount : 0), 0)}`, icon: '💰' },
    { label: 'Active Dispatches', val: bookings.filter(b => b.status === BookingStatus.IN_PROGRESS).length, icon: '📡' },
    { label: 'Verified Partners', val: users.filter(u => u.role === UserRole.PROVIDER).length, icon: '🛡️' },
    { label: 'Network Health', val: '99.9%', icon: '🟢' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-inter flex flex-col p-10 space-y-12">
      <header className="bg-[#0A2540] text-white p-12 rounded-[4rem] shadow-3xl flex justify-between items-center">
         <div className="space-y-2">
            <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Governance<br/><span className="text-blue-500">Node Hub.</span></h1>
            <p className="text-[9px] font-black text-blue-300 uppercase tracking-[0.4em] opacity-60">Real-time telemetry established</p>
         </div>
         <div className="w-16 h-16 bg-white/10 rounded-[2rem] flex items-center justify-center text-3xl">⚙️</div>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
         {stats.map((stat, i) => (
           <div key={i} className="bg-white p-12 rounded-[4rem] shadow-sm border border-slate-100 space-y-4 hover:shadow-2xl transition-all group">
              <div className="flex justify-between items-center">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                 <span className="text-2xl group-hover:scale-125 transition-transform">{stat.icon}</span>
              </div>
              <h3 className="text-4xl font-black text-[#0A2540] tracking-tighter italic leading-none">{stat.val}</h3>
           </div>
         ))}
      </main>

      <section className="bg-white p-12 rounded-[5rem] border border-slate-100 shadow-sm flex-1">
         <h2 className="text-xs font-black uppercase tracking-widest text-[#0A2540] mb-8">System Audit Log</h2>
         <div className="space-y-4 opacity-40 italic text-center py-20">
            <div className="text-6xl mb-4">📜</div>
            <p className="text-xs font-black uppercase tracking-widest">Streaming live forensics...</p>
         </div>
      </section>
    </div>
  );
};

export default AdminModule;