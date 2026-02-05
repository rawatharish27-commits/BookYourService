import React, { useState } from 'react';
import { StatusBadge } from '../../components/StatusBadge';
import { Search, Filter, ArrowRight, Ban, RefreshCw, DollarSign, Calendar, Clock } from 'lucide-react';

export const Bookings: React.FC = () => {
  const [filter, setFilter] = useState('ALL');

  const bookings = [
    { id: 'ORD-55421', service: 'AC Deep Cleaning', client: 'Rahul Mehta', pro: 'Vikram Pro', date: '2024-10-24', time: '10:00 AM', status: 'CONFIRMED', amount: 1499 },
    { id: 'ORD-98822', service: 'Kitchen Sanitization', client: 'Sanya Gupta', pro: 'SanitX Ltd', date: '2024-10-24', time: '02:00 PM', status: 'IN_PROGRESS', amount: 2499 },
    { id: 'ORD-11233', service: 'Plumbing Repair', client: 'Amit Jha', pro: 'Pending Assignment', date: '2024-10-25', time: '09:00 AM', status: 'INITIATED', amount: 499 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Booking ID, Client, or Pro..." className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div className="flex bg-gray-50 p-1 rounded-xl w-full md:w-auto overflow-x-auto no-scrollbar">
          {['ALL', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map(s => (
            <button 
              key={s} 
              onClick={() => setFilter(s)}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${filter === s ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Order Details</th>
              <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Participants</th>
              <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Schedule</th>
              <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Revenue</th>
              <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Control</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {bookings.map(b => (
              <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-8 py-6">
                  <div className="text-sm font-black text-gray-900">{b.service}</div>
                  <div className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded w-fit mt-1">#{b.id}</div>
                </td>
                <td className="px-8 py-6">
                  <div className="text-xs font-bold text-gray-600">👤 {b.client}</div>
                  <div className="text-xs font-bold text-gray-400 mt-1">👨‍🔧 {b.pro}</div>
                </td>
                <td className="px-8 py-6">
                  <div className="text-xs font-bold text-gray-700 flex items-center gap-1.5"><Calendar className="w-3 h-3"/> {b.date}</div>
                  <div className="text-xs font-bold text-gray-400 flex items-center gap-1.5 mt-1"><Clock className="w-3 h-3"/> {b.time}</div>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="text-lg font-black text-gray-900">₹{b.amount}</div>
                  <StatusBadge status={b.status as any} />
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="p-2 text-gray-300 hover:text-indigo-600"><RefreshCw className="w-4 h-4"/></button>
                    <button className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center gap-2">
                      <Ban className="w-4 h-4" /> Force Cancel
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};