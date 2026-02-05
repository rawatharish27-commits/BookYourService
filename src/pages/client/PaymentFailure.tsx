import React from 'react';
import { useParams, Link } from "react-router-dom";
import Seo from "../../components/seo/Seo";
import { XCircle, RefreshCw, HelpCircle } from "lucide-react";

export default function PaymentFailure() {
  const { bookingId } = useParams();

  return (
    <>
      <Seo
        title="Payment Failed"
        description="Payment could not be completed."
      />

      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-8">
          <XCircle className="w-12 h-12 text-red-600" />
        </div>

        <h1 className="text-4xl font-black text-gray-900 mb-2">Payment Failed</h1>
        <p className="text-gray-500 text-center max-w-sm mb-10 font-medium leading-relaxed">
          We couldn't process your transaction. If your money was deducted, it will be auto-refunded within 48 hours.
        </p>

        <div className="flex flex-col w-full max-w-xs gap-3">
          <Link
            to={`/payments/${bookingId}`}
            className="w-full bg-gray-900 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Retry Payment
          </Link>

          <Link
            to="/contact"
            className="w-full flex items-center justify-center gap-2 text-xs font-black uppercase text-gray-400 py-3 hover:text-gray-600"
          >
            <HelpCircle className="w-4 h-4" /> Contact Support
          </Link>
        </div>
      </div>
    </>
  );
}