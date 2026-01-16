/**
 * Customer Support Page - Get help
 */
import React from 'react';

const CustomerSupport: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black text-[#0A2540] italic">Support</h1>
      
      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-[#0A2540] mb-4">Contact Us</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-xl">📞</div>
            <div>
              <p className="font-bold text-[#0A2540]">Phone</p>
              <p className="text-sm text-slate-600">+91 1800 123 4567</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center text-xl">💬</div>
            <div>
              <p className="font-bold text-[#0A2540]">WhatsApp</p>
              <p className="text-sm text-slate-600">+91 98765 43210</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center text-xl">✉️</div>
            <div>
              <p className="font-bold text-[#0A2540]">Email</p>
              <p className="text-sm text-slate-600">support@doorsteppro.com</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <h3 className="font-bold text-[#0A2540] mb-4">Quick Help</h3>
          <div className="grid md:grid-cols-3 gap-3">
            {['How to book', 'Payment issues', 'Cancel booking', 'Refund status', 'Provider contact', 'Report problem'].map((topic, i) => (
              <button key={i} className="p-4 bg-slate-50 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100 text-left">
                {topic}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSupport;

