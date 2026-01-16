
import React, { useState, useEffect } from 'react';
import { User, ProviderStatus, VerificationStatus } from '../types';
import { db } from '../services/DatabaseService';
import { providerService } from '../services/ProviderService';

interface Props { providerId: string; }

const ProviderModule: React.FC<Props> = ({ providerId }) => {
  const [user, setUser] = useState<User | null>(null);
  const [kycForm, setKycForm] = useState({ aadhaar: '', pan: '', upi: '' });

  useEffect(() => {
    const u = db.getUsers().find(x => x.id === providerId);
    if (u) setUser(u);
  }, [providerId]);

  if (!user) return null;

  if (user.verificationStatus !== VerificationStatus.ACTIVE) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-slate-50 p-12 flex flex-col justify-center animate-fadeIn font-inter space-y-12">
         <div className="text-center space-y-4">
            <div className="text-8xl">🪪</div>
            <h2 className="text-3xl font-black text-[#0A2540] uppercase italic tracking-tighter leading-none">Identity<br/>Audit.</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Verification Node: {user.verificationStatus}</p>
         </div>

         {user.verificationStatus === VerificationStatus.REGISTERED && (
           <div className="bg-white p-10 rounded-[4rem] shadow-2xl space-y-6 border border-slate-100">
             <input className="w-full bg-slate-50 p-6 rounded-3xl font-black border-2 border-slate-50" placeholder="Aadhaar Node" value={kycForm.aadhaar} onChange={e => setKycForm({...kycForm, aadhaar: e.target.value})} />
             <input className="w-full bg-slate-50 p-6 rounded-3xl font-black border-2 border-slate-50" placeholder="PAN Node" value={kycForm.pan} onChange={e => setKycForm({...kycForm, pan: e.target.value})} />
             <input className="w-full bg-slate-50 p-6 rounded-3xl font-black border-2 border-slate-50" placeholder="UPI Handle" value={kycForm.upi} onChange={e => setKycForm({...kycForm, upi: e.target.value})} />
             <button onClick={() => providerService.verifyPaymentMethod(user.id, kycForm.upi)} className="w-full bg-[#0A2540] text-white py-6 rounded-[2.5rem] font-black uppercase tracking-widest shadow-xl">Submit Docs</button>
           </div>
         )}

         {user.verificationStatus === VerificationStatus.KYC_PENDING && (
           <div className="bg-blue-50 p-12 rounded-[4rem] text-center space-y-4 animate-pulse">
              <span className="text-4xl">📡</span>
              <p className="text-xs font-black uppercase text-blue-600 tracking-widest">Audit node verifying credentials...</p>
           </div>
         )}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 animate-fadeIn font-inter">
      <header className="px-10 py-12 bg-[#0A2540] text-white rounded-b-[4rem] flex justify-between items-center shadow-3xl">
        <div className="space-y-1">
           <h3 className="text-3xl font-black italic tracking-tighter uppercase">{user.name.split('_')[0]}</h3>
           <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Trust: {user.qualityScore}%</p>
        </div>
        <button 
          onClick={() => providerService.toggleAvailability(user.id, user.providerStatus === ProviderStatus.ONLINE ? ProviderStatus.OFFLINE : ProviderStatus.ONLINE)}
          className={`px-8 py-4 rounded-[2rem] font-black text-[10px] uppercase shadow-xl transition-all ${user.providerStatus === ProviderStatus.ONLINE ? 'bg-emerald-500 animate-pulse' : 'bg-white/10'}`}
        >
          {user.providerStatus}
        </button>
      </header>

      <main className="p-10 space-y-8">
        <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 flex justify-between items-center">
           <div><p className="text-[10px] font-black text-slate-400 uppercase">Balance</p><h4 className="text-4xl font-black text-[#0A2540]">₹{user.walletBalance}</h4></div>
           <button className="bg-blue-600 text-white p-4 rounded-2xl text-[10px] font-black uppercase">Withdraw</button>
        </div>
        <div className="py-20 text-center opacity-10 space-y-4">
           <div className="text-7xl">📡</div>
           <p className="text-xs font-black uppercase tracking-[0.4em]">Scanning Dispatch Nodes...</p>
        </div>
      </main>
    </div>
  );
};

export default ProviderModule;
