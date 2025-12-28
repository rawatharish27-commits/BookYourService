
import React, { useState, useEffect } from 'react';
import { Booking, User, VerificationStatus, BookingStatus } from '../types';
import { db } from '../DatabaseService';
import { bookingService } from '../BookingService';

interface ProviderModuleProps {
  providerId: string;
}

const ProviderModule: React.FC<ProviderModuleProps> = ({ providerId }) => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'leads' | 'active' | 'wallet'>('leads');
  const [kycForm, setKycForm] = useState({ aadhaar: '', pan: '', bank: '' });
  
  const allBookings = db.getBookings();
  const userObj = db.getUsers().find(x => x.id === providerId);

  useEffect(() => {
    if (userObj) setUser(userObj);
  }, [userObj]);

  const handleKycSubmit = async () => {
    if (!user) return;
    const updated = {
      ...user,
      verificationStatus: VerificationStatus.KYC_PENDING,
      kycDetails: { ...kycForm, documentsUploaded: true }
    };
    await db.upsertUser(updated);
    await db.logAction(user.id, 'SUBMIT_KYC', 'User', user.id);
    setUser(updated);
  };

  const leads = allBookings.filter(b => b.status === BookingStatus.CREATED);
  const myJobs = allBookings.filter(b => b.providerId === providerId);
  const walletHistory = db.getLedger().filter(l => l.userId === providerId);

  // If not active, show KYC flow
  if (user?.verificationStatus !== VerificationStatus.ACTIVE) {
    return (
      <div className="max-w-xl mx-auto space-y-12 py-10 animate-fadeIn">
        <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-slate-100 space-y-10">
          <div className="text-center space-y-4">
            <div className="w-24 h-24 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">🛠️</div>
            <h2 className="text-3xl font-black text-[#0A2540] tracking-tighter">Onboarding Node</h2>
            <p className="text-sm text-slate-400 px-10">Current Status: <b className="text-[#0A2540] uppercase">{user?.verificationStatus}</b></p>
          </div>

          <div className="space-y-6">
            <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Aadhaar Number</label>
                <input 
                  type="text" 
                  className="w-full bg-white border border-slate-200 p-5 rounded-3xl font-black text-lg outline-none focus:border-blue-500 transition-all" 
                  placeholder="0000 0000 0000"
                  value={kycForm.aadhaar}
                  onChange={e => setKycForm({...kycForm, aadhaar: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">PAN Number</label>
                <input 
                  type="text" 
                  className="w-full bg-white border border-slate-200 p-5 rounded-3xl font-black text-lg outline-none focus:border-blue-500 transition-all" 
                  placeholder="ABCDE1234F"
                  value={kycForm.pan}
                  onChange={e => setKycForm({...kycForm, pan: e.target.value})}
                />
              </div>
            </div>
            
            <button 
              onClick={handleKycSubmit}
              className="w-full bg-[#0A2540] text-white py-6 rounded-3xl font-black uppercase text-xs tracking-[0.2em] shadow-xl active:scale-95 transition-all"
            >
              Submit KYC for Review
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-fadeIn max-w-5xl mx-auto pb-24">
      {/* Wallet Header */}
      <div className="bg-[#0A2540] p-12 rounded-[4rem] text-white flex justify-between items-center shadow-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400 opacity-10 blur-[100px] rounded-full"></div>
        <div className="relative z-10">
          <p className="text-blue-300 text-[10px] font-black uppercase tracking-[0.3em]">Partner Wallet</p>
          <h2 className="text-6xl font-black tracking-tighter mt-2">₹{user?.walletBalance}</h2>
        </div>
        <div className="relative z-10 flex gap-4">
          <button onClick={() => setActiveTab('leads')} className={`px-8 py-4 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'leads' ? 'bg-[#00D4FF] text-[#0A2540]' : 'bg-white/10 text-white'}`}>Leads ({leads.length})</button>
          <button onClick={() => setActiveTab('active')} className={`px-8 py-4 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'active' ? 'bg-[#00D4FF] text-[#0A2540]' : 'bg-white/10 text-white'}`}>Jobs</button>
          <button onClick={() => setActiveTab('wallet')} className={`px-8 py-4 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'wallet' ? 'bg-[#00D4FF] text-[#0A2540]' : 'bg-white/10 text-white'}`}>Wallet</button>
        </div>
      </div>

      {activeTab === 'leads' && (
        <div className="grid gap-6">
          {leads.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[4rem] border border-slate-100">
              <p className="text-slate-400 font-bold">No leads in your area right now.</p>
            </div>
          ) : (
            leads.map(lead => (
              <div key={lead.id} className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm flex justify-between items-center hover:scale-[1.01] transition-transform">
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">{lead.city}</span>
                    <span className="bg-blue-50 text-blue-500 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">{lead.category}</span>
                  </div>
                  <h3 className="text-3xl font-black text-[#0A2540] tracking-tighter">{lead.problemTitle}</h3>
                  <p className="text-xs font-bold text-slate-400">Guaranteed Minimum Payout: ₹{lead.basePrice - 10}</p>
                </div>
                <button 
                  onClick={() => bookingService.transition(lead.id, BookingStatus.ASSIGNED, { providerId })}
                  className="bg-[#0A2540] text-white px-12 py-6 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-blue-600 transition-colors"
                >
                  Accept Lead
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'active' && (
        <div className="space-y-6">
          {myJobs.filter(j => j.status !== BookingStatus.CLOSED).map(job => (
            <div key={job.id} className="bg-white p-12 rounded-[4rem] border-2 border-slate-100 shadow-sm space-y-10">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-blue-500 text-[10px] font-black uppercase tracking-widest border border-blue-100 px-4 py-1.5 rounded-full">{job.status}</span>
                  <h3 className="text-4xl font-black text-[#0A2540] tracking-tighter mt-4">{job.problemTitle}</h3>
                </div>
                {job.status === BookingStatus.ASSIGNED && (
                  <button 
                    onClick={() => bookingService.transition(job.id, BookingStatus.ACCEPTED)}
                    className="bg-emerald-500 text-white px-10 py-5 rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-lg"
                  >
                    Mark Arrived
                  </button>
                )}
                {job.status === BookingStatus.ACCEPTED && (
                  <button 
                    onClick={() => bookingService.transition(job.id, BookingStatus.IN_PROGRESS)}
                    className="bg-blue-500 text-white px-10 py-5 rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-lg"
                  >
                    Start Work
                  </button>
                )}
                {job.status === BookingStatus.IN_PROGRESS && (
                  <button 
                    onClick={() => bookingService.transition(job.id, BookingStatus.COMPLETED)}
                    className="bg-[#0A2540] text-white px-10 py-5 rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-lg"
                  >
                    Finish & Bill
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-8 border-t border-slate-50 pt-10">
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Client Name</p>
                  <p className="font-black text-[#0A2540]">{job.userName || 'Customer Node'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Location</p>
                  <p className="font-black text-[#0A2540]">{job.city} Center Hub</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'wallet' && (
        <div className="bg-white rounded-[4rem] p-12 border border-slate-100 shadow-sm space-y-8">
          <h3 className="text-xl font-black text-[#0A2540] uppercase tracking-tighter">Settlement History</h3>
          <div className="space-y-4">
            {walletHistory.reverse().map(l => (
              <div key={l.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex justify-between items-center">
                <div className="flex gap-6 items-center">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${l.type === 'CREDIT' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                    {l.type === 'CREDIT' ? '↓' : '↑'}
                  </div>
                  <div>
                    <p className="font-black text-[#0A2540] uppercase text-xs">{l.category}</p>
                    <p className="text-[10px] font-bold text-slate-400">Ref: {l.bookingId}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xl font-black ${l.type === 'CREDIT' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {l.type === 'CREDIT' ? '+' : '-'}₹{l.amount}
                  </p>
                  <p className="text-[9px] font-black text-slate-300 uppercase">{new Date(l.timestamp).toLocaleDateString()}</p>
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
