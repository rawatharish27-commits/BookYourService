import React from 'react';
import Seo from "../../components/seo/Seo";
import { MessageCircle, HelpCircle, Headphones, Send, Clock, ShieldCheck } from 'lucide-react';

export default function Support() {
  return (
    <>
      <Seo title="Support" description="Get help with your bookings" />

      <div className="max-w-5xl mx-auto py-12 px-4">
        <div className="text-center mb-16">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-4">How can we <span className="text-indigo-600">Help?</span></h1>
            <p className="text-gray-500 max-w-xl mx-auto font-medium">Our resolution experts are available 24/7 to help you with any booking issues or feedback.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Contact Channels */}
            <div className="lg:col-span-4 space-y-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                        <MessageCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-black text-gray-900">WhatsApp Chat</h4>
                        <p className="text-xs text-gray-400 font-bold uppercase mt-0.5">Response: Instant</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                        <Headphones className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-black text-gray-900">Phone Support</h4>
                        <p className="text-xs text-gray-400 font-bold uppercase mt-0.5">Mon-Sun, 9am-9pm</p>
                    </div>
                </div>

                <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <ShieldCheck className="w-24 h-24" />
                    </div>
                    <h3 className="text-lg font-black mb-4">Refund Policy</h3>
                    <p className="text-sm text-gray-400 leading-relaxed mb-6 font-medium">Any booking cancelled within the free window is automatically refunded to your wallet instantly.</p>
                    <button className="text-xs font-black text-indigo-400 uppercase tracking-widest hover:underline">Read Policy Details</button>
                </div>
            </div>

            {/* Support Form */}
            <div className="lg:col-span-8">
                <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                            <HelpCircle className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900">Submit a Ticket</h3>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Topic</label>
                            <select className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-gray-900 appearance-none">
                                <option>Billing & Payments</option>
                                <option>Professional No-Show</option>
                                <option>Service Quality Issue</option>
                                <option>App / Technical Bug</option>
                                <option>Other Inquiry</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Booking ID (Optional)</label>
                            <input className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-gray-900" placeholder="#ORD-XXXXXX" />
                        </div>

                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Description</label>
                            <textarea
                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none h-40 resize-none font-bold text-gray-900"
                            placeholder="Please explain the issue in detail..."
                            />
                        </div>

                        <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 text-lg">
                            <Send className="w-5 h-5" /> Submit Support Request
                        </button>

                        <p className="flex items-center justify-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <Clock className="w-3 h-3" /> Avg. Response time: 2 Hours
                        </p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </>
  );
}