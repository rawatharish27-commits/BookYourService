
import React, { useState, useMemo, useEffect } from 'react';
import { Problem, Booking, UserEntity, BookingStatus, PaymentMethod, PaymentStatus } from '../types';
import { CATEGORIES, VISIT_CHARGE, PLATFORM_FEE } from '../constants';
import { db } from '../DatabaseService';

interface UserModuleProps {
  problems: Problem[];
  bookings: Booking[];
  user: UserEntity | null;
  onBook: (booking: Booking) => void;
}

const REASON_TAGS = ['Punctuality', 'Behavior', 'Work Quality', 'Cleanliness', 'Pricing Accuracy', 'Expertise'];

const UserModule: React.FC<UserModuleProps> = ({ problems, bookings, user, onBook }) => {
  const [activeTab, setActiveTab] = useState<'request' | 'track'>('request');
  const [searchTerm, setSearchTerm] = useState('');
  const [detectedCity, setDetectedCity] = useState<string>('');
  const [bookingModal, setBookingModal] = useState<Problem | null>(null);
  const [bookingStep, setBookingStep] = useState<1 | 2 | 3>(1); 
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  
  // Section 11 - Enhanced Feedback
  const [feedbackModal, setFeedbackModal] = useState<Booking | null>(null);
  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [complaint, setComplaint] = useState('');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(() => setDetectedCity('Detected: Gurgaon Hub'));
    }
  }, []);

  const myBookings = useMemo(() => bookings.filter(b => b.user_id === user?.id), [bookings, user]);
  
  // Mandatory Feedback logic Section 11.1
  useEffect(() => {
    const pendingRating = myBookings.find(b => b.status === BookingStatus.COMPLETED && !b.rating);
    if (pendingRating) setFeedbackModal(pendingRating);
  }, [myBookings]);

  const handleFeedbackSubmit = async () => {
    if (!feedbackModal) return;
    await db.addFeedback(feedbackModal.id, rating, complaint, selectedTags);
    setFeedbackModal(null);
    setRating(0);
    setSelectedTags([]);
    setComplaint('');
  };

  const getStatusStep = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.CREATED: return 1;
      case BookingStatus.VERIFIED: return 2;
      case BookingStatus.IN_PROGRESS: return 3;
      case BookingStatus.COMPLETED: return 4;
      default: return 1;
    }
  };

  const handleConfirmBooking = () => {
    if (!bookingModal || !selectedSlot) return;
    const total = bookingModal.basePrice + VISIT_CHARGE;
    const newBooking: Booking = {
      id: `REQ_${Date.now()}`,
      user_id: user!.id,
      userName: user!.name,
      service_id: bookingModal.id,
      problemTitle: bookingModal.title,
      category: bookingModal.category,
      subCategory: bookingModal.subCategory,
      status: BookingStatus.CREATED,
      priority: 'MEDIUM',
      state_code: user!.state_code,
      ward_id: 'W_01',
      created_at: new Date().toISOString(),
      total_amount: total,
      visitCharge: VISIT_CHARGE,
      basePrice: bookingModal.basePrice,
      platformFee: PLATFORM_FEE,
      providerEarnings: total - PLATFORM_FEE,
      selectedAddons: [],
      address: 'Skyline Heights, Tower C, Gurgaon',
      ontologyId: bookingModal.ontologyId,
      slaTier: bookingModal.slaTier,
      severity: bookingModal.severity,
      scheduledTime: selectedSlot
    };
    onBook(newBooking);
    setBookingModal(null);
    setBookingStep(1);
    setSelectedSlot('');
    setActiveTab('track');
  };

  return (
    <div className="space-y-10 animate-fadeIn max-w-4xl mx-auto pb-20">
      <div className="flex justify-between items-center px-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-black text-[#0A2540] uppercase tracking-widest">{detectedCity || 'Hub: Delhi-NCR'}</span>
        </div>
      </div>

      <div className="flex bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-gray-200">
        <button onClick={() => setActiveTab('request')} className={`flex-1 py-4 font-black text-[10px] uppercase rounded-xl transition-all ${activeTab === 'request' ? 'bg-[#0A2540] text-white shadow-xl' : 'text-gray-400'}`}>New Request</button>
        <button onClick={() => setActiveTab('track')} className={`flex-1 py-4 font-black text-[10px] uppercase rounded-xl transition-all ${activeTab === 'track' ? 'bg-[#0A2540] text-white shadow-xl' : 'text-gray-400'}`}>Activity ({myBookings.length})</button>
      </div>

      {activeTab === 'request' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="relative">
             <input type="text" placeholder="Describe your problem..." className="w-full bg-white px-8 py-7 rounded-[2.5rem] border border-gray-100 shadow-xl font-bold text-xl outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
             {CATEGORIES.slice(0, 8).map(cat => (
               <div key={cat.id} onClick={() => setSearchTerm(cat.name)} className="flex flex-col items-center gap-2 cursor-pointer">
                 <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-xl">{cat.icon}</div>
                 <p className="text-[8px] font-black uppercase text-gray-400">{cat.name}</p>
               </div>
             ))}
          </div>
          <div className="space-y-4">
            {problems.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 10).map(p => (
              <div key={p.id} className="bg-white p-7 rounded-[2.5rem] border border-gray-100 flex justify-between items-center shadow-sm">
                <div className="flex-1">
                   <h4 className="text-lg font-black text-[#0A2540]">{p.title}</h4>
                   <p className="text-xs font-bold text-gray-400 uppercase">₹{p.basePrice} + Visit</p>
                </div>
                <button onClick={() => setBookingModal(p)} className="bg-[#0A2540] text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase">Book</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'track' && (
        <div className="space-y-8 animate-fadeIn">
          {myBookings.map(b => (
            <div key={b.id} className="bg-white p-10 rounded-[3.5rem] border-2 border-gray-100 shadow-2xl">
              <div className="flex justify-between items-start mb-10">
                 <div>
                    <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase bg-blue-100 text-blue-600">{b.status}</span>
                    <h4 className="text-3xl font-black text-[#0A2540] mt-4">{b.problemTitle}</h4>
                 </div>
                 <div className="text-right">
                    <p className="text-4xl font-black text-[#0A2540]">₹{b.total_amount}</p>
                 </div>
              </div>
              <div className="relative py-8 flex justify-between items-center px-4">
                 {[1, 2, 3, 4].map(idx => (
                   <div key={idx} className={`w-12 h-12 rounded-full flex items-center justify-center font-black ${getStatusStep(b.status) >= idx ? 'bg-[#00D4FF]' : 'bg-gray-100'}`}>{idx}</div>
                 ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mandatory Feedback Section 11.2 */}
      {feedbackModal && (
        <div className="fixed inset-0 bg-[#0A2540]/95 backdrop-blur-2xl z-[300] flex items-center justify-center p-6 animate-fadeIn">
          <div className="bg-white rounded-[4rem] p-12 w-full max-w-lg text-center space-y-8 shadow-3xl">
             <h3 className="text-3xl font-black text-[#0A2540] uppercase tracking-tighter">Rate the Pro</h3>
             <div className="flex justify-center gap-3 py-4">
                {[1, 2, 3, 4, 5].map(star => (
                   <button key={star} onClick={() => setRating(star)} className={`text-5xl ${rating >= star ? 'text-yellow-400' : 'text-gray-100'}`}>★</button>
                ))}
             </div>
             
             <div className="grid grid-cols-2 gap-3">
                {REASON_TAGS.map(tag => (
                   <button key={tag} onClick={() => setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])} className={`p-4 rounded-2xl text-[10px] font-black uppercase transition-all ${selectedTags.includes(tag) ? 'bg-[#0A2540] text-white' : 'bg-gray-50 text-gray-400'}`}>{tag}</button>
                ))}
             </div>

             <textarea placeholder="Tell us more about the service..." className="w-full bg-gray-50 rounded-3xl p-6 text-sm outline-none h-32" value={complaint} onChange={e => setComplaint(e.target.value)} />
             <button onClick={handleFeedbackSubmit} disabled={rating === 0} className="w-full bg-[#0A2540] text-white py-6 rounded-2xl font-black uppercase text-xs">Submit & Continue</button>
          </div>
        </div>
      )}

      {bookingModal && (
        <div className="fixed inset-0 bg-[#0A2540]/80 backdrop-blur-xl z-[200] flex items-center justify-center p-6 animate-fadeIn">
          <div className="bg-white rounded-[4rem] p-12 w-full max-w-sm text-center space-y-10 shadow-3xl">
             <h3 className="text-3xl font-black text-[#0A2540] uppercase">Order Confirmation</h3>
             <button onClick={handleConfirmBooking} className="w-full bg-green-500 text-white py-6 rounded-2xl font-black uppercase text-xs">Confirm Job</button>
             <button onClick={() => setBookingModal(null)} className="text-[10px] font-black text-gray-400 uppercase">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserModule;
