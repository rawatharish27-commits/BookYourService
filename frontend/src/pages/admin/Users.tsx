/**
 * Admin Users Page - Manage customers and users
 */
import React, { useState } from 'react';

const AdminUsers: React.FC = () => {
  const [filter, setFilter] = useState('all');

  const users = [
    { id: 'USR001', name: 'John Doe', phone: '+91 98765 43210', email: 'john@example.com', city: 'Mumbai', status: 'active', bookings: 24, joined: 'Oct 2024' },
    { id: 'USR002', name: 'Priya Sharma', phone: '+91 98765 43211', email: 'priya@example.com', city: 'Mumbai', status: 'active', bookings: 12, joined: 'Nov 2024' },
    { id: 'USR003', name: 'Amit Patel', phone: '+91 98765 43212', email: 'amit@example.com', city: 'Delhi', status: 'blocked', bookings: 5, joined: 'Dec 2024' },
    { id: 'USR004', name: 'Sneha Gupta', phone: '+91 98765 43213', email: 'sneha@example.com', city: 'Bangalore', status: 'active', bookings: 8, joined: 'Dec 2024' }
  ];

  const filteredUsers = filter === 'all' ? users : users.filter(u => u.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-[#0A2540] italic">Users</h1>
        <div className="flex gap-2">
          {['all', 'active', 'blocked'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl font-bold text-xs uppercase ${filter === f ? 'bg-[#0A2540] text-white' : 'bg-white text-slate-400'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">User</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Contact</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">City</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Bookings</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.map(user => (
              <tr key={user.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white font-bold">{user.name[0]}</div>
                    <div>
                      <p className="font-bold text-[#0A2540]">{user.name}</p>
                      <p className="text-xs text-slate-400">{user.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-slate-600">{user.phone}</p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{user.city}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                    user.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 font-bold text-[#0A2540]">{user.bookings}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-blue-500 text-white rounded-lg text-xs font-bold">View</button>
                    {user.status === 'active' ? (
                      <button className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs font-bold">Block</button>
                    ) : (
                      <button className="px-3 py-1 bg-green-500 text-white rounded-lg text-xs font-bold">Unblock</button>
                    )}
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

export default AdminUsers;

