
import React, { useState, useEffect } from 'react';
import { Booking, BookingStatus, Addon, SLATier, Problem, VerificationStatus, KYCData, UserEntity } from '../types';
import { PLATFORM_FEE, VISIT_CHARGE } from '../constants';
import { db } from '../DatabaseService';

interface ProviderModuleProps {
  bookings: Booking[];
  providerId: string;
  onUpdateBooking: (id: string, updates: Partial<Booking>) => void;
  problems: Problem[];
}

const ProviderModule: React.FC<ProviderModuleProps> = ({ bookings, providerId, onUpdateBooking, problems }) => {
  const [activeTab, setActiveTab] = useState<'requests' | 'active' | 'rank' | 'kyc'>('requests');
  const [sessionJob, setSessionJob] = useState<Booking | null>(null);
  const [sessionAddons, setSessionAddons] = useState<Addon[]>([]);
  const [visitTime, setVisitTime] = useState('14:00');
  const [providerUser, setProviderUser] = useState<UserEntity | null>(null);

  const [aadhaar, setAadhaar] = useState('');
  const [pan, setPan] = useState('');
  const [bankAcc, setBankAcc] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [upiId, setUpiId] = useState('');
  const [isSubmittingKYC, setIsSubmittingKYC] = useState(false);
  const [kycStep, setKycStep] = useState<'ID' | 'BANK'>('ID');

  useEffect(() => {
    const fetchUser = async () => {
      const users = await db.getUsers();
      const user = users.find(u => u.id === providerId);
      if (user) setProviderUser(user);
    };
    fetchUser();
  }, [providerId, activeTab]);

  const requests = bookings.filter(b => b.status === BookingStatus.CREATED);
  const myJobs = bookings.filter(b => b.provider_id === providerId && [BookingStatus.ASSIGNED, BookingStatus.VERIFIED, BookingStatus.IN_PROGRESS].includes(b.status));
  const myHistory = bookings.filter(b => b.provider_id === providerId && [BookingStatus.COMPLETED, BookingStatus.CLOSED].includes(b.status));
  const totalEarnings = myHistory.reduce((sum, b) => sum + (b.providerEarnings || 0), 0);

  const handleAccept = async (jobId: string) => {
    if (providerUser?.verification_status !== VerificationStatus.ACTIVE) {
      alert("UNAUTHORIZED: Complete full verification first.");
      setActiveTab('kyc');
      return;
    }
    onUpdateBooking(jobId, { status: BookingStatus.VERIFIED, provider_id: providerId });
  };

  const handleSubmitKYC = async () => {
    if (!aadhaar || !pan) { alert("Fill all fields."); return; }
    setIsSubmittingKYC(true);
    await new Promise(r => setTimeout(r, 1500));
    await db.submitKYC(providerId, { aadhaarNumber: aadhaar, panNumber: pan, selfieUrl: 'https://i.pravatar.cc/300' });
    setIsSubmittingKYC(false);
    setKycStep('BANK');
  };

  const handleVerifyBank = async () => {
    if (!bankAcc && !upiId) { alert("Enter details."); return; }
    setIsSubmittingKYC(true);
    await new Promise(r => setTimeout(r, 1500));
    await db.verifyBankUPI(providerId, { bankAccount: bankAcc, upiId: upiId });
    setIsSubmittingKYC(false);
    setActiveTab('requests');
  };

  const handleComplete = async () => {
    if (!sessionJob) return;
    const addonSum = sessionAddons.reduce((s, a) => s + a.price, 0);
    const total = sessionJob.basePrice + VISIT_CHARGE + addonSum;
    onUpdateBooking(sessionJob.id, { status: BookingStatus.COMPLETED, total_amount: total, selectedAddons: sessionAddons, providerEarnings: total - PLATFORM_FEE });
    setSessionJob(null);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto pb-20">
      <div className="bg-[#0A2540] rounded-[2.5rem] p-10 text-white flex flex-col md:flex-row justify-between items-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00D4FF] opacity-5 blur-[100px]"></div>
        <div className="relative z-10 text-center md:text-left">
          <h2 className="text-4xl font-black tracking-tighter uppercase">Partner Node</h2>
          <div className="flex items-center gap-3 mt-2 justify-center md:justify-start">
            <span className={`w-2 h-2 rounded-full ${providerUser?.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></span>
            <p className="text-blue-300 text-[10px] font-black uppercase tracking-[0.2em]">Node ID: {providerId} • {providerUser?.rank?.tier || 'RANKING PENDING'}</p>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md px-10 py-6 rounded-3xl border border-white/10 text-center mt-6 md:mt-0 relative z-10">
          <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Settled Wallet</p>
          <p className="text-4xl font-black text-[#00D4FF]">₹{totalEarnings.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex bg-white rounded-3xl p-2 border border-gray-100 shadow-sm overflow-x-auto custom-scrollbar">
        {[
          { id: 'requests', label: `New Leads (${requests.length})` },
          { id: 'active', label: `Execution (${myJobs.length})` },
          { id: 'rank', label: 'My Ranking' },
          { id: 'kyc', label: 'Verification' }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex-1 min-w-[140px] py-4 font-black text-[10px] uppercase rounded-2xl transition-all ${activeTab === tab.id ? 'bg-[#0A2540] text-white shadow-xl' : 'text-gray-400'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {activeTab === 'rank' && providerUser?.rank && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-slideUp">
             <div className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-sm space-y-8 flex flex-col items-center justify-center text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">AI Performance Score</p>
                <div className="relative">
                   <svg className="w-48 h-48 transform -rotate-90">
                      <circle cx="96" cy="96" r="88" stroke="#f3f4f6" strokeWidth="16" fill="transparent" />
                      <circle cx="96" cy="96" r="88" stroke="#00D4FF" strokeWidth="16" fill="transparent" strokeDasharray={552.92} strokeDashoffset={552.92 * (1 - providerUser.rank.score / 100)} strokeLinecap="round" />
                   </svg>
                   <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-6xl font-black text-[#0A2540]">{providerUser.rank.score}</span>
                      <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{providerUser.rank.tier}</span>
                   </div>
                </div>
                <p className="text-xs text-gray-400 font-medium max-w-xs">Your rank determines your priority in the lead matching engine. Maintain high completion rates to reach Premier tier.</p>
             </div>
             
             <div className="bg-[#0A2540] p-12 rounded-[4rem] text-white space-y-10">
                <h3 className="text-xl font-black uppercase tracking-widest">Growth Insights</h3>
                <div className="space-y-6">
                   {providerUser.rank.reasons.map((r, i) => (
                      <div key={i} className="flex gap-4 items-start">
                         <span className="w-6 h-6 bg-green-500/20 text-green-400 rounded-lg flex items-center justify-center font-black text-xs shrink-0">+</span>
                         <p className="text-sm font-bold opacity-80">{r}</p>
                      </div>
                   ))}
                   <div className="pt-6 border-t border-white/10 space-y-4">
                      <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Target Next Week</p>
                      <p className="text-xs text-white/50">Complete 3 more Gold SLA jobs to unlock "Priority Dispatch" status.</p>
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'requests' && (
          requests.length === 0 ? <div className="py-20 text-center text-gray-300 font-black uppercase tracking-widest">Awaiting dispatch signals...</div> :
          requests.map(job => (
            <div key={job.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 group hover:border-[#00D4FF] transition-all">
              <div className="flex-1"><h3 className="text-2xl font-black text-[#0A2540] leading-tight">{job.problemTitle}</h3><p className="text-sm font-bold text-gray-400 mt-1 uppercase">{job.address}</p></div>
              <button onClick={() => handleAccept(job.id)} className="bg-[#0A2540] text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Claim Job</button>
            </div>
          ))
        )}

        {activeTab === 'kyc' && (
           <div className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-sm text-center">
              {providerUser?.verification_status === VerificationStatus.ACTIVE ? (
                 <div className="space-y-4"><h3 className="text-3xl font-black text-green-600">NODE ACTIVE</h3><p className="text-gray-400 text-xs font-bold uppercase">All verification checkpoints passed.</p></div>
              ) : (
                <div className="space-y-8 max-w-md mx-auto">
                   <h3 className="text-2xl font-black text-[#0A2540]">Registration Protocol</h3>
                   {kycStep === 'ID' ? (
                     <div className="space-y-6">
                        <input type="text" placeholder="Aadhaar" className="w-full p-6 bg-gray-50 rounded-2xl font-bold" value={aadhaar} onChange={e=>setAadhaar(e.target.value)}/>
                        <input type="text" placeholder="PAN" className="w-full p-6 bg-gray-50 rounded-2xl font-bold" value={pan} onChange={e=>setPan(e.target.value)}/>
                        <button onClick={handleSubmitKYC} className="w-full bg-[#0A2540] text-white py-6 rounded-2xl font-black uppercase">Verify Identity</button>
                     </div>
                   ) : (
                     <div className="space-y-6">
                        <input type="text" placeholder="Bank Acc" className="w-full p-6 bg-gray-50 rounded-2xl font-bold" value={bankAcc} onChange={e=>setBankAcc(e.target.value)}/>
                        <button onClick={handleVerifyBank} className="w-full bg-green-600 text-white py-6 rounded-2xl font-black uppercase">Initiate Penny-Drop</button>
                     </div>
                   )}
                </div>
              )}
           </div>
        )}
      </div>

      {sessionJob && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 z-[100]">
          <div className="bg-white rounded-[4rem] w-full max-w-xl p-10 space-y-10">
            <h3 className="text-3xl font-black text-[#0A2540] text-center uppercase tracking-tighter">Finalize Service</h3>
            <div className="bg-gray-50 p-10 rounded-3xl space-y-6">
               <div className="flex justify-between font-black uppercase text-[10px] text-gray-400"><span>Base + Visit</span><span>₹{sessionJob.basePrice + VISIT_CHARGE}</span></div>
               <div className="flex justify-between font-black uppercase text-xl text-[#0A2540] border-t border-gray-200 pt-6"><span>Total Bill</span><span>₹{sessionJob.basePrice + VISIT_CHARGE}</span></div>
            </div>
            <button onClick={handleComplete} className="w-full bg-green-600 text-white py-6 rounded-2xl font-black uppercase shadow-2xl">Confirm & Settle Wallet</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderModule;
