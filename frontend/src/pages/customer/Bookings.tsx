/**
 * Customer Bookings Page - View and manage all bookings
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const CustomerBookings: React.FC = () => {
  const [filter, setFilter] = useState('all');

  const bookings = [
    { id: 'BK001', service: 'Electrical Repair', provider: 'Rahul Sharma', date: 'Today, 2:00 PM', status: 'confirmed', amount: '₹350' },
    { id: 'BK002', service: 'AC Service', provider: 'Amit Kumar', date: 'Tomorrow, 10:00 AM', status: 'pending', amount: '₹800' },
    { id: 'BK003', service: 'Plumbing', provider: 'Suresh Patel', date: 'Dec 28, 4:00 PM', status: 'completed', amount: '₹450' },
    { id: 'BK004', service: 'Carpentry', provider: 'Vijay Singh', date: 'Dec 25, 11:00 AM', status: 'cancelled', amount: '₹600' }
  ];

  const filteredBookings = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-[#0A2540] italic">My Bookings</h1>
        <Link to="/customer/book/new" className="px-6 py-3 bg-[#0A2540] text-white rounded-2xl font-bold uppercase text-xs tracking-widest">+ New Booking</Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'confirmed', 'pending', 'completed', 'cancelled'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest ${
              filter === f ? 'bg-[#0A2540] text-white' : 'bg-white text-slate-400 hover:bg-slate-100'
            }`}>
            {f}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.map(booking => (
          <div key={booking.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <div className="w-14 h-14 bg-[#0A2540] rounded-xl flex items-center justify-center text-white text-xl">🔧</div>
                <div>
                  <h3 className="font-bold text-[#0A2540] text-lg">{booking.service}</h3>
                  <p className="text-sm text-slate-400">Booking #{booking.id}</p>
                  <p className="text-xs text-slate-500 mt-1">Provider: {booking.provider}</p>
                  <p className="text-xs text-slate-500">📅 {booking.date}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                  booking.status === 'confirmed' ? 'bg-green-100 text-green-600' :
                  booking.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                  booking.status === 'completed' ? 'bg-blue-100 text-blue-600' :
                  'bg-red-100 text-red-600'
                }`}>
                  {booking.status}
                </span>
                <p className="font-bold text-[#0A2540] mt-2">{booking.amount}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
              <Link to={`/customer/booking/${booking.id}`} className="flex-1 py-2 bg-slate-100 rounded-xl font-bold text-xs uppercase text-center hover:bg-slate-200">View Details</Link>
              {booking.status === 'pending' && <button className="flex-1 py-2 bg-red-100 text-red-500 rounded-xl font-bold text-xs uppercase hover:bg-red-200">Cancel</button>}
              {booking.status === 'completed' && <button className="flex-1 py-2 bg-blue-100 text-blue-500 rounded-xl font-bold text-xs uppercase hover:bg-blue-200">Add Review</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerBookings;

