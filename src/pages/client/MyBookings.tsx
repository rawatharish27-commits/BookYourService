import React, { useEffect, useState, useRef } from 'react';
import { Booking, Role, BookingStatus } from '../../types';
import { getBookings, cancelBooking, createPaymentOrder, getCancellationPreview, api } from '../../services/api'; // Real API
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { StatusBadge } from '../../components/StatusBadge';
import { useToast } from '../../context/ToastContext';
import { Clock, Ban, CreditCard, Star, Phone, RefreshCw, Loader2, CheckCircle2 } from 'lucide-react';

export const MyBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  
  const [verifyingIds, setVerifyingIds] = useState<string[]>([]);
  const pollInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (user) fetchBookings();
    return () => { if (pollInterval.current) clearInterval(pollInterval.current); }
  }, [user]);

  // Polling for status updates
  useEffect(() => {
      if (verifyingIds.length > 0) {
          if (!pollInterval.current) {
              pollInterval.current = setInterval(fetchBookingsSilent, 3000); 
          }
      } else {
          if (pollInterval.current) {
              clearInterval(pollInterval.current);
              pollInterval.current = null;
          }
      }
  }, [verifyingIds]);

  const fetchBookings = async () => {
    if (!user) return;
    setLoading(true);
    await fetchBookingsSilent();
    setLoading(false);
  };

  const fetchBookingsSilent = async () => {
    try {
        const data = await getBookings(Role.CLIENT);
        setBookings(data);
        
        // Remove verified ones from polling list
        setVerifyingIds(prev => prev.filter(id => {
            const booking = data.find((b: Booking) => b.id === id);
            return booking && booking.status !== BookingStatus.CONFIRMED && booking.status !== BookingStatus.PAYMENT_PENDING; 
        }));

    } catch (e) { console.error(e); }
  };

  const handleCancelClick = async (id: string) => {
      try {
          const preview = await getCancellationPreview(id);
          
          let confirmMsg = `Are you sure you want to cancel?\n\nReason from Policy: ${preview.reason}`;
          if (preview.penaltyAmount > 0) {
              confirmMsg += `\n\n⚠️ CANCELLATION PENALTY: $${preview.penaltyAmount}\nREFUND AMOUNT: $${preview.refundAmount}`;
          } else {
              confirmMsg += `\n\nFull Refund: $${preview.refundAmount}`;
          }
          
          if (!window.confirm(confirmMsg)) return;

          const reason = prompt("Please confirm cancellation reason:");
          if (!reason) return;

          await cancelBooking(id, reason);
          showToast("Booking cancelled successfully.", "success");
          fetchBookings();

      } catch (e: any) {
          showToast(e.response?.data?.message || "Cancellation failed", "error");
      }
  };

  const handleConfirmSatisfied = async (id: string) => {
      if (!window.confirm("Confirm that you are satisfied with the service? This will finalize the payment to the professional.")) return;
      try {
          await api.post(`/api/v1/bookings/${id}/confirm-customer`);
          showToast("Thank you for confirming! Job finalized.", "success");
          fetchBookings();
      } catch (e: any) {
          showToast(e.response?.data?.message || "Confirmation failed", "error");
      }
  }

  const handlePayment = async (booking: Booking) => {
    try {
        const order = await createPaymentOrder(booking.id);
        const options = {
            key: order.keyId,
            amount: order.amount,
            currency: order.currency,
            name: "BookYourService",
            description: `Payment for ${booking.serviceTitle}`,
            order_id: order.orderId,
            handler: function (response: any) {
                setVerifyingIds(prev => [...prev, booking.id]);
            },
            prefill: { name: user?.name, email: user?.email },
            theme: { color: "#4F46E5" },
            modal: {
                ondismiss: function() { console.log("Payment cancelled"); }
            }
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
    } catch (e: any) {
        showToast("Payment initialization failed", "error");
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 px-4 pt-10">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">My <span className="text-indigo-600">Bookings</span></h2>
        <button onClick={fetchBookings} className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-xs font-black uppercase tracking-widest">
            <RefreshCw className="w-4 h-4" /> Refresh List
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-32"><Loader2 className="animate-spin text-indigo-600 w-10 h-10"/></div>
      ) : (
        <div className="space-y-6">
          {bookings.map(booking => {
             const isVerifying = verifyingIds.includes(booking.id);
             const canCancel = ['INITIATED', 'SLOT_LOCKED', 'PAYMENT_PENDING', 'CONFIRMED', 'PROVIDER_ASSIGNED', 'PROVIDER_ACCEPTED'].includes(booking.status);
             const isAwaitingConfirm = booking.status === BookingStatus.PROVIDER_COMPLETED;

             return (
                <div key={booking.id} className={`bg-white rounded-[2.5rem] shadow-sm border p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 transition-all hover:shadow-xl hover:border-indigo-100 ${isAwaitingConfirm ? 'border-indigo-200 bg-indigo-50/20' : 'border-gray-100'}`}>
                    <div className="flex-1 cursor-pointer" onClick={() => navigate(`/bookings/${booking.id}`)}>
                        <div className="flex items-center gap-3 mb-4">
                            <StatusBadge status={booking.status} />
                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">#{booking.id.slice(0,8)}</span>
                        </div>

                        <h3 className="font-black text-2xl text-gray-900 mb-2">{booking.serviceTitle}</h3>
                        
                        <div className="text-sm space-y-2">
                            {booking.status === BookingStatus.PAYMENT_PENDING ? (
                                <p className="text-orange-600 font-bold flex items-center gap-2"><Clock className="w-4 h-4" /> Finalize payment to secure this slot</p>
                            ) : (
                                <div className="flex items-center gap-6">
                                    <div className="font-bold text-gray-600 flex items-center gap-2">
                                        <User className="w-4 h-4 text-gray-400" /> {booking.providerName || 'Assigning Pro...'}
                                    </div>
                                    {booking.providerPhone && (
                                        <div className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase">
                                            <Phone className="w-3 h-3" /> {booking.providerPhone}
                                        </div>
                                    )}
                                </div>
                            )}
                            <div className="flex items-center gap-6 text-sm text-gray-400 pt-2 font-medium">
                                <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> {new Date(booking.scheduled_time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                <span className="font-black text-gray-900">₹{booking.total_amount}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 min-w-[200px] w-full md:w-auto">
                        {isVerifying ? (
                            <span className="bg-indigo-50 text-indigo-700 px-6 py-4 rounded-2xl text-xs font-black flex items-center gap-3 border border-indigo-100 justify-center">
                                <Loader2 className="w-4 h-4 animate-spin" /> VERIFYING LEDGER
                            </span>
                        ) : isAwaitingConfirm ? (
                             <button 
                                onClick={(e) => { e.stopPropagation(); handleConfirmSatisfied(booking.id); }} 
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-indigo-200 active:scale-95 transition-all"
                            >
                                <CheckCircle2 className="w-5 h-5" /> Confirm Satisfaction
                            </button>
                        ) : (
                            <>
                                {(booking.status === BookingStatus.PAYMENT_PENDING) && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handlePayment(booking); }} 
                                        className="w-full bg-gray-900 hover:bg-indigo-600 text-white font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95"
                                    >
                                        <CreditCard className="w-5 h-5" /> Pay Now
                                    </button>
                                )}

                                {(booking.status === BookingStatus.SETTLED || booking.status === BookingStatus.COMPLETED) && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); navigate(`/bookings/${booking.id}/review`); }}
                                        className="w-full border-2 border-yellow-400 bg-white text-yellow-600 hover:bg-yellow-50 font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all"
                                    >
                                        <Star className="w-5 h-5 fill-current" /> Write a Review
                                    </button>
                                )}
                            </>
                        )}
                        
                        {canCancel && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleCancelClick(booking.id); }} 
                                className="text-red-500 hover:text-red-700 font-black text-[10px] uppercase tracking-widest py-2 transition-colors text-center"
                            >
                                <Ban className="w-3 h-3 inline mr-1" /> Cancel Booking
                            </button>
                        )}
                    </div>
                </div>
             );
          })}
          {bookings.length === 0 && (
              <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[2.5rem] border border-dashed border-gray-200 text-gray-400">
                  <Clock className="w-12 h-12 text-gray-200 mb-6" />
                  <p className="font-bold">No history found yet.</p>
              </div>
          )}
        </div>
      )}
    </div>
  );
};

// Simple User Icon fallback since it was missing in imports
const User = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);