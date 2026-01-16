/**
 * Admin Bookings Page - Manage all bookings
 */
import React, { useState } from 'react';

const AdminBookings: React.FC = () => {
  const [filter, setFilter] = useState('all');

  const bookings = [
    { id: 'BK001', customer: 'John Doe', provider: 'Rahul Sharma', service: 'Electrical Repair', amount: '₹350', status: 'completed', date: 'Dec 27, 2024' },
    { id: 'BK002', customer: 'Priya Sharma', provider: 'Amit Kumar', service: 'AC Service', amount: '₹800', status: 'in_progress', date: 'Dec 27, 2024' },
    { id: 'BK003', customer: 'Amit Patel', provider: 'Suresh Patel', service: 'Plumbing', amount: '₹450', status: 'pending', date: 'Dec 28, 2024' },
    { id: 'BK004', customer: 'Sneha Gupta', provider: '-', service: 'Carpentry', amount: '₹600', status: 'cancelled', date: 'Dec 26, 2024' },
    { id: 'BK005', customer: 'Rahul K.', provider: 'Vijay Singh', service: 'Painting', amount: '₹2,500', status: 'completed', date: 'Dec 25, 2024' }
  ];

  const filteredBookings = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-[#0A2540] italic">All Bookings</h1>
        <div className="flex gap-2">
          {['all', 'pending', 'in_progress', 'completed', 'cancelled'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl font-bold text-xs uppercase ${filter === f ? 'bg-[#0A2540] text-white' : 'bg-white text-slate-400'}`}>
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Booking</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Customer</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Provider</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Service</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Amount</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredBookings.map(booking => (
              <tr key={booking.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <p className="font-bold text-[#0A2540]">{booking.id}</p>
                  <p className="text-xs text-slate-400">{booking.date}</p>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{booking.customer}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{booking.provider}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{booking.service}</td>
                <td className="px-6 py-4 font-bold text-emerald-600">{booking.amount}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                    booking.status === 'completed' ? 'bg-green-100 text-green-600' :
                    booking.status === 'in_progress' ? 'bg-blue-100 text-blue-600' :
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {booking.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-blue-500 text-white rounded-lg text-xs font-bold">View</button>
                    {booking.status === 'pending' && (
                      <button className="px-3 py-1 bg-green-500 text-white rounded-lg text-xs font-bold">Assign</button>
                    )}
                    <button className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs font-bold">Cancel</button>
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

export default AdminBookings;

