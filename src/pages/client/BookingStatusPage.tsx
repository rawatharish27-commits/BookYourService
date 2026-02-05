import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBookingById, cancelBooking, getCancellationPreview } from "../../services/api";
import { BookingStatus, Role } from "../../types";
import { StatusBadge } from "../../components/StatusBadge";
import { ArrowLeft, Loader2, Phone, Star, ShieldCheck, HelpCircle } from 'lucide-react';
import { useToast } from "../../context/ToastContext";
import BookingTimeline from "../../components/booking/BookingTimeline";

export const BookingStatusPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchBooking = async () => {
        try {
            const data = await getBookingById(id);
            setBooking(data);
            setLoading(false);
        } catch (e) { console.error(e); }
    };
    fetchBooking();
    const poll = setInterval(fetchBooking, 5000);
    return () => clearInterval(poll);
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-10 h-10 text-indigo-600" /></div>;
  if (!booking) return <div className="p-8 text-center font-bold">Booking Not Found</div>;

  return (
    <div className="max-w-2xl mx-auto pb-20 px-4 pt-8">
      <button onClick={() => navigate('/client/bookings')} className="flex items-center text-gray-500 hover:text-gray-900 transition-colors mb-8 font-bold"><ArrowLeft className="w-4 h-4 mr-2" /> Back</button>

      {/* NEW TIMELINE COMPONENT */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 mb-8">
           <BookingTimeline currentStatus={booking.status} />
      </div>

      {/* Provider Details (Visible if assigned) */}
      {booking.provider && (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 mb-6">
             <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Expert Assigned</h3>
             <div className="flex items-center gap-6">
                 <div className="w-16 h-16 bg-gray-100 rounded-2xl overflow-hidden">
                     <img src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=200" alt="Pro" />
                 </div>
                 <div>
                     <h2 className="text-xl font-black text-gray-900 leading-tight">{booking.provider.name}</h2>
                     <div className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1 text-xs font-black text-yellow-600"><Star className="w-3 h-3 fill-current" /> 4.8</span>
                        <span className="text-indigo-600 text-xs font-black uppercase flex items-center gap-1"><Phone className="w-3 h-3" /> Contact</span>
                     </div>
                 </div>
             </div>
        </div>
      )}

      {/* Summary Card */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
           <div className="p-8 space-y-5">
               <div className="flex justify-between items-center"><span className="text-gray-400 font-bold text-sm">Service</span><span className="font-black text-gray-900">{booking.service?.title}</span></div>
               <div className="flex justify-between items-center"><span className="text-gray-400 font-bold text-sm">Status</span><StatusBadge status={booking.status} /></div>
               <div className="border-t border-dashed border-gray-100 my-6"></div>
               <div className="flex justify-between text-sm"><span className="font-bold text-gray-400">Total Charged</span><span className="font-black text-gray-900 text-lg">₹{booking.pricing?.total}</span></div>
           </div>
      </div>

      <div className="mt-12 flex items-center justify-center gap-8 text-gray-400 grayscale opacity-40">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase"><ShieldCheck className="w-4 h-4" /> Secure Escrow</div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase"><HelpCircle className="w-4 h-4" /> 24/7 Support</div>
      </div>
    </div>
  );
};