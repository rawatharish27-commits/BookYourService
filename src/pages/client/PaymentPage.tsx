import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Seo from "../../components/seo/Seo";
import { getBookingById } from "../../services/api";
import { Loader2, ShieldCheck, Lock, ChevronLeft } from "lucide-react";

export const PaymentPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) return;
    const fetchBooking = async () => {
      try {
        const data = await getBookingById(bookingId);
        setBooking(data);
      } catch (e) {
        console.error("Failed to load booking", e);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin w-10 h-10 text-indigo-600" />
      </div>
    );
  }

  const basePrice = booking?.pricing?.base_price || 0;
  const platformFee = booking?.pricing?.platform_fee || 0;
  const total = booking?.pricing?.total || (basePrice + platformFee);

  return (
    <>
      <Seo
        title="Secure Payment"
        description="Review pricing and complete payment securely."
      />

      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="max-w-3xl mx-auto px-4 pt-10">
          <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-gray-900 transition-colors mb-8 font-bold group">
            <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" /> Back
          </button>

          <div className="space-y-6">
            <h1 className="text-3xl font-black text-gray-900">Secure Payment</h1>

            {/* TRUST STRIP */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-black text-gray-900 leading-tight">Payment Escrow Active</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Funds held until job completion</p>
                </div>
              </div>
            </div>

            {/* PRICE BREAKDOWN */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest">Order Summary</h3>
                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">Booking ID: #{bookingId?.slice(0, 8)}</span>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-bold">Service Cost</span>
                  <span className="text-gray-900 font-black">₹{basePrice}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-bold">Platform Fee</span>
                  <span className="text-gray-900 font-black">₹{platformFee}</span>
                </div>
                
                <div className="pt-4 border-t border-dashed border-gray-100 flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Payable</p>
                    <p className="text-4xl font-black text-gray-900 tracking-tight">₹{total}</p>
                  </div>
                  <Lock className="w-6 h-6 text-gray-200 mb-1" />
                </div>
              </div>
            </div>

            {/* TERMS */}
            <p className="text-xs text-gray-500 leading-relaxed text-center px-6">
              By proceeding with the payment, you agree to our{" "}
              <Link to="/terms" className="text-indigo-600 font-bold hover:underline">
                Terms & Conditions
              </Link>{" "}
              regarding service delivery and cancellations.
            </p>

            {/* ACTIONS */}
            <div className="flex flex-col gap-3">
              <Link
                to={`/payment/success/${bookingId}`}
                className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-indigo-700 transition-all text-center text-lg active:scale-[0.98]"
              >
                Pay ₹{total} Now
              </Link>

              <Link
                to={`/payment/failure/${bookingId}`}
                className="w-full bg-white text-gray-400 font-black py-4 rounded-2xl border border-gray-100 text-center text-sm hover:text-red-500 hover:bg-red-50 transition-all"
              >
                Cancel Payment
              </Link>
            </div>

            <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] pt-4">
              Protected by <span className="text-gray-900">256-bit SSL Encryption</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};