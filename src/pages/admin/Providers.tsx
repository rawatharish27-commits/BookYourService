import React, { useEffect, useState } from 'react';
import { getProvidersForPayout, verifyProvider } from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';
import { Search, ShieldAlert, ShieldCheck, FileText, MoreVertical, Ban, Activity } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const Providers: React.FC = () => {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => { fetchProviders(); }, []);

  const fetchProviders = async () => {
    try {
      const data = await getProvidersForPayout();
      setProviders(data);
    } catch (e) { showToast("Failed to fetch providers", "error"); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Search professionals..." className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Professional</th>
              <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Compliance</th>
              <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Performance</th>
              <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Control</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={4} className="p-20 text-center text-gray-400 font-bold italic animate-pulse">Syncing workforce database...</td></tr>
            ) : providers.map(p => (
              <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center font-black text-indigo-600 border border-gray-100">
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-black text-gray-900">{p.name}</div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{p.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <StatusBadge status={p.verification_status as any} />
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-tighter">
                    <div className="text-green-600 bg-green-50 px-2 py-0.5 rounded flex items-center gap-1"><Activity className="w-3 h-3"/> 4.8 Rating</div>
                    <div className="text-gray-500 bg-gray-100 px-2 py-0.5 rounded">125 Jobs</div>
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="p-2 text-gray-300 hover:text-indigo-600" title="Review Documents"><FileText className="w-4 h-4"/></button>
                    {p.verification_status !== 'SUSPENDED' ? (
                      <button className="bg-orange-50 text-orange-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all flex items-center gap-2">
                        <Ban className="w-4 h-4" /> Suspend
                      </button>
                    ) : (
                      <button className="bg-green-50 text-green-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-600 hover:text-white transition-all flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" /> Reinstate
                      </button>
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