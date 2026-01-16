/**
 * Admin Providers Page - Manage service providers
 */
import React, { useState } from 'react';

const AdminProviders: React.FC = () => {
  const [filter, setFilter] = useState('pending');

  const providers = [
    { id: 'PRV001', name: 'Rahul Sharma', service: 'Electrician', rating: 4.8, status: 'approved', joined: 'Dec 2024', earnings: '₹45,000' },
    { id: 'PRV002', name: 'Amit Kumar', service: 'AC Repair', rating: 4.5, status: 'pending', joined: 'Dec 2024', earnings: '₹0' },
    { id: 'PRV003', name: 'Suresh Patel', service: 'Plumbing', rating: 4.9, status: 'approved', joined: 'Nov 2024', earnings: '₹62,000' },
    { id: 'PRV004', name: 'Vijay Singh', service: 'Carpentry', rating: 4.2, status: 'rejected', joined: 'Dec 2024', earnings: '₹0' }
  ];

  const filteredProviders = filter === 'all' ? providers : providers.filter(p => p.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-[#0A2540] italic">Service Providers</h1>
        <div className="flex gap-2">
          {['all', 'pending', 'approved', 'rejected'].map(f => (
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
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Provider</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Service</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Rating</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Earnings</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredProviders.map(provider => (
              <tr key={provider.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#0A2540] rounded-xl flex items-center justify-center text-white font-bold">{provider.name[0]}</div>
                    <div>
                      <p className="font-bold text-[#0A2540]">{provider.name}</p>
                      <p className="text-xs text-slate-400">{provider.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{provider.service}</td>
                <td className="px-6 py-4">
                  <span className="flex items-center gap-1 text-sm font-bold text-yellow-500">⭐ {provider.rating}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                    provider.status === 'approved' ? 'bg-green-100 text-green-600' :
                    provider.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {provider.status}
                  </span>
                </td>
                <td className="px-6 py-4 font-bold text-emerald-600">{provider.earnings}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-blue-500 text-white rounded-lg text-xs font-bold">View</button>
                    {provider.status === 'pending' && (
                      <>
                        <button className="px-3 py-1 bg-green-500 text-white rounded-lg text-xs font-bold">Approve</button>
                        <button className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs font-bold">Reject</button>
                      </>
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

export default AdminProviders;

