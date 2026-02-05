import React, { useEffect, useState } from 'react';
import { ProviderStats } from '../../types';
import { getProvidersForPayout, payoutProvider } from '../../services/api';
import { 
  DollarSign, UserCheck, Layers, ClipboardList, 
  LayoutDashboard, MessageSquare, Scale, Settings, ShieldCheck,
  Users as UsersIcon, Calendar
} from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge';

// Import New Hardened Components
import { Categories } from './Categories';
import { Users } from './Users';
import { Bookings } from './Bookings';
import { DashboardOverview } from './DashboardOverview';
import { ReviewModeration } from './ReviewModeration';
import { SystemConfig } from './SystemConfig';
import { DisputeManager } from './DisputeManager';
import { ProviderVerification } from './ProviderVerification';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'bookings' | 'categories' | 'verification' | 'payouts' | 'reviews' | 'config' | 'disputes'>('overview');
  const [providers, setProviders] = useState<ProviderStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if(activeTab === 'payouts') fetchProviders();
  }, [activeTab]);

  const fetchProviders = async () => {
      setLoading(true);
      try {
          const prov = await getProvidersForPayout();
          setProviders(prov);
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
  };

  const handlePayout = async (providerId: string, balance: number) => {
      const amountStr = prompt(`Current Balance: ₹${balance}. Enter payout amount:`);
      if (!amountStr) return;
      const amount = parseFloat(amountStr);
      if (amount <= 0 || amount > balance) { alert("Invalid amount"); return; }
      
      try {
          await payoutProvider(providerId, amount);
          alert("Payout Processed");
          fetchProviders();
      } catch(e: any) { alert(e.response?.data?.message); }
  };

  const TABS = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: UsersIcon },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'verification', label: 'Verifications', icon: ShieldCheck },
    { id: 'disputes', label: 'Disputes', icon: Scale },
    { id: 'payouts', label: 'Payouts', icon: DollarSign },
    { id: 'reviews', label: 'Reviews', icon: MessageSquare },
    { id: 'categories', label: 'Catalog', icon: Layers },
    { id: 'config', label: 'System', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
            <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                    <ShieldCheck className="w-8 h-8 text-indigo-600" /> Admin <span className="text-indigo-600">Console</span>
                </h2>
                <p className="text-gray-500 font-medium mt-1">Platform management and governance layer.</p>
            </div>
            
            <div className="flex bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 overflow-x-auto max-w-full no-scrollbar">
                {TABS.map(item => (
                    <button 
                        key={item.id}
                        onClick={() => setActiveTab(item.id as any)}
                        className={`px-4 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === item.id ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                    >
                        <item.icon className="w-4 h-4" /> {item.label}
                    </button>
                ))}
            </div>
        </div>

        <div className="mt-8 min-h-[60vh]">
            {activeTab === 'overview' && <DashboardOverview />}
            {activeTab === 'users' && <Users />}
            {activeTab === 'bookings' && <Bookings />}
            {activeTab === 'verification' && <ProviderVerification />}
            {activeTab === 'disputes' && <DisputeManager />}
            {activeTab === 'config' && <SystemConfig />}
            {activeTab === 'reviews' && <ReviewModeration />}
            {activeTab === 'categories' && <Categories />}

            {activeTab === 'payouts' && (
                <div className="animate-in fade-in duration-500">
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-8 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                            <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                                <DollarSign className="w-6 h-6 text-indigo-600" /> Provider Wallets
                            </h3>
                        </div>
                        {loading ? <div className="p-20 text-center text-gray-400 italic font-bold">Querying ledger...</div> : (
                            <table className="min-w-full">
                                <thead className="bg-gray-50/30">
                                    <tr>
                                        <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Provider</th>
                                        <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                        <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Available Balance</th>
                                        <th className="px-8 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {providers.length === 0 ? (
                                        <tr><td colSpan={4} className="p-20 text-center text-gray-400 font-bold italic">No active wallets found.</td></tr>
                                    ) : providers.map(p => (
                                        <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="text-sm font-black text-gray-900">{p.name}</div>
                                                <div className="text-[10px] text-gray-400 font-bold uppercase">{p.email}</div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <StatusBadge status={p.verification_status as any} />
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="text-lg font-black text-green-700">₹{p.balance}</div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                {p.balance > 0 && (
                                                    <button 
                                                        onClick={() => handlePayout(p.id, p.balance)} 
                                                        className="bg-gray-900 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-md active:scale-95"
                                                    >
                                                        Process Payout
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};