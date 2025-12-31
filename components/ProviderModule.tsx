
import React, { useState, useEffect } from 'react';
import { Booking, User, BookingStatus, ProviderStatus, Addon, VerificationStatus } from '../types';
import { db } from '../DatabaseService';
import { providerService } from '../ProviderService';
import { voiceAI } from '../AudioFulfillmentService';
import { billingService } from '../BillingService';

interface ProviderModuleProps {
  providerId: string;
}

type ProviderScreen = 'DASHBOARD' | 'JOB_ACTIVE' | 'WALLET';

const ProviderModule: React.FC<ProviderModuleProps> = ({ providerId }) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentScreen, setCurrentScreen] = useState<ProviderScreen>('DASHBOARD');
  const [isListening, setIsListening] = useState(false);
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);
  const [kycData, setKycData] = useState({ aadhaar: '', pan: '' });

  const userObj = db.getUsers().find(x => x.id === providerId);
  const activeJob = db.getBookings().find(j => j.providerId === providerId && [BookingStatus.ACCEPTED, BookingStatus.IN_PROGRESS].includes(j.status));

  useEffect(() => { if (userObj) setUser(userObj); }, [userObj]);

  const handleListenSOP = async () => {
    if (!activeJob) return;
    setIsListening(true);
    const steps = ["Verify system lockdown", "Isolate energy source", "Proceed with node repair"];
    await voiceAI.playVoiceSOP(steps, user?.name || 'Partner');
    setIsListening(false);
  };

  const handleJobComplete = async () => {
    if (!activeJob) return;
    const res = await billingService.generateBill(activeJob.id, selectedAddons);
    if (res.success) {
      alert("Job Settled. Platform node updated.");
      setCurrentScreen('DASHBOARD');
    } else {
      alert(res.error);
    }
  };

  if (user?.verificationStatus !== VerificationStatus.ACTIVE) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-white p-12 flex flex-col justify-center animate-fadeIn font-inter">
         <div className="space-y-10 text-center">
            <div className="text-8xl">📄</div>
            <h2 className="text-3xl font-black text-[#0A2540] uppercase italic tracking-tighter">Identity Audit</h2>
            <div className="space-y-4">
               <input className="w-full bg-slate-50 p-6 rounded-3xl font-black outline-none border-2 border-slate-100" placeholder="Aadhaar Node" value={kycData.aadhaar} onChange={e => setKycData({...kycData, aadhaar: e.target.value})} />
               <input className="w-full bg-slate-50 p-6 rounded-3xl font-black outline-none border-2 border-slate-100" placeholder="PAN Node" value={kycData.pan} onChange={e => setKycData({...kycData, pan: e.target.value})} />
               <button onClick={() => providerService.uploadKYC(providerId, kycData)} className="w-full bg-[#0A2540] text-white py-6 rounded-3xl font-black uppercase tracking-widest shadow-xl">Submit to Governance</button>
            </div>
         </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 pb-40 animate-fadeIn font-inter">
      <header className="px-10 py-12 bg-[#0A2540] text-white rounded-b-[4rem] flex justify-between items-center shadow-3xl">
        <div className="space-y-1">
           <h3 className="text-2xl font-black uppercase italic tracking-tighter">{user.name.split('_')[0]}</h3>
           <p className="text-[8px] font-black text-blue-300 uppercase tracking-widest">Trust Index: {user.qualityScore}%</p>
        </div>
        <button 
          onClick={() => providerService.toggleAvailability(providerId, user.providerStatus === ProviderStatus.ONLINE ? ProviderStatus.OFFLINE : ProviderStatus.ONLINE)}
          className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase shadow-xl transition-all ${user.providerStatus === ProviderStatus.ONLINE ? 'bg-emerald-500 animate-pulse' : 'bg-white/10 text-white/40'}`}
        >
          {user.providerStatus}
        </button>
      </header>

      <main className="p-8 space-y-8">
        {currentScreen === 'DASHBOARD' && (
          <div className="space-y-8 animate-slideUp">
             <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                   <p className="text-[8px] font-black uppercase text-slate-400">Ledger</p>
                   <p className="text-3xl font-black text-[#0A2540] italic">₹{user.walletBalance}</p>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                   <p className="text-[8px] font-black uppercase text-slate-400">Ops Rate</p>
                   <p className="text-3xl font-black text-blue-600 italic">98%</p>
                </div>
             </div>

             {activeJob ? (
               <div onClick={() => setCurrentScreen('JOB_ACTIVE')} className="bg-white p-10 rounded-[4rem] shadow-2xl border-t-8 border-blue-600 space-y-6 cursor-pointer hover:scale-105 transition-transform">
                  <span className="bg-blue-50 text-blue-600 px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest animate-pulse">Live Operation</span>
                  <h2 className="text-3xl font-black text-[#0A2540] tracking-tighter uppercase italic">{activeJob.problemTitle}</h2>
                  <div className="flex justify-between items-center border-t border-slate-50 pt-6">
                     <p className="text-xl font-black text-[#0A2540]">₹{activeJob.basePrice}</p>
                     <span className="text-blue-600 text-[10px] font-black uppercase italic">In Progress →</span>
                  </div>
               </div>
             ) : (
               <div className="py-20 text-center space-y-4 opacity-10">
                  <span className="text-7xl">📡</span>
                  <p className="text-xs font-black uppercase tracking-widest">Scanning Dispatch Queue...</p>
               </div>
             )}
          </div>
        )}

        {currentScreen === 'JOB_ACTIVE' && activeJob && (
          <div className="space-y-10 animate-slideUp">
             <div className="space-y-4">
                <h2 className="text-4xl font-black text-[#0A2540] tracking-tighter uppercase italic leading-none">{activeJob.problemTitle}</h2>
                <button onClick={handleListenSOP} className={`w-full py-5 rounded-3xl font-black uppercase text-xs tracking-widest border-2 transition-all flex items-center justify-center gap-3 ${isListening ? 'bg-[#0A2540] text-white animate-pulse' : 'bg-white border-[#0A2540] text-[#0A2540]'}`}>
                   <span>{isListening ? '🔊' : '🎧'}</span> {isListening ? 'Playing SOP Node' : 'Voice SOP Guide'}
                </button>
             </div>
             
             <div className="bg-white p-10 rounded-[3.5rem] shadow-xl border border-slate-100 space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-500">Service Nodes</h4>
                {['Diagnostic Run', 'Safety Check', 'Component Repair'].map(s => (
                  <div key={s} className="flex gap-4 items-center group">
                    <input type="checkbox" className="w-6 h-6 rounded-lg accent-blue-600" />
                    <p className="text-sm font-bold text-slate-500 uppercase italic group-hover:text-[#0A2540]">{s}</p>
                  </div>
                ))}
             </div>

             <button onClick={handleJobComplete} className="w-full bg-emerald-500 text-white py-8 rounded-[3rem] font-black uppercase text-xs tracking-widest shadow-2xl">Complete & Settle</button>
          </div>
        )}
      </main>

      <nav className="fixed bottom-10 left-10 right-10 bg-[#0A2540]/95 backdrop-blur-xl p-4 rounded-[3.5rem] shadow-3xl flex justify-around items-center z-[200]">
         {(['DASHBOARD', 'WALLET'] as const).map(screen => (
           <button key={screen} onClick={() => setCurrentScreen(screen as any)} className={`px-10 py-5 rounded-[2.5rem] transition-all ${currentScreen === screen ? 'bg-blue-600 text-white' : 'text-white/20'}`}>
              <span className="text-2xl">{screen === 'DASHBOARD' ? '🏠' : '💰'}</span>
           </button>
         ))}
      </nav>
    </div>
  );
};

export default ProviderModule;
