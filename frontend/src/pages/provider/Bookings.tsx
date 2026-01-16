/**
 * Provider Bookings Page - Manage incoming booking requests and active jobs
 */
import React, { useState } from 'react';

const ProviderBookings: React.FC = () => {
  const [filter, setFilter] = useState('requests');

  const requests = [
    { id: 'REQ001', service: 'Electrical Repair', customer: 'John Doe', address: 'Andheri, Mumbai', distance: '2.5 km', price: '₹350', time: 'Today, 2:00 PM' },
    { id: 'REQ002', service: 'AC Service', customer: 'Priya Sharma', address: 'Bandra, Mumbai', distance: '5 km', price: '₹800', time: 'Tomorrow, 10:00 AM' }
  ];

  const bookings = [
    { id: 'BK001', service: 'Plumbing', customer: 'Amit Patel', address: 'Dadar, Mumbai', status: 'in_progress', price: '₹450', time: 'Today, 4:00 PM' },
    { id: 'BK002', service: 'Electrical', customer: 'Suresh K.', address: 'Worli, Mumbai', status: 'completed', price: '₹350', time: 'Yesterday' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-[#0A2540] italic">Bookings</h1>
        <div className="flex gap-2">
          <button onClick={() => setFilter('requests')} className={`px-4 py-2 rounded-xl font-bold text-xs uppercase ${filter === 'requests' ? 'bg-[#0A2540] text-white' : 'bg-white text-slate-400'}`}>Requests ({requests.length})</button>
          <button onClick={() => setFilter('active')} className={`px-4 py-2 rounded-xl font-bold text-xs uppercase ${filter === 'active' ? 'bg-[#0A2540] text-white' : 'bg-white text-slate-400'}`}>Active</button>
          <button onClick={() => setFilter('completed')} className={`px-4 py-2 rounded-xl font-bold text-xs uppercase ${filter === 'completed' ? 'bg-[#0A2540] text-white' : 'bg-white text-slate-400'}`}>Completed</button>
        </div>
      </div>

      {filter === 'requests' && (
        <div className="space-y-4">
          {requests.map(req => (
            <div key={req.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-[#0A2540] text-lg">{req.service}</h3>
                  <p className="text-sm text-slate-400">{req.customer}</p>
                  <p className="text-xs text-slate-500">📍 {req.address} • {req.distance}</p>
                  <p className="text-xs text-slate-500">🕐 {req.time}</p>
                </div>
                <p className="text-xl font-black text-emerald-600">{req.price}</p>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                <button className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold text-xs uppercase">Reject</button>
                <button className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-bold text-xs uppercase">Accept</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {filter === 'active' && (
        <div className="space-y-4">
          {bookings.filter(b => b.status === 'in_progress').map(booking => (
            <div key={booking.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-[10px] font-bold uppercase mb-2">In Progress</span>
                  <h3 className="font-bold text-[#0A2540] text-lg">{booking.service}</h3>
                  <p className="text-sm text-slate-400">{booking.customer}</p>
                  <p className="text-xs text-slate-500">📍 {booking.address}</p>
                </div>
                <p className="text-xl font-black text-emerald-600">{booking.price}</p>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                <button className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-bold text-xs uppercase">Mark Complete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {filter === 'completed' && (
        <div className="space-y-4">
          {bookings.filter(b => b.status === 'completed').map(booking => (
            <div key={booking.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-600 rounded-full text-[10px] font-bold uppercase mb-2">Completed</span>
                  <h3 className="font-bold text-[#0A2540] text-lg">{booking.service}</h3>
                  <p className="text-sm text-slate-400">{booking.customer}</p>
                  <p className="text-xs text-slate-500">📍 {booking.address}</p>
                </div>
                <p className="text-xl font-black text-emerald-600">{booking.price}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProviderBookings;

