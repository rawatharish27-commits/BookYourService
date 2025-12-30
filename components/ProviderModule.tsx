
import React, { useState, useEffect } from 'react';
import { Booking, User, BookingStatus, ProviderStatus, Addon, VerificationStatus } from '../types';
import { db } from '../DatabaseService';
import { providerService } from '../ProviderService';
import { voiceAI } from '../AudioFulfillmentService';
import { billingService } from '../BillingService';

interface ProviderModuleProps {
  providerId: string;
}

type ProviderScreen = 'DASHBOARD' | 'JOB_ACTIVE' | 'WALLET' | 'SOP';

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
    const steps = ["Verify main breaker is OFF", "Check terminal resistance", "Seal grounding node"];
    await voiceAI.playVoiceSOP(steps, user?.name || 'Partner');
    setIsListening(false);
  };

  const handleJobComplete = async () => {
    if (!activeJob) return;
    const res = await billingService.generateBill(activeJob.id, selectedAddons);
    if (res.success) {
      alert("Job Settled. Platform fee deducted.");
      setCurrentScreen('DASHBOARD');
    } else {
      alert(res.error);
    }
  };

  if (user?.verificationStatus !== VerificationStatus.ACTIVE) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-white p-12 flex flex-col justify-center animate-fadeIn font-inter">
         <div className="space-y-10 text-center">
            <div className="text-8xl">📑</div>
            <h2 className="text-4xl font-black text-[#0A2540] tracking-tighter uppercase italic leading-none">Partner<br/><span className="text-blue-500">Audit.</span></h2>
            <div className="space-y-4">
               <input className="w-full bg-slate-50 p-6 rounded-3xl font-black text-center outline-none focus:border-blue-500 border-2 border-slate-100" placeholder="Aadhaar Node" value={kycData.aadhaar} onChange={e => setKycData({...kycData, aadhaar: e.target.value})} />
               <input className="w-full bg-slate-50 p-6 rounded-3xl font-black text-center outline-none focus:border-blue-500 border-2 border-slate-100" placeholder="PAN Node" value={kycData.pan} onChange={e => setKycData({...kycData, pan: e.target.value})} />
               <button onClick={() => providerService.uploadKYC(providerId, kycData)} className="w-full bg-[#0A2540] text-white py-6 rounded-3xl font-black uppercase tracking-widest shadow-xl">Submit for Verification</button>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status: {user?.verificationStatus}</p>
         </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 pb-40 animate-fadeIn font-inter shadow-2xl">
      <header className="px-10 py-12 bg-[#0A2540] text-white rounded-b-[4rem] flex justify-between items-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/10 to-transparent"></div>
        <div className="relative z-10">
           <h3 className="text-2xl font-black uppercase italic tracking-tighter">{user.name.split('_')[0]}</h3>
           <p className="text-[8px] font-black text-blue-300 uppercase tracking-[0.4em]">Partner Identity Node</p>
        </div>
        <button 
          onClick={() => providerService.toggleAvailability(providerId, user.providerStatus === ProviderStatus.ONLINE ? ProviderStatus.OFFLINE : ProviderStatus.ONLINE)}
          className={`relative z-10 px-6 py-3 rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all shadow-xl ${user.providerStatus === ProviderStatus.ONLINE ? 'bg-emerald-500 text-white animate-pulse' : 'bg-white/10 text-white/40'}`}
        >
          {user.providerStatus}
        </button>
      </header>

      <main className="px-10 py-12 space-y-8">
        {currentScreen === 'DASHBOARD' && (
          <div className="space-y-8 animate-slideUp">
             <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                   <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-1">Total Payouts</p>
                   <p className="text-3xl font-black text-[#0A2540] italic">₹{user.walletBalance}</p>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                   <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-1">Quality Index</p>
                   <p className="text-3xl font-black text-blue-500 italic">{user.qualityScore}%</p>
                </div>
             </div>

             {activeJob ? (
               <div onClick={() => setCurrentScreen('JOB_ACTIVE')} className="bg-white p-10 rounded-[4rem] border-t-8 border-blue-600 shadow-2xl space-y-6 cursor-pointer hover:scale-[1.02] transition-transform">
                  <div className="flex justify-between items-center">
                     <span className="bg-blue-50 text-blue-600 px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">Active Ops</span>
                     <span className="text-[10px] font-mono text-slate-300">#{activeJob.id.slice(-6)}</span>
                  </div>
                  <h2 className="text-3xl font-black text-[#0A2540] tracking-tighter uppercase italic leading-none">{activeJob.problemTitle}</h2>
                  <div className="flex justify-between items-end border-t border-slate-50 pt-6">
                     <div className="space-y-1">
                        <p className="text-[9px] font-black uppercase text-slate-400">Target Value</p>
                        <p className="text-xl font-black text-[#0A2540]">₹{activeJob.basePrice}</p>
                     </div>
                     <span className="text-blue-600 text-xs font-black uppercase tracking-widest animate-pulse">In Progress →</span>
                  </div>
               </div>
             ) : (
               <div className="py-20 text-center space-y-4 opacity-10">
                  <span className="text-7xl">📡</span>
                  <p className="text-xs font-black uppercase tracking-[0.5em]">Scanning Node Cluster...</p>
               </div>
             )}
          </div>
        )}

        {currentScreen === 'JOB_ACTIVE' && activeJob && (
          <div className="space-y-10 animate-slideUp">
             <div className="space-y-4">
                <h2 className="text-4xl font-black text-[#0A2540] tracking-tighter uppercase italic leading-none">{activeJob.problemTitle}</h2>
                <div className="flex gap-4">
                   <button onClick={handleListenSOP} className={`flex-1 py-5 rounded-2xl font-black uppercase text-[9px] tracking-widest border-2 border-[#0A2540] transition-all flex items-center justify-center gap-3 ${isListening ? 'bg-[#0A2540] text-white animate-pulse' : 'bg-white text-[#0A2540]'}`}>
                      <span>{isListening ? '🔊' : '🎧'}</span>
                      {isListening ? 'Voice SOP Playing' : 'Voice SOP Guide'}
                   </button>
                </div>
             </div>
             <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-500">Service Nodes</h4>
                {['Verify Identity', 'Diagnostic Scan', 'Isolation Complete'].map(s => (
                  <div key={s} className="flex gap-4 items-center group">
                    <input type="checkbox" className="w-6 h-6 rounded-lg accent-blue-600 cursor-pointer" />
                    <p className="text-sm font-bold text-slate-500 uppercase italic group-hover:text-[#0A2540] transition-colors">{s}</p>
                  </div>
                ))}
             </div>
             <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Materials & Add-ons</h4>
                <div className="space-y-2">
                   {db.getProblems().find(p => p.id === activeJob.serviceId)?.addons.map(a => (
                      <div key={a.id} onClick={() => {
                        if (selectedAddons.find(x => x.id === a.id)) setSelectedAddons(selectedAddons.filter(x => x.id !== a.id));
                        else setSelectedAddons([...selectedAddons, a]);
                      }} className={`p-5 rounded-2xl border-2 transition-all flex justify-between cursor-pointer ${selectedAddons.find(x => x.id === a.id) ? 'border-blue-600 bg-blue-50' : 'border-slate-100'}`}>
                         <span className="text-[10px] font-black uppercase">{a.name}</span>
                         <span className="text-xs font-black">₹{a.price}</span>
                      </div>
                   ))}
                </div>
             </div>
             <button onClick={handleJobComplete} className="w-full bg-emerald-500 text-white py-8 rounded-[2.5rem] font-black uppercase text-sm tracking-[0.2em] shadow-2xl">Settle & Close</button>
          </div>
        )}
      </main>

      <nav className="fixed bottom-10 left-10 right-10 bg-[#0A2540]/95 backdrop-blur-2xl p-4 rounded-[3.5rem] shadow-3xl z-[200] flex justify-around">
         {(['DASHBOARD', 'WALLET', 'SOP'] as const).map(screen => (
           <button key={screen} onClick={() => setCurrentScreen(screen as any)} className={`px-10 py-5 rounded-[2.5rem] transition-all ${currentScreen === screen ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'text-white/20 hover:text-white/40'}`}>
              <span className="text-2xl">{screen === 'DASHBOARD' ? '🏠' : screen === 'WALLET' ? '💰' : '🎧'}</span>
           </button>
         ))}
      </nav>
    </div>
  );
};

export default ProviderModule;
