import React, { useState } from 'react';
import { StatusBadge } from '../../components/StatusBadge';
import { Search, UserX, UserCheck, Shield, MoreVertical, Mail, Phone, Calendar } from 'lucide-react';

export const Users: React.FC = () => {
  const [search, setSearch] = useState('');

  // Mock users for UI development
  const users = [
    { id: '1', name: 'Arjun Singh', email: 'arjun@example.com', phone: '+91 9876543210', role: 'CLIENT', status: 'ACTIVE', joined: '2024-01-15' },
    { id: '2', name: 'Priya Verma', email: 'priya@pro.com', phone: '+91 8888888888', role: 'PROVIDER', status: 'ACTIVE', joined: '2024-02-10' },
    { id: '3', name: 'John Doe', email: 'john@badactor.com', phone: '+91 7777777777', role: 'CLIENT', status: 'SUSPENDED', joined: '2024-03-01' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search users by name, email, or phone..." 
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Account Info</th>
              <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact</th>
              <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
              <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Access</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center font-black text-gray-400 border border-gray-200">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-black text-gray-900">{u.name}</div>
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded w-fit mt-1">
                        {u.role}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-gray-600 flex items-center gap-1.5"><Mail className="w-3 h-3"/> {u.email}</div>
                    <div className="text-xs font-bold text-gray-400 flex items-center gap-1.5"><Phone className="w-3 h-3"/> {u.phone}</div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <StatusBadge status={u.status as any} />
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-3">
                    {u.status === 'ACTIVE' ? (
                      <button className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center gap-2">
                        <UserX className="w-4 h-4" /> Block
                      </button>
                    ) : (
                      <button className="bg-green-50 text-green-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-600 hover:text-white transition-all flex items-center gap-2">
                        <UserCheck className="w-4 h-4" /> Unblock
                      </button>
                    )}
                    <button className="p-2 text-gray-300 hover:text-gray-900 transition-colors"><MoreVertical className="w-5 h-5"/></button>
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