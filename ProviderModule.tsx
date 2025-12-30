
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
  const [incomingLead, setIncomingLead] = useState<Booking | null>(null);
  const [leadTimer, setLeadTimer] = useState(30);
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);
  const [showBillModal, setShowBillModal] = useState<string | null>(null);

  const userObj = db.getUsers().find(x => x.id === providerId);
  const allBookings = db.getBookings();
  const activeJob = allBookings.find(j => j.providerId === providerId && [BookingStatus.ACCEPTED, BookingStatus.IN_PROGRESS].includes(j.status));

  useEffect(() => {
    if (userObj) setUser(userObj);
  }, [userObj]);

  useEffect(() => {
    if (user?.providerStatus === ProviderStatus.ONLINE && !activeJob && !incomingLead) {
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
  }, [user?.providerStatus, activeJob, incomingLead]);

  useEffect(() => {
    if (incomingLead && leadTimer > 0) {
      const t = setTimeout(() => setLeadTimer(leadTimer - 1), 1000);
      return () => clearTimeout(t);
    } else if (leadTimer === 0) setIncomingLead(null);
  }, [incomingLead, leadTimer]);

  const handleKycSubmit = async () => {
    if (!user) return;
    await providerService.uploadKYC(user.id, { aadhaar: kycForm.aadhaar, pan: kycForm.pan });
    if (kycForm.upi) await providerService.verifyPaymentMethod(user.id, kycForm.upi);
    alert("KYC Submitted for Audit.");
  };

  const handleCompleteJob = async (bookingId: string) => {
    const success = await billingService.generateBill(bookingId, selectedAddons);
    if (success) {
      await qualityService.updateQualityScore(providerId);
      await fraudRiskService.analyzeBehavior(providerId);
      setShowBillModal(null);
      setSelectedAddons([]);
      setCurrentScreen('DASHBOARD');
      alert("Job Completed. Payment Processed.");
    }
  };

  if (user?.verificationStatus !== VerificationStatus.ACTIVE) {
    return (
      <div className="max-w-md mx-auto space-y-12 py-20 px-10 animate-fadeIn font-inter">
        <h2 className="text-4xl font-black text-[#0A2540] tracking-tighter uppercase italic text-center">Partner Onboarding</h2>
        <div className="bg-white p-10 rounded-[4rem] border-4 border-slate-100 shadow-2xl space-y-8">
          <p className="text-[10px] font-black uppercase text-blue-500 tracking-widest">Verification Status: {user?.verificationStatus}</p>
          {user?.verificationStatus === VerificationStatus.REGISTERED && (
            <div className="space-y-4">
              <input className="w-full bg-slate-50 p-6 rounded-3xl font-black outline-none focus:border-blue-500 border-2 border-slate-100" placeholder="Aadhaar Number" value={kycForm.aadhaar} onChange={e => setKycForm({...kycForm, aadhaar: e.target.value})} />
              <input className="w-full bg-slate-50 p-6 rounded-3xl font-black outline-none focus:border-blue-500 border-2 border-slate-100" placeholder="PAN Number" value={kycForm.pan} onChange={e => setKycForm({...kycForm, pan: e.target.value})} />
              <button onClick={handleKycSubmit} className="w-full bg-[#0A2540] text-white py-6 rounded-[2.5rem] font-black uppercase tracking-widest shadow-xl">Submit Docs</button>
            </div>
          )}
          {user?.verificationStatus === VerificationStatus.KYC_PENDING && (
            <div className="text-center py-10 space-y-4">
              <div className="text-6xl animate-pulse">📡</div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Audit Node Verifying Identity...</p>
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
          className={`px-8 py-4 rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-xl ${user.providerStatus === ProviderStatus.ONLINE ? 'bg-emerald-500 animate-pulse' : 'bg-white/10'}`}
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
            <div className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-xl space-y-6">
               <h4 className="text-xs font-black uppercase tracking-widest text-blue-500">Service Steps</h4>
               {['Diagnostic Run', 'Safety Check', 'Part Identification'].map(s => (
                 <div key={s} className="flex gap-4 items-center">
                    <input type="checkbox" className="w-6 h-6 rounded-lg accent-blue-600" />
                    <p className="text-sm font-bold text-slate-600 uppercase italic">{s}</p>
                 </div>
               ))}
            </div>
            <button onClick={() => setShowBillModal(activeJob.id)} className="w-full bg-[#0A2540] text-white py-10 rounded-[3.5rem] font-black uppercase text-xs tracking-widest shadow-2xl">Finalize & Bill</button>
          </div>
        )}
      </main>

      {showBillModal && (
        <div className="fixed inset-0 bg-[#0A2540]/95 backdrop-blur-xl z-[2000] flex items-center justify-center p-10">
          <div className="bg-white rounded-[5rem] p-12 w-full space-y-10 shadow-3xl">
             <h3 className="text-4xl font-black text-[#0A2540] tracking-tighter uppercase italic text-center">Final Invoice</h3>
             <div className="space-y-4">
                {db.getProblems().find(p => p.id === activeJob?.serviceId)?.addons.map(a => (
                   <div key={a.id} onClick={() => {
                     const exists = selectedAddons.find(x => x.id === a.id);
                     if (exists) setSelectedAddons(selectedAddons.filter(x => x.id !== a.id));
                     else setSelectedAddons([...selectedAddons, a]);
                   }} className={`p-6 rounded-3xl border-2 cursor-pointer transition-all flex justify-between ${selectedAddons.find(x => x.id === a.id) ? 'border-blue-500 bg-blue-50' : 'border-slate-100'}`}>
                      <span className="text-xs font-black uppercase">{a.name}</span>
                      <span className="font-black">₹{a.price}</span>
                   </div>
                ))}
             </div>
             <div className="bg-slate-900 p-8 rounded-3xl text-white flex justify-between items-center font-black">
                <span className="text-[10px] text-blue-300 tracking-widest uppercase">Total Bill</span>
                <span className="text-2xl italic">₹{(activeJob?.basePrice || 0) + selectedAddons.reduce((s, a) => s + a.price, 0)}</span>
             </div>
             <button onClick={() => handleCompleteJob(showBillModal)} className="w-full bg-blue-600 text-white py-8 rounded-[3rem] font-black uppercase text-xs tracking-widest shadow-2xl">Confirm Settlement</button>
             <button onClick={() => setShowBillModal(null)} className="w-full text-slate-300 text-[10px] font-black uppercase tracking-widest">Back</button>
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
