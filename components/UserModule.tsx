
import React, { useState, useMemo } from 'react';
import { Problem, Booking, UserEntity, BookingStatus, Addon, PaymentMethod, PaymentStatus, VerificationStatus } from '../types';
import { CATEGORIES, VISIT_CHARGE, PLATFORM_FEE } from '../constants';
import { paymentService } from '../PaymentService';
import { db } from '../DatabaseService';

interface UserModuleProps {
  problems: Problem[];
  bookings: Booking[];
  user: UserEntity | null;
  onBook: (booking: Booking) => void;
}

const UserModule: React.FC<UserModuleProps> = ({ problems, bookings, user, onBook }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [bookingModal, setBookingModal] = useState<Problem | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);
  const [paymentStep, setPaymentStep] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [otpModal, setOtpModal] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [address] = useState('B-402, Signature Towers, Gurgaon, Haryana');

  const filteredProblems = useMemo(() => {
    return problems.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           p.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = selectedCategory ? p.category === selectedCategory : true;
      return matchesSearch && matchesCat;
    }).sort((a, b) => b.severity - a.severity).slice(0, 100);
  }, [problems, searchTerm, selectedCategory]);

  const toggleAddon = (addon: Addon) => {
    setSelectedAddons(prev => 
      prev.find(a => a.id === addon.id) 
        ? prev.filter(a => a.id !== addon.id) 
        : [...prev, addon]
    );
  };

  const calculateTotal = (base: number) => {
    const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
    return base + VISIT_CHARGE + addonsTotal;
  };

  const startBooking = (prob: Problem) => {
    if (user?.verification_status === VerificationStatus.UNVERIFIED) {
      setOtpModal(true);
      return;
    }
    setBookingModal(prob);
    setSelectedAddons([]);
    setPaymentStep(false);
  };

  const handleVerifyOTP = async () => {
    if (!user || otpValue.length < 4) return;
    setIsVerifyingOtp(true);
    await new Promise(r => setTimeout(r, 1500));
    await db.verifyOTP(user.id);
    setIsVerifyingOtp(false);
    setOtpModal(false);
    alert("Phone Verified. You can now book services.");
  };

  const finalizeBooking = async (method: PaymentMethod) => {
    if (!bookingModal || !user) return;
    setProcessingPayment(true);

    const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
    const totalAmount = bookingModal.basePrice + VISIT_CHARGE + addonsTotal;
    const tempBookingId = 'book_' + Date.now();

    if (method === PaymentMethod.UPI) {
      const success = await paymentService.processUPI(totalAmount, tempBookingId);
      if (!success) {
        alert("Payment failed. Please try again or choose COD.");
        setProcessingPayment(false);
        return;
      }
    }

    const newBooking: Booking = {
      id: tempBookingId,
      user_id: user.id,
      userName: user.name,
      service_id: bookingModal.id,
      ontologyId: bookingModal.ontologyId,
      problemTitle: bookingModal.title,
      category: bookingModal.category,
      subCategory: bookingModal.subCategory,
      status: BookingStatus.CREATED,
      priority: bookingModal.severity > 7 ? 'HIGH' : 'MEDIUM',
      severity: bookingModal.severity,
      slaTier: bookingModal.slaTier,
      created_at: new Date().toISOString(),
      state_code: user.state_code || 'UP',
      basePrice: bookingModal.basePrice,
      selectedAddons: selectedAddons,
      visitCharge: VISIT_CHARGE,
      total_amount: totalAmount,
      platformFee: PLATFORM_FEE,
      providerEarnings: totalAmount - PLATFORM_FEE,
      address: address,
      ward_id: 'WARD_042',
      history: [],
      payment_method: method,
      payment_status: method === PaymentMethod.UPI ? PaymentStatus.SUCCESS : PaymentStatus.PENDING
    };

    onBook(newBooking);
    setBookingModal(null);
    setSelectedAddons([]);
    setPaymentStep(false);
    setProcessingPayment(false);
  };

  return (
    <div className="space-y-10 animate-fadeIn max-w-4xl mx-auto">
      {/* Mobile-style Search Bar */}
      <div className="sticky top-24 z-40 bg-[#F8FAFC]/80 backdrop-blur-md pb-4">
        <div className="relative group">
          <input 
            type="text" 
            placeholder="Search for 'Fan repair', 'AC service'..."
            className="w-full px-12 py-6 rounded-2xl bg-white border border-gray-100 shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-lg font-bold text-[#0A2540]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
        </div>
      </div>

      {/* Category Shortcuts */}
      <section className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4">
        {CATEGORIES.slice(0, 16).map(cat => (
          <button 
            key={cat.id} 
            onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
            className="flex flex-col items-center group"
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl transition-all shadow-sm ${
              selectedCategory === cat.name ? 'bg-[#0A2540] text-white scale-110 shadow-xl' : 'bg-white group-hover:bg-gray-50 text-gray-400'
            }`}>
              {cat.icon}
            </div>
            <span className={`text-[9px] font-black uppercase mt-2 tracking-tighter text-center ${selectedCategory === cat.name ? 'text-[#0A2540]' : 'text-gray-400'}`}>
              {cat.name}
            </span>
          </button>
        ))}
      </section>

      {/* Recommended/Filtered Services */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <h2 className="text-2xl font-black text-[#0A2540] tracking-tighter uppercase">
            {selectedCategory || "Top Booked Services"}
          </h2>
          <span className="text-[10px] font-black text-blue-500 uppercase">{filteredProblems.length} available</span>
        </div>

        <div className="space-y-4">
          {filteredProblems.map(prob => (
            <div 
              key={prob.id} 
              className="bg-white p-6 rounded-[2rem] border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-6 group hover:shadow-xl transition-all"
            >
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
                  <span className="px-2 py-0.5 rounded-lg text-[8px] font-black bg-blue-50 text-blue-500 uppercase">{prob.category}</span>
                </div>
                <h3 className="text-xl font-black text-[#0A2540] mb-1">{prob.title}</h3>
                <p className="text-xs text-gray-400 font-medium line-clamp-1">{prob.description}</p>
                <div className="mt-3 flex items-center gap-4 justify-center sm:justify-start">
                   <span className="text-lg font-black text-[#0A2540]">₹{prob.basePrice}</span>
                   <span className="text-[9px] font-black text-gray-300 uppercase">+ ₹{VISIT_CHARGE} Visit</span>
                </div>
              </div>
              <button 
                onClick={() => startBooking(prob)}
                className="w-full sm:w-auto px-10 py-4 bg-[#0A2540] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:scale-105 transition-all"
              >
                Book
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* OTP Verification Modal */}
      {otpModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center p-6 z-[110] animate-fadeIn">
          <div className="bg-white p-10 rounded-[3rem] w-full max-w-sm text-center space-y-8 animate-slideUp">
             <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-[#00D4FF] mx-auto text-2xl font-black">!</div>
             <div>
                <h3 className="text-2xl font-black text-[#0A2540] uppercase tracking-tighter">Verify Identity</h3>
                <p className="text-gray-400 text-xs font-bold mt-2">Enter the 4-digit OTP sent to {user?.phone || 'your registered number'}</p>
             </div>
             <input 
                type="text" 
                maxLength={4} 
                className="w-full text-center text-4xl font-black tracking-[0.5em] py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                value={otpValue}
                onChange={e => setOtpValue(e.target.value)}
                placeholder="0000"
             />
             <button 
                onClick={handleVerifyOTP}
                disabled={isVerifyingOtp}
                className="w-full bg-[#0A2540] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all disabled:opacity-50"
             >
                {isVerifyingOtp ? 'Verifying...' : 'Validate Phone'}
             </button>
             <button onClick={() => setOtpModal(false)} className="text-[10px] font-black text-gray-400 uppercase tracking-widest underline">Cancel</button>
          </div>
        </div>
      )}

      {/* Booking/Payment Modal */}
      {bookingModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-end sm:items-center justify-center p-0 sm:p-4 z-[100] animate-fadeIn">
          <div className="bg-white rounded-t-[3rem] sm:rounded-[3rem] w-full max-w-lg overflow-hidden animate-slideUp">
            {!paymentStep ? (
              <div className="p-8 sm:p-10 space-y-8">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{bookingModal.category}</span>
                    <h3 className="text-3xl font-black text-[#0A2540] tracking-tighter mt-1">{bookingModal.title}</h3>
                  </div>
                  <button onClick={() => setBookingModal(null)} className="text-gray-300 hover:text-black">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-[#0A2540] uppercase tracking-[0.2em]">Select Material Add-ons</h4>
                    <div className="space-y-3">
                      {bookingModal.addons.map(addon => (
                        <button 
                          key={addon.id} 
                          onClick={() => toggleAddon(addon)}
                          className={`w-full flex justify-between items-center p-4 rounded-2xl border-2 transition-all ${
                            selectedAddons.find(a => a.id === addon.id) ? 'border-[#0A2540] bg-[#0A2540]/5' : 'border-gray-50 bg-gray-50'
                          }`}
                        >
                          <div className="text-left">
                            <p className="font-bold text-sm text-[#0A2540]">{addon.name}</p>
                            <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">₹{addon.price}</p>
                          </div>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            selectedAddons.find(a => a.id === addon.id) ? 'bg-[#0A2540] border-[#0A2540]' : 'border-gray-300'
                          }`}>
                            {selectedAddons.find(a => a.id === addon.id) && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Est. Payable</p>
                      <p className="text-4xl font-black text-[#00D4FF]">₹{calculateTotal(bookingModal.basePrice)}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setPaymentStep(true)}
                    className="w-full bg-[#00D4FF] text-[#0A2540] py-6 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                  >
                    Proceed to Payment
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 sm:p-10 space-y-8">
                <div className="flex justify-between items-center">
                  <button onClick={() => setPaymentStep(false)} className="text-gray-400 hover:text-black flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                    <span className="text-[10px] font-black uppercase tracking-widest">Back</span>
                  </button>
                  <h3 className="text-xl font-black text-[#0A2540] uppercase tracking-tighter">Choose Payment</h3>
                  <div className="w-6"></div>
                </div>

                <div className="space-y-4">
                  <button 
                    disabled={processingPayment}
                    onClick={() => finalizeBooking(PaymentMethod.UPI)}
                    className="w-full flex items-center gap-6 p-6 rounded-3xl border-2 border-gray-100 hover:border-[#0A2540] transition-all group"
                  >
                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 text-2xl font-black group-hover:bg-[#0A2540] group-hover:text-white">U</div>
                    <div className="text-left flex-1">
                      <p className="font-black text-[#0A2540] uppercase">UPI Intent</p>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">PhonePe, GPay, Paytm</p>
                    </div>
                  </button>

                  <button 
                    disabled={processingPayment}
                    onClick={() => finalizeBooking(PaymentMethod.COD)}
                    className="w-full flex items-center gap-6 p-6 rounded-3xl border-2 border-gray-100 hover:border-[#0A2540] transition-all group"
                  >
                    <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 text-2xl font-black group-hover:bg-[#0A2540] group-hover:text-white">₹</div>
                    <div className="text-left flex-1">
                      <p className="font-black text-[#0A2540] uppercase">Cash on Delivery</p>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Pay after service completion</p>
                    </div>
                  </button>
                </div>

                {processingPayment && (
                  <div className="text-center space-y-4 py-8 animate-pulse">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto animate-spin"></div>
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">Verifying Transaction...</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserModule;
