
import React, { useState, useMemo, useEffect } from 'react';
import { Problem, Booking, User, BookingStatus } from '../types';
import { CATEGORIES } from '../constants';
import { db } from '../DatabaseService';
import { bookingService } from '../BookingService';

interface UserModuleProps {
  problems: Problem[];
  user: User;
}

const UserModule: React.FC<UserModuleProps> = ({ problems, user }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'activity'>('home');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  
  const bookings = db.getBookings().filter(b => b.userId === user.id);

  const handleBooking = async () => {
    if (!selectedProblem) return;
    setIsBooking(true);
    try {
      await bookingService.create(user.id, selectedProblem, user.city);
      setActiveTab('activity');
      setSelectedProblem(null);
    } catch (e) {
      alert("Booking failed. Please check balance.");
    } finally {
      setIsBooking(false);
    }
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.CREATED: return 'bg-amber-100 text-amber-600';
      case BookingStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-600';
      case BookingStatus.COMPLETED: return 'bg-emerald-100 text-emerald-600';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  return (
    <div className="space-y-12 animate-fadeIn pb-24">
      <div className="flex bg-white p-2 rounded-[2rem] shadow-sm border border-slate-100 max-w-md mx-auto">
        <button 
          onClick={() => setActiveTab('home')}
          className={`flex-1 py-4 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'home' ? 'bg-[#0A2540] text-white' : 'text-slate-400'}`}
        >
          Book Service
        </button>
        <button 
          onClick={() => setActiveTab('activity')}
          className={`flex-1 py-4 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'activity' ? 'bg-[#0A2540] text-white' : 'text-slate-400'}`}
        >
          My Activity
        </button>
      </div>

      {activeTab === 'home' && (
        <div className="space-y-12 max-w-4xl mx-auto">
          {/* Hero Search */}
          <div className="text-center space-y-6">
            <h1 className="text-5xl font-black text-[#0A2540] tracking-tighter">What can we help you fix?</h1>
            <div className="relative group">
              <input 
                type="text" 
                placeholder="Search for repair, installation, or cleaning..." 
                className="w-full bg-white border-2 border-slate-100 p-8 rounded-[2.5rem] shadow-xl text-xl font-bold outline-none focus:border-blue-500 transition-all pl-16"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <svg className="w-8 h-8 absolute left-6 top-8 text-slate-300 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
          </div>

          {/* Categories */}
          {!searchTerm && (
            <div className="grid grid-cols-4 md:grid-cols-6 gap-6">
              {CATEGORIES.slice(0, 12).map(cat => (
                <button 
                  key={cat.id} 
                  onClick={() => setSearchTerm(cat.name)}
                  className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col items-center gap-4 group"
                >
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl group-hover:bg-blue-50 transition-colors">{cat.icon}</div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">{cat.name}</p>
                </button>
              ))}
            </div>
          )}

          {/* Results */}
          <div className="grid gap-4">
            {problems
              .filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()))
              .slice(0, 10)
              .map(p => (
                <div key={p.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex justify-between items-center group hover:border-blue-200 transition-all shadow-sm">
                  <div className="space-y-2">
                    <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">{p.category}</span>
                    <h4 className="text-2xl font-black text-[#0A2540] tracking-tight">{p.title}</h4>
                    <p className="text-xs font-bold text-slate-400">Fixed Base: ₹{p.basePrice} • Standard Spare Parts Apply</p>
                  </div>
                  <button 
                    onClick={() => setSelectedProblem(p)}
                    className="bg-[#0A2540] text-white px-10 py-5 rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-colors shadow-lg"
                  >
                    Select
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="max-w-2xl mx-auto space-y-6">
          {bookings.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[4rem] border border-slate-100 space-y-4">
              <div className="text-6xl">📭</div>
              <h3 className="text-xl font-black text-[#0A2540]">No active jobs</h3>
              <p className="text-sm text-slate-400">Book your first service to see activity here.</p>
            </div>
          ) : (
            bookings.reverse().map(b => (
              <div key={b.id} className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${getStatusColor(b.status)}`}>
                      {b.status}
                    </span>
                    <h3 className="text-3xl font-black text-[#0A2540] tracking-tighter">{b.problemTitle}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Job ID: {b.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-[#0A2540]">₹{b.total || b.basePrice}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Estimated Total</p>
                  </div>
                </div>

                <div className="flex gap-4 border-t border-slate-50 pt-8">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-xl">👤</div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Assigned Professional</p>
                    <p className="font-black text-[#0A2540]">{b.providerId ? `Pro Node ${b.providerId.slice(-4)}` : 'Awaiting Match...'}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {selectedProblem && (
        <div className="fixed inset-0 bg-[#0A2540]/80 backdrop-blur-xl z-[200] flex items-center justify-center p-6 animate-fadeIn">
          <div className="bg-white rounded-[4rem] p-12 w-full max-w-sm text-center space-y-10 shadow-3xl">
            <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center text-3xl mx-auto">🗓️</div>
            <div className="space-y-2">
              <h3 className="text-3xl font-black text-[#0A2540] tracking-tighter">Confirm Job</h3>
              <p className="text-sm text-slate-400 px-6">We will match the best professional for <b>{selectedProblem.title}</b> in Gurgaon.</p>
            </div>
            
            <div className="bg-slate-50 rounded-3xl p-6 space-y-3">
              <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                <span>Base Service</span>
                <span className="text-[#0A2540]">₹{selectedProblem.basePrice}</span>
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                <span>Visit & Transport</span>
                <span className="text-[#0A2540]">₹100</span>
              </div>
              <div className="h-px bg-slate-200"></div>
              <div className="flex justify-between font-black text-[#0A2540]">
                <span>TOTAL DUE</span>
                <span>₹{selectedProblem.basePrice + 100}</span>
              </div>
            </div>

            <div className="space-y-4">
              <button 
                onClick={handleBooking}
                disabled={isBooking}
                className="w-full bg-[#0A2540] text-white py-6 rounded-3xl font-black uppercase text-xs tracking-[0.2em] shadow-xl flex items-center justify-center gap-4"
              >
                {isBooking ? 'Processing...' : 'Place Request'}
              </button>
              <button onClick={() => setSelectedProblem(null)} className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Go Back</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserModule;
