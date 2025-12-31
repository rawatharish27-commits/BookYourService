
import React, { useState } from 'react';
import { db } from '../services/DatabaseService';
import { BookingStatus, UserRole } from '../types';

const AdminModule: React.FC = () => {
  const users = db.getUsers();
  const bookings = db.getBookings();
  const ledger = db.getLedger();

  return (
    <div className="min-h-screen bg-slate-50 font-inter flex flex-col">
      <header className="bg-[#0A2540] text-white p-8 rounded-b-[3rem] shadow-2xl">
         <h1 className="text-2xl font-black italic tracking-tighter">GOVERNANCE<span className="text-blue-500">NODE</span></h1>
      </header>

      <main className="p-12 grid grid-cols-4 gap-8">
         {[
           { label: 'Revenue', val: `₹${ledger.reduce((s,l) => s + (l.category === 'PLATFORM_FEE' ? l.amount : 0), 0)}`, icon: '💰' },
           { label: 'Active Jobs', val: bookings.filter(b => b.status === BookingStatus.IN_PROGRESS).length, icon: '🛠️' },
           { label: 'Verified Pros', val: users.filter(u => u.role === UserRole.PROVIDER).length, icon: '🛡️' },
           { label: 'System Health', val: '99.9%', icon: '🟢' }
         ].map((stat, i) => (
           <div key={i} className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 space-y-2">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-4xl font-black text-[#0A2540] tracking-tighter italic">{stat.val}</h3>
           </div>
         ))}
      </main>
    </div>
  );
};

export default AdminModule;
