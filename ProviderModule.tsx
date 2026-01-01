import React, { useState, useEffect } from 'react';
import { Booking, User, BookingStatus, ProviderStatus, Addon, VerificationStatus } from './types';
import db from './DatabaseService';
import { providerService } from './ProviderService';
import voiceAI from './AudioFulfillmentService';
import { billingService } from './BillingService';

interface ProviderModuleProps {
  providerId: string;
}

type ProviderScreen = 'DASHBOARD' | 'JOB_ACTIVE' | 'WALLET';

const ProviderModule: React.FC<ProviderModuleProps> = ({ providerId }) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentScreen, setCurrentScreen] = useState<ProviderScreen>('DASHBOARD');
  const [isListening, setIsListening] = useState(false);

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

  if (user?.verificationStatus !== VerificationStatus.ACTIVE) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-white p-12 flex flex-col justify-center animate-fadeIn font-inter">
         <div className="space-y-10 text-center">
            <div className="text-8xl">📄</div>
            <h2 className="text-3xl font-black text-[#0A2540] uppercase italic tracking-tighter">Identity Audit</h2>
            <p className="text-slate-400">Please submit your KYC documents for verification.</p>
         </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 pb-40 animate-fadeIn font-inter">
      <header className="px-10 py-12 bg-[#0A2540] text-white rounded-b-[4rem] flex justify-between items-center shadow-3xl">
        <h3 className="text-2xl font-black uppercase italic tracking-tighter">{user.name}</h3>
        <button 
          onClick={() => providerService.toggleAvailability(providerId, user.providerStatus === ProviderStatus.ONLINE ? ProviderStatus.OFFLINE : ProviderStatus.ONLINE)}
          className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase shadow-xl transition-all ${user.providerStatus === ProviderStatus.ONLINE ? 'bg-emerald-500 animate-pulse' : 'bg-white/10'}`}
        >
          {user.providerStatus}
        </button>
      </header>
      <main className="p-8">
        {currentScreen === 'DASHBOARD' && (
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
             <p className="text-[8px] font-black uppercase text-slate-400">Ledger</p>
             <p className="text-3xl font-black text-[#0A2540] italic">₹{user.walletBalance}</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProviderModule;