
import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Booking, User, VerificationStatus, BookingStatus, ProviderStatus, Addon, UserStatus, SLATier } from '../types';
import { db } from '../DatabaseService';
import { providerService } from '../ProviderService';
import { billingService } from '../BillingService';
import { qualityService } from '../QualityIntelligenceService';
import { fraudRiskService } from '../FraudRiskService';

interface ProviderModuleProps {
  providerId: string;
}

type ProviderScreen = 'DASHBOARD' | 'HEATMAP' | 'ACTIVE_JOB' | 'WALLET' | 'PERFORMANCE';

const ProviderModule: React.FC<ProviderModuleProps> = ({ providerId }) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentScreen, setCurrentScreen] = useState<ProviderScreen>('DASHBOARD');
  const [kycForm, setKycForm] = useState({ aadhaar: '', pan: '', upi: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [incomingLead, setIncomingLead] = useState<Booking | null>(null);
  const [leadTimer, setLeadTimer] = useState(30);
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);
  const [showBillModal, setShowBillModal] = useState<string | null>(null);
  const [billingError, setBillingError] = useState<string | null>(null);

  const userObj = db.getUsers().find(x => x.id === providerId);
  const allBookings = db.getBookings();
  const activeJob = allBookings.find(j => j.providerId === providerId && [BookingStatus.ACCEPTED, BookingStatus.IN_PROGRESS, BookingStatus.CREATED].includes(j.status));

  useEffect(() => {
    if (userObj) setUser(userObj);
  }, [userObj]);

  useEffect(() => {
    if (user?.verificationStatus === VerificationStatus.ACTIVE && user?.providerStatus === ProviderStatus.ONLINE && !activeJob && !incomingLead) {
      const interval = setInterval(() => {
        if (Math.random() > 0.8) {
          const leads = allBookings.filter(b => b.status === BookingStatus.CREATED && b.city === user.city);
          if (leads.length > 0) {
            setIncomingLead(leads[0]);
            setLeadTimer(30);
          }
        }
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [user?.verificationStatus, user?.providerStatus, activeJob, incomingLead]);

  useEffect(() => {
    if (incomingLead && leadTimer > 0) {
      const t = setTimeout(() => setLeadTimer(leadTimer - 1), 1000);
      return () => clearTimeout(t);
    } else if (leadTimer === 0) setIncomingLead(null);
  }, [incomingLead, leadTimer]);

  const handleKycSubmit = async () => {
    if (!user || isProcessing) return;
    setIsProcessing(true);
    try {
      await providerService.uploadKYC(user.id, { aadhaar: kycForm.aadhaar, pan: kycForm.pan });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompleteJob = async (bookingId: string) => {
    setBillingError(null);
    setIsProcessing(true);
    try {
      const res = await billingService.generateBill(bookingId, selectedAddons);
      if (res.success) {
        await qualityService.updateQualityScore(providerId);
        await fraudRiskService.analyzeBehavior(providerId);
        setShowBillModal(null);
        setSelectedAddons([]);
        setCurrentScreen('DASHBOARD');
      } else {
        setBillingError(res.error || "Unknown Billing Error");
      }
    } catch (e) {
      setBillingError("System Failure: Could not reconcile node.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (user?.verificationStatus !== VerificationStatus.ACTIVE) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-slate-50 py-20 px-10 animate-fadeIn font-inter flex flex-col items-center">
        <div className="w-20 h-20 bg-[#0A2540] rounded-[2rem] flex items-center justify-center text-3xl shadow-2xl mb-12">🛡️</div>
        <h2 className="text-4xl font-black text-[#0A2540] tracking-tighter uppercase italic text-center leading-none mb-4">Partner<br/><span className="text-blue-600">Onboarding.</span></h2>
        
        <div className="bg-white p-10 rounded-[4rem] border-4 border-slate-100 shadow-2xl w-full space-y-10 relative overflow-hidden">
          <div className="flex justify-between items-center">
             <p className="text-[10px] font-black uppercase text-blue-500 tracking-[0.3em]">State: {user?.verificationStatus}</p>
             <div className="flex gap-1">
                {[1, 2, 3].map(i => (
                  <div key={i} className={`h-1 w-6 rounded-full ${
                    (i === 1 && user?.verificationStatus !== VerificationStatus.REGISTERED) ||
                    (i === 2 && [VerificationStatus.ADMIN_APPROVED, VerificationStatus.ACTIVE].includes(user?.verificationStatus as any)) ||
                    (i === 3 && user?.verificationStatus === VerificationStatus.ACTIVE) ? 'bg-blue-600' : 'bg-slate-100'
                  }`}></div>
                ))}
             </div>
          </div>

          {user?.verificationStatus === VerificationStatus.REGISTERED && (
            <div className="space-y-6 animate-slideUp">
              <div className="space-y-4">
                <input className="w-full bg-slate-50 p-6 rounded-3xl font-black outline-none focus:border-blue-500 border-2 border-slate-100 text-sm" placeholder="Aadhaar ID" value={kycForm.aadhaar} onChange={e => setKycForm({...kycForm, aadhaar: e.target.value})} />
                <input className="w-full bg-slate-50 p-6 rounded-3xl font-black outline-none focus:border-blue-500 border-2 border-slate-100 text-sm" placeholder="PAN Number" value={kycForm.pan} onChange={e => setKycForm({...kycForm, pan: e.target.value})} />
              </div>
              <button disabled={isProcessing} onClick={handleKycSubmit} className={`w-full bg-[#0A2540] text-white py-6 rounded-[2.5rem] font-black uppercase tracking-widest shadow-xl transition-all ${isProcessing ? 'opacity-50' : 'hover:bg-blue-600'}`}>
                {isProcessing ? 'OCR AUDIT...' : 'Initiate Verification'}
              </button>
            </div>
          )}

          {user?.verificationStatus === VerificationStatus.KYC_PENDING && (
            <div className="text-center py-10 space-y-8 animate-fadeIn">
              <div className="text-7xl animate-pulse">📡</div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">OCR Verifying Identity...</p>
            </div>
          )}

          {user?.verificationStatus === VerificationStatus.ADMIN_APPROVED && (
            <div className="text-center py-10 space-y-8 animate-fadeIn">
              <div className="text-7xl animate-pulse">📡</div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Awaiting Admin Final Audit...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 pb-40 animate-fadeIn font-inter">
      <header className="px-10 py-12 bg-[#0A2540] text-white rounded-b-[4rem] flex justify-between items-center shadow-3xl">
        <h3 className="text-3xl font-black tracking-tighter uppercase italic">{user.name.split('_')[0]}</h3>
        <button 
          onClick={() => providerService.toggleAvailability(user.id, user.providerStatus === ProviderStatus.ONLINE ? ProviderStatus.OFFLINE : ProviderStatus.ONLINE)}
          className={`px-8 py-4 rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-xl transition-all ${user.providerStatus === ProviderStatus.ONLINE ? 'bg-emerald-500 animate-pulse' : 'bg-white/10'}`}
        >
          {user.providerStatus}
        </button>
      </header>

      <main className="px-10 py-12 space-y-8">
        {incomingLead && (
          <div className="bg-white rounded-[4rem] p-10 border-4 border-blue-500 shadow-3xl space-y-8 animate-slideUp">
            <h4 className="text-3xl font-black text-[#0A2540] tracking-tighter uppercase italic">{incomingLead.problemTitle}</h4>
            <div className="flex justify-between items-center">
              <span className="font-black text-2xl">₹{incomingLead.basePrice}</span>
              <button onClick={async () => {
                await db.updateBooking(incomingLead.id, { providerId, status: BookingStatus.ACCEPTED });
                setIncomingLead(null);
                setCurrentScreen('ACTIVE_JOB');
              }} className="bg-blue-600 text-white px-8 py-4 rounded-3xl font-black uppercase tracking-widest text-[10px]">Accept Lead</button>
            </div>
          </div>
        )}

        {currentScreen === 'DASHBOARD' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl space-y-2">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Earnings</p>
                <h4 className="text-4xl font-black text-[#0A2540] italic">₹{user.walletBalance}</h4>
              </div>
              <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl space-y-2">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Quality</p>
                <h4 className="text-4xl font-black text-blue-500 italic">{user.qualityScore}%</h4>
              </div>
            </div>
            {activeJob ? (
              <div onClick={() => setCurrentScreen('ACTIVE_JOB')} className="bg-[#0A2540] p-12 rounded-[4rem] text-white space-y-6 shadow-3xl border-t-8 border-blue-500">
                <h3 className="text-4xl font-black uppercase italic tracking-tighter leading-tight">{activeJob.problemTitle}</h3>
                <div className="flex justify-between items-center">
                   <span className="bg-emerald-500 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest animate-pulse">Job Live</span>
                   <span className="text-[10px] text-white/30 font-mono">#{activeJob.id.slice(-6)}</span>
                </div>
              </div>
            ) : (
              <div className="bg-white p-16 rounded-[4rem] border-4 border-dashed border-slate-100 text-center opacity-40">
                <p className="text-xs font-black uppercase tracking-[0.5em]">Scanning Node Supply...</p>
              </div>
            )}
          </div>
        )}

        {currentScreen === 'ACTIVE_JOB' && activeJob && (
          <div className="space-y-12 animate-fadeIn">
            <div className="space-y-4">
               <h2 className="text-4xl font-black text-[#0A2540] tracking-tighter uppercase italic leading-none">{activeJob.problemTitle}</h2>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Client Hub: {activeJob.userId.slice(-6)}</p>
            </div>
            
            {activeJob.status === BookingStatus.ACCEPTED && (
               <button 
                onClick={() => db.updateBooking(activeJob.id, { status: BookingStatus.IN_PROGRESS })}
                className="w-full bg-blue-600 text-white py-8 rounded-[3rem] font-black uppercase tracking-widest shadow-xl"
               >
                 Start Diagnostic Run
               </button>
            )}

            {activeJob.status === BookingStatus.IN_PROGRESS && (
              <div className="space-y-8 animate-fadeIn">
                <div className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-xl space-y-6">
                  <h4 className="text-xs font-black uppercase tracking-widest text-blue-500">Service Steps</h4>
                  {['Diagnostic Run', 'Safety Check', 'Part Identification'].map(s => (
                    <div key={s} className="flex gap-4 items-center">
                        <input type="checkbox" className="w-6 h-6 rounded-lg accent-blue-600" defaultChecked />
                        <p className="text-sm font-bold text-slate-600 uppercase italic">{s}</p>
                    </div>
                  ))}
                </div>
                <button onClick={() => setShowBillModal(activeJob.id)} className="w-full bg-[#0A2540] text-white py-10 rounded-[3.5rem] font-black uppercase text-xs tracking-widest shadow-2xl">Finalize & Bill</button>
              </div>
            )}
          </div>
        )}
      </main>

      {showBillModal && (
        <div className="fixed inset-0 bg-[#0A2540]/95 backdrop-blur-xl z-[2000] flex items-center justify-center p-10 animate-fadeIn">
          <div className="bg-white rounded-[5rem] p-12 w-full max-w-sm space-y-8 shadow-3xl animate-slideUp">
             <div className="text-center">
                <h3 className="text-4xl font-black text-[#0A2540] tracking-tighter uppercase italic">Final Invoice</h3>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">Node Settlement</p>
             </div>

             {billingError && (
               <div className="bg-rose-50 text-rose-500 p-6 rounded-3xl text-[10px] font-black uppercase text-center border-2 border-rose-100 animate-pulse">
                  {billingError}
               </div>
             )}

             <div className="space-y-4 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                {db.getProblems().find(p => p.id === activeJob?.serviceId)?.addons.map(a => (
                   <div key={a.id} onClick={() => {
                     const exists = selectedAddons.find(x => x.id === a.id);
                     if (exists) setSelectedAddons(selectedAddons.filter(x => x.id !== a.id));
                     else setSelectedAddons([...selectedAddons, a]);
                   }} className={`p-6 rounded-3xl border-2 cursor-pointer transition-all flex justify-between items-center ${selectedAddons.find(x => x.id === a.id) ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-blue-200'}`}>
                      <span className="text-[10px] font-black uppercase tracking-tighter">{a.name}</span>
                      <span className="font-black">₹{a.price}</span>
                   </div>
                ))}
             </div>

             <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex justify-between items-center font-black shadow-inner">
                <div className="space-y-1">
                   <p className="text-[8px] text-blue-300 tracking-[0.3em] uppercase">Total Due</p>
                   <p className="text-2xl italic tracking-tighter leading-none">₹{(activeJob?.basePrice || 0) + selectedAddons.reduce((s, a) => s + a.price, 0)}</p>
                </div>
                <div className="text-right">
                   <p className="text-[8px] text-white/30 uppercase">Node Cap</p>
                   <p className="text-sm text-rose-400">₹{activeJob?.maxPrice}</p>
                </div>
             </div>

             <button 
               disabled={isProcessing}
               onClick={() => handleCompleteJob(showBillModal)} 
               className={`w-full bg-blue-600 text-white py-8 rounded-[3rem] font-black uppercase text-xs tracking-widest shadow-2xl transition-all ${isProcessing ? 'opacity-50' : 'hover:scale-105 active:scale-95'}`}
             >
                {isProcessing ? 'Settling Hub...' : 'Confirm & Collect'}
             </button>
             <button onClick={() => { setShowBillModal(null); setBillingError(null); }} className="w-full text-slate-300 text-[10px] font-black uppercase tracking-widest">Back to Diagnostic</button>
          </div>
        </div>
      )}

      <nav className="fixed bottom-12 left-10 right-10 bg-[#0A2540]/90 backdrop-blur-3xl border border-white/10 p-4 rounded-[3.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.5)] z-[200] flex justify-around items-center">
         {(['DASHBOARD', 'WALLET', 'PERFORMANCE'] as const).map(screen => (
           <button 
             key={screen}
             onClick={() => setCurrentScreen(screen as any)}
             className={`px-8 py-4 rounded-[2rem] transition-all flex flex-col items-center gap-1 ${currentScreen === screen ? 'bg-blue-600 text-white shadow-xl' : 'text-white/20'}`}
           >
              <span className="text-xl">{screen === 'DASHBOARD' ? '🏠' : screen === 'WALLET' ? '💰' : '📊'}</span>
              <span className="text-[8px] font-black uppercase tracking-widest">{screen}</span>
           </button>
         ))}
      </nav>
    </div>
  );
};

export default ProviderModule;
