import React from 'react';
import Seo from "../../components/seo/Seo";
import { Wallet, History, ArrowUpRight, Clock, CheckCircle2 } from 'lucide-react';

export default function Earnings() {
  const payouts = [
    { id: "P001", amount: 2500, date: "2024-06-10", status: "Completed" },
    { id: "P002", amount: 1800, date: "2024-06-18", status: "Pending" },
  ];

  return (
    <>
      <Seo
        title="Earnings & Payouts"
        description="View your earnings and payout history"
        noIndex
      />

      <div className="max-w-4xl mx-auto p-4 md:p-10 space-y-8">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                <Wallet className="w-8 h-8 text-indigo-600" />
                Earnings
            </h1>
            <button className="bg-gray-900 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center gap-2 shadow-lg">
                Request Payout <ArrowUpRight className="w-4 h-4" />
            </button>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Lifetime</p>
                <p className="text-2xl font-black text-gray-900">₹ 45,000</p>
            </div>
            <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 shadow-sm">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Available to Withdraw</p>
                <p className="text-2xl font-black text-indigo-700">₹ 3,200</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Processed Payouts</p>
                <p className="text-2xl font-black text-green-600">₹ 41,800</p>
            </div>
        </div>

        {/* PAYOUT HISTORY */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-black text-gray-900">
                Payout History
            </h2>
          </div>

          <div className="overflow-x-auto">
              {payouts.length === 0 ? (
                <div className="p-20 text-center text-gray-400 font-bold italic">
                  No payout transactions detected.
                </div>
              ) : (
                <table className="min-w-full">
                    <thead className="bg-gray-50/50">
                        <tr>
                            <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Reference</th>
                            <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                            <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                            <th className="px-8 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {payouts.map(p => (
                            <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-8 py-6 font-bold text-gray-900">#{p.id}</td>
                                <td className="px-8 py-6 text-sm text-gray-500">{p.date}</td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-2">
                                        {p.status === "Completed" ? (
                                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-[10px] font-black uppercase tracking-wider border border-green-100">
                                                <CheckCircle2 className="w-3 h-3" /> {p.status}
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-[10px] font-black uppercase tracking-wider border border-orange-100">
                                                <Clock className="w-3 h-3" /> {p.status}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right font-black text-gray-900">₹ {p.amount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
              )}
          </div>
        </div>

        <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                    <h4 className="font-bold">Next Automatic Settlement</h4>
                    <p className="text-sm text-gray-400">Scheduled for Friday, Oct 27, 2024</p>
                </div>
            </div>
            <button className="text-xs font-black text-indigo-400 uppercase tracking-widest hover:text-white transition-colors">View Settlement Policy</button>
        </div>
      </div>
    </>
  );
}
