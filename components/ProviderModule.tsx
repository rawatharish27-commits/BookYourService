
import React, { useState, useEffect } from 'react';
import { Booking, BookingStatus, Addon, Problem, SLATier, AuditLogEntry } from '../types';
import { PLATFORM_FEE, generateProblems } from '../constants';

interface ProviderModuleProps {
  bookings: Booking[];
  providerId: string;
  onUpdateBooking: (id: string, updates: Partial<Booking>) => void;
}

const SLATimer: React.FC<{ deadline: string; tier: SLATier }> = ({ deadline, tier }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(deadline).getTime() - now;
      
      if (distance < 0) {
        setTimeLeft('SLA BREACHED');
      } else {
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [deadline]);

  const isBreached = timeLeft === 'SLA BREACHED';

  return (
    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest border flex flex-col items-center ${
      isBreached ? 'bg-red-50 text-red-600 border-red-200' : 'bg-blue-50 text-blue-600 border-blue-200'
    }`}>
      <span className="opacity-50 text-[8px] uppercase">{tier} LIMIT</span>
      <span>{timeLeft}</span>
    </div>
  );
};

const ProviderModule: React.FC<ProviderModuleProps> = ({ bookings, providerId, onUpdateBooking }) => {
  const [activeTab, setActiveTab] = useState<'available' | 'active' | 'history'>('available');
  const [selectedBookingForBill, setSelectedBookingForBill] = useState<Booking | null>(null);
  const [activeAddons, setActiveAddons] = useState<Addon[]>([]);
  const [trustScore, setTrustScore] = useState(98);
  const [fatigueLevel] = useState(12); // Simulated fatigue (Step 52)

  const availableJobs = bookings.filter(b => b.status === BookingStatus.REQUESTED);
  const activeJobs = bookings.filter(b => b.providerId === providerId && [BookingStatus.ACCEPTED, BookingStatus.IN_PROGRESS].includes(b.status));
  const historyJobs = bookings.filter(b => b.providerId === providerId && b.status === BookingStatus.COMPLETED);

  const walletBalance = historyJobs.reduce((sum, job) => sum + job.providerEarnings, 0);

  const handleAccept = (booking: Booking) => {
    if (fatigueLevel > 90) {
      alert("Fatigue Guard Triggered: You have exceeded safety working hours. Platform lock engaged.");
      return;
    }

    let duration = 24 * 3600000;
    if (booking.slaTier === SLATier.GOLD) duration = 0.5 * 3600000;
    if (booking.slaTier === SLATier.SILVER) duration = 2 * 3600000;

    const slaDeadline = new Date(Date.now() + duration).toISOString();
    
    const newHistory: AuditLogEntry[] = [
      ...booking.history,
      { status: BookingStatus.ACCEPTED, timestamp: new Date().toISOString(), note: `Job accepted by ${providerId}`, actor: providerId }
    ];

    onUpdateBooking(booking.id, {
      providerId: providerId,
      providerName: 'Rajesh Kumar',
      status: BookingStatus.ACCEPTED,
      scheduledTime: 'Now',
      slaDeadline,
      history: newHistory
    });
  };

  const handleCompleteJob = () => {
    if (!selectedBookingForBill) return;

    const addonsTotal = activeAddons.reduce((sum, a) => sum + a.price, 0);
    const newTotal = selectedBookingForBill.basePrice + selectedBookingForBill.visitCharge + addonsTotal;
    
    const masterProblem = generateProblems().find(p => p.id === selectedBookingForBill.problemId);
    if (masterProblem && newTotal > masterProblem.maxPrice) {
      alert(`Governance Alert: Final bill (₹${newTotal}) violates ontology-linked max pricing (₹${masterProblem.maxPrice}). High-severity audit required.`);
      return;
    }

    const newHistory: AuditLogEntry[] = [
      ...selectedBookingForBill.history,
      { status: BookingStatus.COMPLETED, timestamp: new Date().toISOString(), note: 'Service concluded with evidence and audit trail', actor: providerId }
    ];

    onUpdateBooking(selectedBookingForBill.id, {
      status: BookingStatus.COMPLETED,
      selectedAddons: activeAddons,
      totalAmount: newTotal,
      providerEarnings: newTotal - PLATFORM_FEE,
      history: newHistory
    });

    setSelectedBookingForBill(null);
    setActiveAddons([]);
  };

  const reportIssue = (booking: Booking) => {
    const note = prompt("Describe the incident for the Evidence Registry:");
    if (!note) return;

    const newHistory: AuditLogEntry[] = [
      ...booking.history,
      { status: BookingStatus.FLAGGED, timestamp: new Date().toISOString(), note: `PROVIDER_REPORT: ${note}`, actor: providerId }
    ];

    onUpdateBooking(booking.id, {
      status: BookingStatus.FLAGGED,
      history: newHistory
    });
    
    setTrustScore(prev => Math.max(0, prev - 2)); // Dynamic penalty
  };

  const toggleAddon = (addon: Addon) => {
    setActiveAddons(prev => 
      prev.find(a => a.id === addon.id) 
        ? prev.filter(a => a.id !== addon.id)
        : [...prev, addon]
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Enterprise Analytics for Provider */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <section className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm flex items-center justify-between col-span-1 md:col-span-1">
          <div>
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Wallet Net</h2>
            <p className="text-4xl font-black text-[#0A2540] mt-1">₹{walletBalance.toLocaleString()}</p>
          </div>
        </section>

        <section className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm flex items-center justify-between">
          <div>
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Skill Trust</h2>
            <p className="text-4xl font-black text-[#00D4FF] mt-1">{trustScore}%</p>
          </div>
        </section>

        <section className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm flex flex-col justify-center">
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Fatigue Index (52)</h2>
          <div className="w-full bg-gray-50 h-2 rounded-full">
            <div className={`h-full rounded-full ${fatigueLevel > 70 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${fatigueLevel}%` }}></div>
          </div>
          <p className="text-[8px] font-black text-gray-400 uppercase mt-2 tracking-widest">{fatigueLevel}% - SAFE ZONE</p>
        </section>

        <section className="bg-[#0A2540] text-white rounded-[2rem] p-8 shadow-2xl flex items-center justify-between">
          <div>
            <h2 className="text-[10px] font-black text-blue-300 uppercase tracking-[0.2em]">Govt Tier</h2>
            <p className="text-xl font-black text-white mt-1 uppercase">Gold Partner</p>
          </div>
          <div className="bg-yellow-400/20 p-3 rounded-xl border border-yellow-400/30">
            <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
          </div>
        </section>
      </div>

      <div className="flex bg-white rounded-3xl p-2 shadow-sm border border-gray-100">
        <button onClick={() => setActiveTab('available')} className={`flex-1 py-4 font-black text-xs uppercase tracking-widest rounded-2xl transition-all ${activeTab === 'available' ? 'bg-[#0A2540] text-white shadow-xl' : 'text-gray-400'}`}>Dispatch Feed</button>
        <button onClick={() => setActiveTab('active')} className={`flex-1 py-4 font-black text-xs uppercase tracking-widest rounded-2xl transition-all ${activeTab === 'active' ? 'bg-[#0A2540] text-white shadow-xl' : 'text-gray-400'}`}>Sessions</button>
        <button onClick={() => setActiveTab('history')} className={`flex-1 py-4 font-black text-xs uppercase tracking-widest rounded-2xl transition-all ${activeTab === 'history' ? 'bg-[#0A2540] text-white shadow-xl' : 'text-gray-400'}`}>Audit Ledger</button>
      </div>

      <div className="space-y-6">
        {activeTab === 'available' && availableJobs.map(job => (
          <div key={job.id} className="bg-white p-10 rounded-[3rem] shadow-sm hover:border-[#00D4FF] hover:shadow-2xl transition-all group relative overflow-hidden border border-transparent">
            <div className="flex justify-between items-start mb-10">
              <div className="flex gap-8">
                <div className="h-20 w-20 bg-gray-50 text-4xl flex items-center justify-center rounded-[1.5rem] border border-gray-100 group-hover:bg-blue-50 transition-all">📍</div>
                <div>
                  <h3 className="font-black text-3xl text-[#0A2540] mb-2">{job.problemTitle}</h3>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{job.category} • {job.subCategory}</p>
                  <p className="text-sm font-medium text-gray-500 mt-2">{job.address}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-4xl font-black text-[#0A2540]">₹{job.basePrice}</p>
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-1">{job.slaTier} SLA</p>
              </div>
            </div>
            <button onClick={() => handleAccept(job)} className="w-full bg-[#0A2540] text-white font-black py-6 rounded-2xl hover:bg-black transition-all shadow-2xl shadow-indigo-100 uppercase tracking-widest text-sm">ACCEPT DISPATCH</button>
          </div>
        ))}

        {activeTab === 'active' && activeJobs.map(job => (
          <div key={job.id} className="bg-white border-4 border-blue-500 p-12 rounded-[3.5rem] shadow-2xl space-y-8 animate-slideUp">
             <div className="flex justify-between items-start">
                <div className="flex gap-8">
                  <div className="h-24 w-24 bg-blue-50 text-[#00D4FF] flex items-center justify-center rounded-[2rem] text-4xl font-black border-2 border-blue-100">{job.userName.charAt(0)}</div>
                  <div>
                    <h3 className="font-black text-4xl text-[#0A2540] mb-2">{job.userName}</h3>
                    <p className="text-lg text-gray-400 font-medium">{job.address}</p>
                  </div>
                </div>
                {job.slaDeadline && <SLATimer deadline={job.slaDeadline} tier={job.slaTier} />}
            </div>
            
            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
               <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Required Infrastructure (BOM-41)</h4>
               <div className="flex flex-wrap gap-2">
                  {generateProblems().find(p => p.id === job.problemId)?.equipmentBOM?.map((tool, i) => (
                    <span key={i} className="bg-white border border-gray-200 px-3 py-1 rounded-lg text-[10px] font-black text-gray-600 uppercase tracking-tight">✓ {tool}</span>
                  ))}
               </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => reportIssue(job)} className="flex-1 py-6 text-red-500 font-black text-xs uppercase tracking-widest border-2 border-red-50 rounded-2xl hover:bg-red-50 transition-all">Report Dispute</button>
              <button onClick={() => setSelectedBookingForBill(job)} className="flex-[2] bg-green-600 text-white font-black py-6 rounded-2xl text-xs uppercase tracking-widest hover:bg-green-700 shadow-2xl shadow-green-100 transition-all">Finalize Settlement</button>
            </div>
          </div>
        ))}
      </div>

      {selectedBookingForBill && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 z-[100]">
          <div className="bg-white rounded-[4rem] w-full max-w-2xl overflow-hidden animate-slideUp">
            <div className="bg-[#0A2540] p-12 text-white"><h3 className="text-4xl font-black tracking-tighter">Settlement Ledger</h3><p className="text-blue-300 text-xs font-black uppercase tracking-widest opacity-60 mt-2">Verified Node DS-{selectedBookingForBill.id.slice(-8).toUpperCase()}</p></div>
            <div className="p-12 space-y-8">
              <div className="space-y-6">
                <div className="flex justify-between items-center text-3xl font-black text-[#0A2540]"><span>{selectedBookingForBill.problemTitle}</span><span>₹{selectedBookingForBill.basePrice}</span></div>
                <div className="pt-6 space-y-4 border-t border-gray-100">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Add-ons Enforcement</h4>
                  {generateProblems().find(p => p.id === selectedBookingForBill.problemId)?.addons.map(addon => (
                    <button key={addon.id} onClick={() => toggleAddon(addon)} className={`w-full flex justify-between items-center p-6 rounded-[1.5rem] border-2 transition-all ${activeAddons.find(a => a.id === addon.id) ? 'bg-blue-50 border-[#00D4FF]' : 'border-gray-50 bg-gray-50/50'}`}><span className="text-sm font-black text-gray-700 uppercase">{addon.name}</span><span className="text-lg font-black">+ ₹{addon.price}</span></button>
                  ))}
                </div>
              </div>
              <div className="bg-[#0A2540] p-10 rounded-[3rem] text-white shadow-2xl">
                <div className="flex justify-between items-center mb-6"><span className="text-sm text-blue-300 font-bold uppercase tracking-widest">GMV Payable</span><span className="text-5xl font-black">₹{selectedBookingForBill.basePrice + selectedBookingForBill.visitCharge + activeAddons.reduce((s, a) => s + a.price, 0)}</span></div>
                <div className="flex justify-between items-center text-xs text-blue-400/50 pb-6 border-b border-white/5 mb-6 uppercase"><span>Platform Commission</span><span>- ₹{PLATFORM_FEE}</span></div>
                <div className="flex justify-between items-center font-black text-green-400"><span className="text-sm uppercase tracking-widest">Net Wallet Credit</span><span className="text-3xl">₹{(selectedBookingForBill.basePrice + selectedBookingForBill.visitCharge + activeAddons.reduce((s, a) => s + a.price, 0)) - PLATFORM_FEE}</span></div>
              </div>
              <div className="flex gap-6">
                <button onClick={() => setSelectedBookingForBill(null)} className="flex-1 py-6 text-gray-400 font-black text-xs uppercase tracking-widest hover:bg-gray-50 rounded-2xl transition-all">Edit</button>
                <button onClick={handleCompleteJob} className="flex-[2] bg-green-600 text-white py-6 rounded-2xl font-black text-lg uppercase tracking-widest shadow-2xl hover:bg-green-700">CLOSE TRANSACTION</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderModule;
