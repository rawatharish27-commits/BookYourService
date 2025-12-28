
import React, { useState, useMemo } from 'react';
import { Problem, Booking, User, BookingStatus, SLATier } from '../types';
import { CATEGORIES, SUB_CATEGORIES, VISIT_CHARGE, PLATFORM_FEE } from '../constants';

interface UserModuleProps {
  problems: Problem[];
  bookings: Booking[];
  user: User | null;
  onBook: (booking: Booking) => void;
}

const UserModule: React.FC<UserModuleProps> = ({ problems, bookings, user, onBook }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSub, setSelectedSub] = useState<string | null>(null);
  const [bookingModal, setBookingModal] = useState<Problem | null>(null);
  const [address, setAddress] = useState('B-402, Signature Towers, Gurgaon, Haryana');

  const filteredProblems = useMemo(() => {
    return problems.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = selectedCategory ? p.category === selectedCategory : true;
      const matchesSub = selectedSub ? p.subCategory === selectedSub : true;
      return matchesSearch && matchesCat && matchesSub;
    }).sort((a, b) => b.severity - a.severity).slice(0, 50);
  }, [problems, searchTerm, selectedCategory, selectedSub]);

  const handleConfirmBooking = () => {
    if (!bookingModal || !user) return;

    const newBooking: Booking = {
      id: 'book_' + Date.now(),
      userId: user.id,
      userName: user.name,
      problemId: bookingModal.id,
      ontologyId: bookingModal.ontologyId,
      problemTitle: bookingModal.title,
      category: bookingModal.category,
      subCategory: bookingModal.subCategory,
      status: BookingStatus.REQUESTED,
      severity: bookingModal.severity,
      slaTier: bookingModal.slaTier,
      createdAt: new Date().toISOString(),
      basePrice: bookingModal.basePrice,
      selectedAddons: [],
      visitCharge: VISIT_CHARGE,
      totalAmount: bookingModal.basePrice + VISIT_CHARGE,
      platformFee: PLATFORM_FEE,
      providerEarnings: (bookingModal.basePrice + VISIT_CHARGE) - PLATFORM_FEE,
      address: address,
      wardId: 'WARD_042',
      // Fix: Added missing 'actor' property to the initial audit log entry
      history: [{ status: BookingStatus.REQUESTED, timestamp: new Date().toISOString(), note: 'Booking initiated by user', actor: user.id }]
    };

    onBook(newBooking);
    setBookingModal(null);
  };

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* Search Header */}
      <section className="bg-[#0A2540] rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-blue-500/20 text-[#00D4FF] text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border border-blue-400/30">
              National Service OS
            </span>
            {user && (
              <span className="bg-green-500/20 text-green-400 text-[10px] font-black uppercase px-3 py-1.5 rounded-full border border-green-400/30">
                Trust Score: {user.trustScore}
              </span>
            )}
          </div>
          <h1 className="text-6xl font-black mb-6 leading-[1.1] tracking-tighter">Unified Home <br/><span className="text-[#00D4FF]">Infrastructure.</span></h1>
          <p className="text-gray-400 mb-10 text-lg font-medium leading-relaxed">2000+ standardized solutions. Enterprise-grade execution. Fixed pricing for a better India.</p>
          
          <div className="relative group">
            <input 
              type="text" 
              placeholder="Search by problem or keyword..."
              className="w-full px-10 py-7 rounded-3xl text-gray-900 shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/50 transition-all text-xl font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-blue-600 rounded-full opacity-5 blur-[120px]"></div>
      </section>

      {/* Categories */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black text-[#0A2540] tracking-tighter">Verticals</h2>
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
            {SUB_CATEGORIES.map(sub => (
              <button 
                key={sub}
                onClick={() => setSelectedSub(selectedSub === sub ? null : sub)}
                className={`whitespace-nowrap px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border-2 transition-all ${
                  selectedSub === sub ? 'bg-[#00D4FF] border-[#00D4FF] text-[#0A2540] shadow-xl' : 'bg-white border-gray-100 text-gray-400'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-6">
          {CATEGORIES.slice(0, 16).map(cat => (
            <button 
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
              className={`flex flex-col items-center p-8 rounded-[2rem] transition-all border-2 group ${
                selectedCategory === cat.name ? 'bg-white border-[#00D4FF] shadow-2xl ring-4 ring-blue-50' : 'bg-white border-transparent shadow-sm hover:shadow-md'
              }`}
            >
              <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">{cat.icon}</span>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Solutions Grid */}
      <section>
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-3xl font-black text-[#0A2540] tracking-tighter">Recommended Solutions</h2>
          <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Sorting by Severity</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProblems.map(prob => (
            <div key={prob.id} className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all group flex flex-col h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                 <div className={`w-3 h-3 rounded-full ${prob.severity > 7 ? 'bg-red-500 animate-pulse' : prob.severity > 4 ? 'bg-orange-400' : 'bg-green-400'}`}></div>
              </div>
              <div className="flex justify-between items-start mb-6">
                <div className="flex flex-col gap-2">
                  <span className="bg-gray-50 text-gray-400 text-[9px] font-black px-3 py-1.5 rounded-full border border-gray-100 uppercase tracking-widest">
                    {prob.category}
                  </span>
                  <span className={`text-[9px] font-black px-3 py-1.5 rounded-full border uppercase tracking-widest ${
                    prob.slaTier === SLATier.GOLD ? 'bg-yellow-50 text-yellow-600 border-yellow-200' : 
                    prob.slaTier === SLATier.SILVER ? 'bg-blue-50 text-blue-600 border-blue-200' : 
                    'bg-gray-50 text-gray-400 border-gray-200'
                  }`}>
                    {prob.slaTier} SLA
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-[#0A2540]">₹{prob.basePrice}</span>
                </div>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4 group-hover:text-[#00D4FF] transition-colors">{prob.title}</h3>
              <p className="text-sm text-gray-500 mb-10 flex-grow font-medium leading-relaxed">{prob.description}</p>
              <button 
                onClick={() => setBookingModal(prob)}
                className="w-full bg-[#0A2540] text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-indigo-100"
              >
                Book Service
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Booking Drawer/Modal */}
      {bookingModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-[3rem] w-full max-w-lg overflow-hidden animate-slideUp shadow-2xl">
            <div className="bg-[#0A2540] p-12 text-white relative">
              <span className="text-[#00D4FF] text-[10px] font-black uppercase tracking-widest opacity-60">Ontology: {bookingModal.ontologyId}</span>
              <h3 className="text-4xl font-black mt-2 leading-none">Review Request</h3>
              <button onClick={() => setBookingModal(null)} className="absolute top-10 right-10 text-gray-400 hover:text-white transition-colors">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="p-12 space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-2xl font-black text-[#0A2540]">
                  <span>{bookingModal.title}</span>
                  <span>₹{bookingModal.basePrice}</span>
                </div>
                <div className="flex justify-between items-center text-gray-400 font-bold">
                  <span className="text-sm uppercase tracking-widest">Base Inspection</span>
                  <span>₹{VISIT_CHARGE}</span>
                </div>
                <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                  <span className="text-[10px] font-black text-gray-400 uppercase block mb-3 tracking-widest">Service Address (Verified)</span>
                  <div className="flex items-center gap-4">
                    <div className="text-blue-500 text-xl">📍</div>
                    <input 
                      type="text" 
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="bg-transparent border-none text-sm font-black text-gray-800 w-full focus:ring-0"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-[#0A2540] p-8 rounded-[2rem] text-white shadow-2xl">
                <div className="flex justify-between items-center font-black">
                  <span className="text-sm uppercase tracking-widest text-blue-300">Total Payable</span>
                  <span className="text-4xl">₹{bookingModal.basePrice + VISIT_CHARGE}</span>
                </div>
                <p className="text-[9px] text-blue-400/60 mt-4 font-black uppercase tracking-[0.2em] text-center border-t border-white/10 pt-4">Market-locked pricing enabled</p>
              </div>

              <button 
                onClick={handleConfirmBooking}
                className="w-full bg-green-600 text-white py-6 rounded-2xl font-black text-lg uppercase tracking-widest shadow-2xl shadow-green-100 hover:bg-green-700 transition-all"
              >
                Dispatch Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserModule;
