import React, { useEffect, useState } from 'react';
import { Service, Role } from '../../types';
import { getServices, updateServiceStatus, getWallet } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { PlusCircle, Eye, EyeOff, Wallet, Calendar, TrendingUp, MessageSquare } from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge';
import TrustScore from '../../components/provider/TrustScore';
import ReviewBreakdown from '../../components/provider/ReviewBreakdown';
import TrustBadge from "../../components/provider/TrustBadge";

export const ProviderDashboard: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [balance, setBalance] = useState(0);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  // Mocked analytics for Phase 6
  const ratingStats = [
    { star: 5, count: 42, total: 50 },
    { star: 4, count: 5, total: 50 },
    { star: 3, count: 2, total: 50 },
    { star: 2, count: 1, total: 50 },
    { star: 1, count: 0, total: 50 },
  ];

  useEffect(() => {
    if (user) {
        fetchServices();
        fetchWallet();
    }
  }, [user]);

  const fetchServices = async () => {
    setLoading(true);
    try {
        const data = await getServices(Role.PROVIDER);
        setServices(data);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const fetchWallet = async () => {
      try {
          const data = await getWallet();
          setBalance(data.balance);
      } catch (e) { console.error(e); }
  };

  const handleToggleStatus = async (service: Service) => {
      try {
        await updateServiceStatus(service.id, !service.isActive);
        fetchServices();
      } catch (e) {
          alert("Failed to update status");
      }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Provider <span className="text-indigo-600">Insights</span></h2>
          <TrustBadge score={85} />
        </div>
        
        <div className="flex items-center gap-4">
            <Link to="/provider/earnings" className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 hover:border-indigo-100 transition-all">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                    <Wallet className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Balance</p>
                    <p className="text-xl font-black text-gray-900 leading-none">₹{balance}</p>
                </div>
            </Link>
            <Link
                to="/provider/create-service"
                className="bg-gray-900 hover:bg-indigo-600 text-white px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl hover:shadow-indigo-100"
            >
                <PlusCircle className="w-5 h-5" /> New Service
            </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ANALYTICS SECTION */}
          <div className="lg:col-span-4 space-y-6">
              <TrustScore score={88} />
              
              <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-center mb-8">
                      <h3 className="font-black text-gray-900 flex items-center gap-2">
                          <MessageSquare className="w-5 h-5 text-indigo-600" /> Reputation
                      </h3>
                      <Link to="/provider/reviews" className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">View All</Link>
                  </div>
                  <ReviewBreakdown stats={ratingStats} />
                  <div className="mt-8 pt-6 border-t border-gray-50 text-center">
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Global Rating</p>
                      <p className="text-4xl font-black text-gray-900 mt-1">4.8</p>
                  </div>
              </div>
          </div>

          {/* SERVICES LISTING */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden h-full flex flex-col">
                <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                    <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
                        <TrendingUp className="w-6 h-6 text-indigo-600" /> Catalog Manager
                    </h3>
                </div>
                
                <div className="flex-1 overflow-x-auto">
                    {loading ? (
                        <div className="p-20 text-center text-gray-400 font-bold italic animate-pulse">Syncing catalog...</div>
                    ) : (
                        <table className="min-w-full">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Service Offer</th>
                                    <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Price</th>
                                    <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {services.map(service => (
                                    <tr key={service.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-sm border border-white">
                                                    <img className="w-full h-full object-cover" src={service.image} alt="" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-gray-900">{service.title}</div>
                                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{service.zoneName}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="text-sm font-black text-gray-900">₹{service.price}</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <StatusBadge status={service.isActive ? 'ACTIVE' : 'INACTIVE'} />
                                            {!service.isApproved && <span className="block text-[9px] font-black text-yellow-600 uppercase mt-1 tracking-tighter">Under Review</span>}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button 
                                                onClick={() => handleToggleStatus(service)}
                                                className={`p-2 rounded-xl transition-all ${service.isActive ? 'text-indigo-600 hover:bg-indigo-50' : 'text-gray-300 hover:text-gray-900'}`}
                                            >
                                                {service.isActive ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5"/>}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    {services.length === 0 && !loading && (
                        <div className="p-20 text-center text-gray-400 font-bold italic">No active services in catalog.</div>
                    )}
                </div>

                <div className="p-6 bg-indigo-50/50 border-t border-indigo-50 text-center">
                    <Link to="/provider/availability" className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline flex items-center justify-center gap-2">
                        <Calendar className="w-4 h-4" /> Update Schedule to receive jobs
                    </Link>
                </div>
            </div>
          </div>
      </div>
    </div>
  );
};
