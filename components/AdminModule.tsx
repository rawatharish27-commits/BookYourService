
import React, { useState } from 'react';
import { db } from '../DatabaseService';
import { UserRole, VerificationStatus, User } from '../types';

const AdminModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'verify' | 'fraud' | 'logs'>('verify');
  
  const users = db.getUsers();
  const bookings = db.getBookings();
  const pending = users.filter(u => u.role === UserRole.PROVIDER && u.verificationStatus !== VerificationStatus.ACTIVE);
  const auditLogs = db.getAuditLogs().slice().reverse();

  const handleApprove = async (provider: User) => {
    provider.verificationStatus = VerificationStatus.ACTIVE;
    await db.upsertUser(provider);
    await db.logAction('ADMIN_ROOT', 'VERIFY_PROVIDER', 'User', provider.id, { status: 'ACTIVE' });
    alert(`${provider.name} is now ACTIVE`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-fadeIn pb-24">
      {/* Governance Banner */}
      <div className="bg-[#0A2540] p-16 rounded-[5rem] text-white shadow-3xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-12">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 opacity-10 blur-[150px] rounded-full"></div>
        <div className="relative z-10 space-y-4">
          <h2 className="text-5xl font-black tracking-tighter uppercase leading-none">Enterprise<br/>Controller</h2>
          <div className="flex gap-2">
            <span className="bg-white/10 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-blue-300">Live Node Analytics</span>
            <span className="bg-emerald-500/10 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-emerald-400">System Healthy</span>
          </div>
        </div>
        
        <div className="relative z-10 flex bg-white/5 p-3 rounded-[2.5rem] border border-white/10">
          {['verify', 'fraud', 'logs'].map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab as any)}
              className={`px-10 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-[#0A2540] shadow-xl' : 'text-slate-400 hover:text-white'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'verify' && (
        <div className="bg-white p-12 rounded-[4rem] shadow-sm border border-slate-100 space-y-10">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-black text-[#0A2540] tracking-tighter uppercase">Provider Queue ({pending.length})</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {pending.length === 0 ? (
              <p className="py-20 text-center text-slate-400 font-bold">All partners verified.</p>
            ) : (
              pending.map(p => (
                <div key={p.id} className="py-10 flex justify-between items-center group">
                  <div className="flex gap-8 items-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-3xl shadow-inner group-hover:bg-blue-50 transition-colors">👨‍🔧</div>
                    <div>
                      <h4 className="text-2xl font-black text-[#0A2540] tracking-tight">{p.name}</h4>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Status: {p.verificationStatus} • Aadhaar: {p.kycDetails?.aadhaarNumber || 'PENDING'}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => handleApprove(p)}
                      className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-emerald-600 transition-all"
                    >
                      Approve
                    </button>
                    <button className="bg-slate-50 text-slate-400 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-50 hover:text-rose-500 transition-all">Reject</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'fraud' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm space-y-10">
            <h3 className="text-xl font-black text-[#0A2540] uppercase tracking-tighter">Risk Assessment Heatmap</h3>
            <div className="space-y-6">
              {users.filter(u => u.fraudScore > 0).sort((a,b) => b.fraudScore - a.fraudScore).map(u => (
                <div key={u.id} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex justify-between items-center">
                  <div>
                    <p className="font-black text-[#0A2540] uppercase text-xs">{u.name}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{u.role} NODE</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-3xl font-black ${u.fraudScore > 70 ? 'text-rose-500' : 'text-amber-500'}`}>{u.fraudScore}%</p>
                    <p className="text-[9px] font-black text-slate-300 uppercase">Fraud Probability</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-[#0A2540] p-12 rounded-[4rem] text-white space-y-10 flex flex-col justify-center text-center">
            <p className="text-blue-300 text-[10px] font-black uppercase tracking-[0.4em]">Total Marketplace Volume</p>
            <h4 className="text-7xl font-black tracking-tighter italic">₹{bookings.reduce((sum, b) => sum + (b.total || 0), 0)}</h4>
            <div className="pt-10">
              <span className="bg-white/10 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest text-emerald-400">₹{db.getLedger().filter(l => l.category === 'PLATFORM_FEE').reduce((sum, l) => sum + l.amount, 0)} Realized Profit</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="bg-white p-12 rounded-[4rem] shadow-sm border border-slate-100 overflow-hidden">
          <h3 className="text-xl font-black text-[#0A2540] uppercase tracking-tighter mb-10">Immutable Audit Trail</h3>
          <div className="max-h-[600px] overflow-y-auto space-y-4 pr-6 custom-scrollbar">
            {auditLogs.map(log => (
              <div key={log.id} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex justify-between items-center group hover:bg-white hover:border-blue-200 transition-all">
                <div className="flex gap-8 items-center">
                  <span className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-[10px] text-slate-400 border border-slate-100">#{log.id.slice(-4)}</span>
                  <div>
                    <p className="font-black text-[#0A2540] uppercase text-xs tracking-widest">{log.action}</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Entity: {log.entity} | Actor: {log.actorId.slice(-6)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#0A2540] text-sm">{new Date(log.timestamp).toLocaleTimeString()}</p>
                  <p className="text-[9px] font-black text-slate-300 uppercase">{new Date(log.timestamp).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminModule;
