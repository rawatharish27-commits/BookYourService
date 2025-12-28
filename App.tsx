
import React, { useState, useEffect, useCallback } from 'react';
import { UserRole, Booking, User, Problem, BookingStatus } from './types';
import { generateProblems, PLATFORM_FEE, VISIT_CHARGE, theme } from './constants';
import UserModule from './components/UserModule';
import ProviderModule from './components/ProviderModule';
import AdminModule from './components/AdminModule';

const App: React.FC = () => {
  const [activeRole, setActiveRole] = useState<UserRole>(UserRole.USER);
  const [problems] = useState<Problem[]>(generateProblems());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const savedBookings = localStorage.getItem('bookings_v2');
    if (savedBookings) {
      setBookings(JSON.parse(savedBookings));
    }

    // Fix: Added missing required property 'isKycVerified' to mockUser
    const mockUser: User = {
      id: 'u123',
      name: 'Amit Sharma',
      email: 'amit@example.com',
      role: UserRole.USER,
      wallet: 1500,
      trustScore: 99,
      isKycVerified: true
    };
    setCurrentUser(mockUser);
  }, []);

  useEffect(() => {
    localStorage.setItem('bookings_v2', JSON.stringify(bookings));
  }, [bookings]);

  const handleBooking = useCallback((booking: Booking) => {
    setBookings(prev => [booking, ...prev]);
  }, []);

  const updateBookingStatus = useCallback((id: string, updates: Partial<Booking>) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  }, []);

  const renderModule = () => {
    switch (activeRole) {
      case UserRole.USER:
        return <UserModule 
          problems={problems} 
          bookings={bookings.filter(b => b.userId === currentUser?.id)} 
          onBook={handleBooking}
          user={currentUser}
        />;
      case UserRole.PROVIDER:
        return <ProviderModule 
          bookings={bookings} 
          onUpdateBooking={updateBookingStatus}
          providerId="p456"
        />;
      case UserRole.ADMIN:
        return <AdminModule 
          bookings={bookings} 
          problems={problems}
        />;
      default:
        return <div className="text-center py-20 text-gray-400">Restricted Access Module</div>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#0A2540] rounded-xl flex items-center justify-center text-[#00D4FF] font-black text-xl">D</div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-[#0A2540] tracking-tighter">DoorStep<span className="text-[#00D4FF]">PRO</span></span>
              <span className="text-[8px] font-black text-gray-400 uppercase tracking-[0.3em] -mt-1">Enterprise Service OS</span>
            </div>
          </div>
          
          <nav className="hidden md:flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
            <button 
              onClick={() => setActiveRole(UserRole.USER)}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeRole === UserRole.USER ? 'bg-white shadow-xl text-[#0A2540]' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Consumer
            </button>
            <button 
              onClick={() => setActiveRole(UserRole.PROVIDER)}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeRole === UserRole.PROVIDER ? 'bg-white shadow-xl text-[#0A2540]' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Pro Partner
            </button>
            <button 
              onClick={() => setActiveRole(UserRole.ADMIN)}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeRole === UserRole.ADMIN ? 'bg-white shadow-xl text-[#0A2540]' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Governance
            </button>
          </nav>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black text-[#0A2540] uppercase tracking-tighter">{activeRole === UserRole.ADMIN ? 'ROOT ADMIN' : activeRole === UserRole.PROVIDER ? 'PRO-RAJESH' : currentUser?.name}</p>
              <div className="flex items-center justify-end gap-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[8px] text-gray-400 font-bold uppercase">{activeRole} LIVE</span>
              </div>
            </div>
            <div className="h-12 w-12 rounded-[1rem] bg-[#0A2540] flex items-center justify-center text-[#00D4FF] font-black border-2 border-[#00D4FF]/20 shadow-lg">
              {activeRole === UserRole.ADMIN ? 'A' : activeRole === UserRole.PROVIDER ? 'P' : 'AS'}
            </div>
          </div>
        </div>
      </header>

      {/* Main Viewport */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-10">
        {renderModule()}
      </main>

      {/* Enterprise Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
               <span className="text-2xl font-black text-[#0A2540]">DoorStep<span className="text-[#00D4FF]">PRO</span></span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">Building the future of urban maintenance through technology-driven accountability and standardized pricing. Part of the Enterprise Local-Service Network.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h5 className="text-[10px] font-black text-[#0A2540] uppercase tracking-widest">Platform</h5>
              <ul className="text-xs text-gray-500 space-y-1">
                <li><a href="#" className="hover:text-blue-500 transition-colors">Pricing Policy</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-colors">Trust & Safety</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-colors">B2B Contracts</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-colors">Govt Services</a></li>
              </ul>
            </div>
            <div className="space-y-2">
              <h5 className="text-[10px] font-black text-[#0A2540] uppercase tracking-widest">Support</h5>
              <ul className="text-xs text-gray-500 space-y-1">
                <li><a href="#" className="hover:text-blue-500 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-colors">Fraud Reporting</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-colors">Partner with us</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-colors">Legal Docs</a></li>
              </ul>
            </div>
          </div>
          <div className="bg-gray-50 p-6 rounded-[1.5rem] border border-gray-100">
            <h5 className="text-[10px] font-black text-[#0A2540] uppercase tracking-widest mb-4">Compliance & Security</h5>
            <div className="flex flex-wrap gap-2">
              <span className="bg-white border border-gray-200 text-[8px] font-black px-2 py-1 rounded-md text-gray-400">ISO 27001</span>
              <span className="bg-white border border-gray-200 text-[8px] font-black px-2 py-1 rounded-md text-gray-400">SOC2 COMPLIANT</span>
              <span className="bg-white border border-gray-200 text-[8px] font-black px-2 py-1 rounded-md text-gray-400">GDPR</span>
              <span className="bg-white border border-gray-200 text-[8px] font-black px-2 py-1 rounded-md text-gray-400">RBI KYC</span>
            </div>
            <p className="text-[9px] text-gray-400 mt-4">&copy; 2024 DoorStep Pro Enterprise. Securely operated from Noida, IN.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
