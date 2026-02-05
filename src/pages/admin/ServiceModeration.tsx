import React, { useEffect, useState } from 'react';
import { Service } from '../../types';
import { getAdminServices, approveService, rejectService } from '../../services/api';
import { Check, X, Eye, FileText, Calendar, Clock } from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge';

type Tab = 'pending' | 'approved' | 'rejected';

export const ServiceModeration: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('pending');
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, [activeTab]);

  const fetchServices = async () => {
    setLoading(true);
    try {
        const data = await getAdminServices(activeTab);
        setServices(data);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (window.confirm("Approve this service? It will become visible to clients.")) {
        try {
            await approveService(id);
            fetchServices();
        } catch(e) { alert("Failed to approve"); }
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt("Reason for rejection (This will be shown to the provider):");
    if (!reason) return;

    try {
        await rejectService(id, reason);
        fetchServices();
    } catch(e) { alert("Failed to reject"); }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* TAB HEADER */}
        <div className="flex border-b border-gray-200">
            {['pending', 'approved', 'rejected'].map(tab => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab as Tab)}
                    className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === tab ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    {tab}
                </button>
            ))}
        </div>

        {/* CONTENT */}
        {loading ? (
            <div className="p-12 text-center text-gray-500">Loading...</div>
        ) : (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                            {activeTab === 'rejected' && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>}
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {services.length === 0 && (
                            <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No {activeTab} services found.</td></tr>
                        )}
                        {services.map(s => (
                            <tr key={s.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-gray-900">{s.title}</div>
                                    <div className="text-xs text-indigo-600">{s.categoryName} / {s.subCategoryName}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900">{s.providerName}</div>
                                    <div className="text-xs text-gray-500">{s.zoneName}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-mono text-sm">₹{s.price}</div>
                                </td>
                                <td className="px-6 py-4 text-xs text-gray-500">
                                    {new Date(s.createdAt || '').toLocaleDateString()}
                                </td>
                                {activeTab === 'rejected' && (
                                    <td className="px-6 py-4 text-xs text-red-600 font-medium max-w-xs truncate" title={s.rejectReason}>
                                        {s.rejectReason}
                                    </td>
                                )}
                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                    <div className="flex justify-end gap-2">
                                        {activeTab === 'pending' && (
                                            <>
                                                <button onClick={() => handleApprove(s.id)} className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 transition-colors">
                                                    <Check className="w-4 h-4" /> Approve
                                                </button>
                                                <button onClick={() => handleReject(s.id)} className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 transition-colors">
                                                    <X className="w-4 h-4" /> Reject
                                                </button>
                                            </>
                                        )}
                                        {activeTab === 'approved' && (
                                            <button onClick={() => handleReject(s.id)} className="text-red-500 hover:text-red-700 text-xs underline">Revoke</button>
                                        )}
                                        {activeTab === 'rejected' && (
                                            <button onClick={() => handleApprove(s.id)} className="text-green-500 hover:text-green-700 text-xs underline">Re-approve</button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </div>
  );
};