
import React, { useState, useEffect, useCallback } from 'react';
import { UserRole, Booking, Problem, UserEntity, BookingStatus } from './types';
import { generateProblems, PLATFORM_FEE, VISIT_CHARGE } from './constants';
import { db } from './DatabaseService';
import { auth } from './AuthService';
import UserModule from './components/UserModule';
import ProviderModule from './components/ProviderModule';
import AdminModule from './components/AdminModule';
import PitchModule from './components/PitchModule';
import AIAssistant from './components/AIAssistant';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserEntity | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [problems] = useState<Problem[]>(generateProblems());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [view, setView] = useState<'main' | 'pitch'>('main');
  
  // Auth Form State
  const [authStep, setAuthStep] = useState<'phone' | 'profile' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [city, setCity] = useState('DL');
  const [otp, setOtp] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.USER);
  const [legalConsent, setLegalConsent] = useState(false); // Section 9.3
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async (user: UserEntity) => {
    const allRequests = await db.getRequests();
    let filtered = allRequests;
    if (user.role_id === UserRole.USER) filtered = allRequests.filter(r => r.user_id === user.id);
    else if (user.role_id === UserRole.PROVIDER || user.role_id === UserRole.ADMIN) {
      filtered = allRequests.filter(r => r.state_code === user.state_code);
    }
    
    const enriched: Booking[] = filtered.map(r => {
      const prob = problems.find(p => p.id === r.service_id) || problems[0];
      return { 
        ...r, 
        userName: user.name, 
        problemTitle: prob.title, 
        category: prob.category, 
        subCategory: prob.subCategory,
        basePrice: prob.basePrice,
        selectedAddons: r.selectedAddons || [],
        visitCharge: VISIT_CHARGE,
        platformFee: PLATFORM_FEE,
        providerEarnings: r.total_amount - PLATFORM_FEE,
        address: r.address || 'Skyline Heights, Tower C, Gurgaon',
        ontologyId: prob.ontologyId,
        slaTier: prob.slaTier,
        severity: prob.severity
      };
    });
    setBookings(enriched);
  }, [problems]);

  useEffect(() => {
    const session = auth.getSession();
    if (session) {
      setCurrentUser(session.user);
      setSessionToken(session.token);
      loadData(session.user);
    }
  }, [loadData]);

  const handleInitiateOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await auth.initiateOTP(phone, role);
    if (res.success) {
      const users = await db.getUsers();
      const existing = users.find(u => u.phone === phone);
      if (existing) setAuthStep('otp');
      else setAuthStep('profile');
    }
    setLoading(false);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const session = await auth.verifyOTP(otp, { name, city, legal_consent_accepted: legalConsent });
    if (session) {
      setCurrentUser(session.user);
      setSessionToken(session.token);
      loadData(session.user);
    } else {
      alert('Invalid OTP (Hint: 1234) or Legal Consent required.');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    auth.logout();
    setCurrentUser(null);
    setSessionToken(null);
    setAuthStep('phone');
    setPhone('');
    setOtp('');
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#F4F7F9] flex items-center justify-center p-6 font-sans">
        <div className="bg-white w-full max-w-md rounded-[3rem] shadow-3xl p-12 space-y-8 animate-fadeIn">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-black text-[#0A2540] tracking-tighter">DOORSTEP <span className="text-[#00D4FF]">PRO</span></h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Enterprise Platform Node</p>
          </div>

          {authStep === 'phone' && (
            <form onSubmit={handleInitiateOTP} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-2">Role</label>
                <select className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 outline-none font-bold" value={role} onChange={e => setRole(e.target.value as UserRole)}>
                  <option value={UserRole.USER}>Customer</option>
                  <option value={UserRole.PROVIDER}>Service Partner</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-2">Mobile Number</label>
                <input type="tel" placeholder="+91 00000 00000" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-[#00D4FF] font-black text-lg" value={phone} onChange={e => setPhone(e.target.value)} required />
              </div>
              <button disabled={loading} type="submit" className="w-full bg-[#0A2540] text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">Send OTP</button>
            </form>
          )}

          {authStep === 'profile' && (
            <div className="space-y-6 animate-fadeIn">
              <p className="text-[10px] font-black text-blue-500 uppercase text-center">Section 9: Legal Consent Gating</p>
              <div className="space-y-4">
                <input type="text" placeholder="Full Name" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 outline-none font-bold" value={name} onChange={e => setName(e.target.value)} required />
                <select className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 outline-none font-bold" value={city} onChange={e => setCity(e.target.value)}>
                  <option value="DL">Delhi NCR</option>
                  <option value="GUR">Gurgaon</option>
                  <option value="BLR">Bangalore</option>
                </select>
                <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100 space-y-4">
                   <div className="flex items-start gap-4">
                      <input type="checkbox" id="legal" className="mt-1 w-5 h-5 accent-[#0A2540]" checked={legalConsent} onChange={e => setLegalConsent(e.target.checked)} />
                      <label htmlFor="legal" className="text-[10px] font-bold text-gray-500 leading-relaxed uppercase">
                         I agree to the <span className="text-blue-600">Terms of Service</span> and <span className="text-blue-600">Privacy Policy</span>. I acknowledge the platform acts as an intermediary.
                      </label>
                   </div>
                </div>
              </div>
              <button onClick={() => legalConsent && setAuthStep('otp')} disabled={!legalConsent} className={`w-full py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl transition-all ${legalConsent ? 'bg-[#0A2540] text-white' : 'bg-gray-100 text-gray-300'}`}>Verify OTP</button>
            </div>
          )}

          {authStep === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-4 animate-fadeIn">
              <p className="text-center text-[10px] font-black text-blue-500 uppercase">Verify OTP sent to {phone}</p>
              <input type="text" placeholder="1234" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 outline-none font-black text-center text-3xl tracking-widest" maxLength={4} value={otp} onChange={e => setOtp(e.target.value)} required />
              <button disabled={loading} type="submit" className="w-full bg-[#00D4FF] text-[#0A2540] py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">Login</button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7F9] font-sans">
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-[100] px-8 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-black text-[#0A2540] tracking-tighter leading-none">DOORSTEP <span className="text-[#00D4FF]">PRO</span></h2>
          <span className="bg-[#0A2540] text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">{currentUser.role_id} Node • {currentUser.state_code}</span>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => setView(view === 'main' ? 'pitch' : 'main')} className="text-[9px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700">
            {view === 'main' ? 'Investor Pitch' : 'Back to App'}
          </button>
          <div className="h-6 w-px bg-gray-100"></div>
          <button onClick={handleLogout} className="text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500">Logout</button>
        </div>
      </header>

      <main className="p-8">
        {view === 'pitch' ? (
          <PitchModule />
        ) : (
          <>
            {currentUser.role_id === UserRole.USER && <UserModule problems={problems} bookings={bookings} user={currentUser} onBook={async (b) => {
              await db.createRequest(b);
              loadData(currentUser);
            }} />}
            {currentUser.role_id === UserRole.PROVIDER && <ProviderModule bookings={bookings} providerId={currentUser.id} onUpdateBooking={async (id, up) => {
              await db.updateRequest(id, up);
              loadData(currentUser);
            }} problems={problems} />}
            {currentUser.role_id === UserRole.ADMIN && <AdminModule bookings={bookings} problems={problems} />}
            <AIAssistant 
              role={currentUser.role_id === UserRole.PROVIDER ? 'PROVIDER' : 'USER'} 
              contextProblems={problems}
            />
          </>
        )}
      </main>
    </div>
  );
};

export default App;
