
import React, { useState, useEffect, useMemo } from 'react';
import { Booking, BookingStatus, Problem, UserEntity, LedgerEntry, VerificationStatus, Addon } from '../types';
import { PLATFORM_FEE, VISIT_CHARGE } from '../constants';
import { db } from '../DatabaseService';

interface ProviderModuleProps {
  bookings: Booking[];
  providerId: string;
  onUpdateBooking: (id: string, updates: Partial<Booking>) => void;
  problems: Problem[];
}

const ProviderModule: React.FC<ProviderModuleProps> = ({ bookings, providerId, onUpdateBooking, problems }) => {
  const [activeTab, setActiveTab] = useState<'leads' | 'active' | 'accounts'>('leads');
  const [providerUser, setProviderUser] = useState<UserEntity | null>(null);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  
  // Real-time notification simulation (Image 1 - SNS/Socket)
  const [newLeadAlert, setNewLeadAlert] = useState<Booking | null>(null);

  useEffect(() => {
    const fetchMeta = async () => {
      const users = await db.getUsers();
      const user = users.find(u => u.id === providerId);
      if (user) {
        setProviderUser(user);
        const allLedger = await db.getLedger();
        setLedger(allLedger.filter(l => l.metadata?.providerId === providerId));
      }
    };
    fetchMeta();

    // Image 1 Socket Simulation: Check for new leads every 10s
    const socketSim = setInterval(() => {
      const availableLeads = bookings.filter(b => b.status === BookingStatus.CREATED && !b.provider_id);
      if (availableLeads.length > 0 && Math.random() > 0.7) {
        setNewLeadAlert(availableLeads[0]);
        // Auto-hide alert after 5s
        setTimeout(() => setNewLeadAlert(null), 5000);
      }
    }, 10000);

    return () => clearInterval(socketSim);
  }, [providerId, bookings]);

  const myLeads = useMemo(() => bookings.filter(b => b.status === BookingStatus.CREATED), [bookings]);
  const myActive = useMemo(() => bookings.filter(b => b.provider_id === providerId && b.status !== BookingStatus.COMPLETED), [bookings, providerId]);

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto pb-20">
      {/* SNS / Real-time Notification Overlay (Image 1) */}
      {newLeadAlert && (
        <div className="fixed top-24 right-8 z-[100] animate-slideUp">
          <div className="bg-[#0A2540] text-white p-6 rounded-[2rem] shadow-3xl border border-white/10 flex items-center gap-6 max-w-sm">
            <div className="w-12 h-12 bg-[#00D4FF] rounded-2xl flex items-center justify-center text-2xl">⚡</div>
            <div>
              <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Incoming Socket Event</p>
              <h4 className="font-black text-sm uppercase">{newLeadAlert.problemTitle}</h4>
              <button onClick={() => { setActiveTab('leads'); setNewLeadAlert(null); }} className="mt-3 text-[9px] font-black text-[#00D4FF] uppercase underline">View Leads</button>
            </div>
            <button onClick={() => setNewLeadAlert(null)} className="text-white/20 hover:text-white">✕</button>
          </div>
        </div>
      )}

      {/* Provider Header with Ledger Link (Image 2) */}
      <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-10">
         <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-4xl shadow-sm">👨‍🔧</div>
            <div>
               <h2 className="text-3xl font-black text-[#0A2540] tracking-tighter leading-none">{providerUser?.name}</h2>
               <div className="flex items-center gap-3 mt-3">
                  <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">Verification: ACTIVE</span>
                  <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Jobs: {providerUser?.completed_jobs_count || 0}</span>
               </div>
            </div>
         </div>
         <div className="flex gap-4">
            <div className="bg-[#0A2540] p-6 rounded-[2rem] text-center min-w-[140px] shadow-xl shadow-blue-900/10">
               <p className="text-[9px] font-black text-blue-200 uppercase mb-1">In-App Wallet</p>
               <p className="text-2xl font-black text-white">₹{providerUser?.wallet_balance}</p>
            </div>
         </div>
      </div>

      <div className="flex bg-white rounded-3xl p-1.5 border border-gray-100 shadow-sm">
        {['leads', 'active', 'accounts'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab as any)} className={`flex-1 py-4 font-black text-[10px] uppercase rounded-2xl transition-all ${activeTab === tab ? 'bg-[#0A2540] text-white shadow-xl' : 'text-gray-400'}`}>
            {tab} {tab === 'leads' ? `(${myLeads.length})` : ''}
          </button>
        ))}
      </div>

      {activeTab === 'leads' && (
        <div className="space-y-6 animate-fadeIn">
          {myLeads.map(lead => (
            <div key={lead.id} className="bg-white p-8 rounded-[3rem] border border-gray-100 flex justify-between items-center hover:border-blue-200 transition-all">
              <div className="flex-1">
                 <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">{lead.category}</span>
                 <h3 className="text-2xl font-black text-[#0A2540] mt-2">{lead.problemTitle}</h3>
                 <p className="text-xs font-bold text-gray-400 mt-1 uppercase">SLA Target: 60 Mins • Ward: {lead.ward_id}</p>
              </div>
              <button onClick={() => onUpdateBooking(lead.id, { provider_id: providerId, status: BookingStatus.VERIFIED })} className="bg-[#0A2540] text-white px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg">Claim Job</button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'active' && (
        <div className="space-y-8 animate-fadeIn">
          {myActive.map(job => (
            <div key={job.id} className="bg-[#0A2540] p-10 rounded-[3.5rem] text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl">
               <div className="flex-1">
                  <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest">In-Progress Contract</p>
                  <h3 className="text-3xl font-black mt-2 tracking-tighter uppercase">{job.problemTitle}</h3>
                  <div className="flex items-center gap-4 mt-4 text-xs font-bold text-blue-100/50">
                    <span>👤 {job.userName}</span>
                    <span>📍 {job.address.slice(0, 20)}...</span>
                  </div>
               </div>
               <button onClick={() => onUpdateBooking(job.id, { status: BookingStatus.COMPLETED })} className="bg-[#00D4FF] text-[#0A2540] px-12 py-6 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Complete & Payout</button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'accounts' && (
        <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm animate-fadeIn">
          <h3 className="text-xl font-black text-[#0A2540] uppercase mb-8">Service Settlement History</h3>
          <div className="space-y-4">
             {ledger.map(entry => (
                <div key={entry.id} className="p-6 bg-gray-50 rounded-3xl flex justify-between items-center border border-gray-100">
                   <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date(entry.timestamp).toLocaleString()}</p>
                      <p className="text-sm font-black text-[#0A2540] uppercase">Settlement #{entry.referenceId.slice(-6)}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-lg font-black text-green-600">+₹{entry.amount}</p>
                      <span className="text-[8px] font-black text-gray-400 uppercase">Released to Bank ✓</span>
                   </div>
                </div>
             ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderModule;
