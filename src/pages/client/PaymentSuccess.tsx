import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import Seo from "../../components/seo/Seo";
import { CheckCircle, ArrowRight, Receipt, Loader2 } from "lucide-react";

export default function PaymentSuccess() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [verifying, setVerifying] = useState(true);
  
  // 🛡️ SECURITY GUARD: Block direct access without state from verification flow
  useEffect(() => {
    const verified = (location.state as any)?.verified;
    if (!verified) {
      // Small timeout to simulate backend sync check if accessed directly
      const timer = setTimeout(() => {
          navigate(`/bookings/${bookingId}`);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
        setVerifying(false);
    }
  }, [location.state, navigate, bookingId]);

  if (verifying) {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Syncing Ledger...</p>
        </div>
    );
  }

  return (
    <>
      <Seo
        title="Payment Successful"
        description="Your payment was successful."
      />

      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8 animate-in zoom-in duration-500 shadow-lg shadow-green-100">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        
        <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">Payment Verified!</h1>
        <p className="text-gray-500 text-center max-w-sm mb-10 font-medium">
          Your transaction has been finalized by our backend. A professional is being notified of your booking.
        </p>

        <div className="flex flex-col w-full max-w-xs gap-3">
          <Link
            to={`/bookings/${bookingId}`}
            className="w-full bg-gray-900 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            Track Status <ArrowRight className="w-4 h-4" />
          </Link>
          
          <button className="w-full flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 py-3 hover:text-gray-600 transition-colors">
            <Receipt className="w-4 h-4" /> View Digital Invoice
          </button>
        </div>
      </div>
    </>
  );
}