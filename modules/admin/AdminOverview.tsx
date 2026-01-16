import React, { useState, useEffect } from 'react';
import { db } from '../../services/DatabaseService';
import { BookingStatus, UserRole, UserStatus } from '../../types';

const AdminOverview: React.FC = () => {
  const [users, setUsers] = useState(db.getUsers());
  const [bookings, setBookings] = useState(db.getBookings());
  const [ledger, setLedger] = useState(db.getLedger());

  useEffect(() => {
    const interval = setInterval(() => {
      setUsers(db.getUsers());
      setBookings(db.getBookings());
      setLedger(db.getLedger());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { label: 'Total Revenue', val: `₹${ledger.reduce((s, l) => s + (l.category === 'PLATFORM_FEE' ? l.amount : 0), 0)}`, icon: '💰', color: 'text-green-600' },
    { label: 'Active Bookings', val: bookings.filter(b => b.status === BookingStatus.IN_PROGRESS).length, icon: '📡', color: 'text-blue-600' },
    { label: 'Verified Providers', val: users.filter(u => u.role === UserRole.PROVIDER && u.status === UserStatus.APPROVED).length, icon: '🛡️', color: 'text-purple-600' },
    { label: 'Total Users', val: users.length, icon: '👥', color: 'text-orange-600' }
  ];

  return (
    <div className="p-8 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none mb-2">
          Governance <span className="text-blue-600">Dashboard</span>
        </h1>
        <p className="text-sm text-slate-600">Real-time platform overview and key metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-4 hover:shadow-lg transition-all group">
            <div className="flex justify-between items-center">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
              <span className="text-2xl group-hover:scale-110 transition-transform">{stat.icon}</span>
            </div>
            <h3 className={`text-3xl font-black tracking-tighter italic leading-none ${stat.color}`}>{stat.val}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <span className="mr-2">📅</span> Recent Bookings
          </h3>
          <div className="space-y-3">
            {bookings.slice(0, 5).map(booking => (
              <div key={booking.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                <div>
                  <p className="font-semibold text-slate-900">{booking.problemTitle}</p>
                  <p className="text-sm text-slate-600">{booking.status}</p>
                </div>
                <span className="text-lg font-bold text-green-600">₹{booking.totalAmount}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <span className="mr-2">🚨</span> System Alerts
          </h3>
          <div className="space-y-3">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <p className="text-sm font-semibold text-yellow-800">
                {users.filter(u => u.role === UserRole.PROVIDER && u.status === UserStatus.UNDER_REVIEW).length} providers pending approval
              </p>
            </div>
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm font-semibold text-red-800">
                {bookings.filter(b => b.status === BookingStatus.CANCELLED).length} bookings cancelled
              </p>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-sm font-semibold text-green-800">System health: 99.9%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100">
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <span className="mr-2">📈</span> Platform Activity
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <div className="text-2xl font-bold text-blue-600">{bookings.length}</div>
            <div className="text-sm text-blue-800">Total Bookings</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.role === UserRole.PROVIDER).length}
            </div>
            <div className="text-sm text-green-800">Active Providers</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-xl">
            <div className="text-2xl font-bold text-purple-600">
              {ledger.filter(l => l.category === 'PLATFORM_FEE').length}
            </div>
            <div className="text-sm text-purple-800">Transactions</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;