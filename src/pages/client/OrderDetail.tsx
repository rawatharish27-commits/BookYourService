import React from 'react';
import { useParams, useNavigate } from "react-router-dom";
import Seo from "../../components/seo/Seo";
import { ArrowLeft, Package, Calendar, MapPin, ShieldCheck, Download, HelpCircle, User, CreditCard } from 'lucide-react';

export default function OrderDetail() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  return (
    <>
      <Seo title="Order Details" description="View booking and service details" />

      <div className="max-w-4xl mx-auto py-12 px-4">
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-gray-900 mb-8 font-bold group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to History
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Booking <span className="text-indigo-600">Details</span></h1>
                <p className="text-gray-400 text-sm font-bold mt-1 uppercase tracking-widest">ID: #{bookingId?.slice(0, 8)}</p>
            </div>
            <div className="flex gap-3">
                <button className="flex items-center gap-2 bg-white border border-gray-100 px-5 py-2.5 rounded-xl text-sm font-black text-gray-700 shadow-sm hover:bg-gray-50">
                    <Download className="w-4 h-4" /> Invoice
                </button>
                <button 
                  onClick={() => navigate('/support')}
                  className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-5 py-2.5 rounded-xl text-sm font-black shadow-sm hover:bg-indigo-600 hover:text-white transition-all"
                >
                    <HelpCircle className="w-4 h-4" /> Support
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Info (8 Cols) */}
            <div className="lg:col-span-8 space-y-6">
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                            <Package className="w-7 h-7" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-gray-900 leading-tight">Service Breakdown</h3>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Deep Cleaning Service</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <Calendar className="w-5 h-5 text-gray-300 mt-1" />
                            <div>
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Scheduled Time</p>
                                <p className="font-bold text-gray-900">Oct 24, 2024 at 10:00 AM</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <MapPin className="w-5 h-5 text-gray-300 mt-1" />
                            <div>
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Location</p>
                                <p className="font-bold text-gray-900">123 Market St, San Francisco, CA</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <User className="w-5 h-5 text-gray-300 mt-1" />
                            <div>
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Service Professional</p>
                                <p className="font-bold text-gray-900">Johnathan Pro (Verified)</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-indigo-50 rounded-[2.5rem] p-8 border border-indigo-100 flex gap-6 items-center">
                    <ShieldCheck className="w-10 h-10 text-indigo-600" />
                    <div>
                        <p className="font-black text-indigo-900">Job Shield Active</p>
                        <p className="text-xs text-indigo-700 leading-relaxed font-medium">Your payment is held in escrow and will only be released to the provider after you confirm job satisfaction.</p>
                    </div>
                </div>
            </div>

            {/* Right Summary (4 Cols) */}
            <div className="lg:col-span-4 space-y-6">
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                    <h3 className="font-black text-lg text-gray-900 mb-6 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-indigo-600" /> Payment
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400 font-bold">Subtotal</span>
                            <span className="text-gray-900 font-black">₹ 1499.00</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400 font-bold">Tax</span>
                            <span className="text-gray-900 font-black">₹ 270.00</span>
                        </div>
                        <div className="pt-4 border-t border-dashed border-gray-100 flex justify-between items-center">
                            <span className="font-black text-gray-900">Total</span>
                            <span className="text-2xl font-black text-indigo-600">₹ 1769.00</span>
                        </div>
                    </div>
                    <div className="mt-6 p-3 bg-green-50 rounded-xl text-center">
                        <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">Status: PAID (ESCROW)</span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </>
  );
}