import React, { useEffect, useState } from 'react';
import { getProvidersForPayout, verifyProvider, api } from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';
import { 
  UserCheck, ShieldCheck, FileText, ExternalLink, 
  CheckCircle, XCircle, Clock, Search, Filter, History
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const ProviderVerification: React.FC = () => {
    const [providers, setProviders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'KYC_SUBMITTED'>('KYC_SUBMITTED');
    const { showToast } = useToast();

    useEffect(() => {
        fetchProviders();
    }, []);

    const fetchProviders = async () => {
        setLoading(true);
        try {
            const data = await getProvidersForPayout();
            setProviders(data);
        } catch (e) {
            showToast("Failed to load providers", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: string, status: 'APPROVED' | 'REJECTED') => {
        const confirmMsg = status === 'APPROVED' ? "Approve this provider? They will be allowed to go live." : "Reject this provider? They will be notified to re-upload documents.";
        if (!window.confirm(confirmMsg)) return;

        try {
            await verifyProvider(id, status);
            showToast(`Provider ${status.toLowerCase()} successfully`, "success");
            fetchProviders();
        } catch (e: any) {
            showToast(e.response?.data?.message || "Action failed", "error");
        }
    };

    const filtered = providers.filter(p => {
        if (filter === 'ALL') return true;
        return p.verification_status === filter;
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header / Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Awaiting Review</p>
                    <h3 className="text-3xl font-black text-gray-900">{providers.filter(p => p.verification_status === 'KYC_SUBMITTED').length}</h3>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Total Providers</p>
                    <h3 className="text-3xl font-black text-gray-900">{providers.length}</h3>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Approval Rate</p>
                    <h3 className="text-3xl font-black text-green-600">82%</h3>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex bg-gray-50 p-1 rounded-xl">
                    {['ALL', 'PENDING', 'KYC_SUBMITTED'].map((t) => (
                        <button
                            key={t}
                            onClick={() => setFilter(t as any)}
                            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${filter === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            {t.replace('_', ' ')}
                        </button>
                    ))}
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input type="text" placeholder="Search by name..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
            </div>

            {/* Provider Cards */}
            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="py-20 text-center text-gray-400 font-bold italic">Scanning verification database...</div>
                ) : filtered.length === 0 ? (
                    <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                        <ShieldCheck className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-400 font-bold">No providers match this filter.</p>
                    </div>
                ) : (
                    filtered.map((p) => (
                        <div key={p.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-indigo-100 transition-colors">
                            <div className="flex gap-6 items-start">
                                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center font-black text-indigo-600 text-xl border border-gray-100">
                                    {p.name.charAt(0)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-lg font-black text-gray-900 leading-tight">{p.name}</h4>
                                        <StatusBadge status={p.verification_status} />
                                    </div>
                                    <p className="text-sm text-gray-500 font-medium mb-3">{p.email}</p>
                                    
                                    <div className="flex gap-4">
                                        <button className="flex items-center gap-1.5 text-[10px] font-black uppercase text-indigo-600 hover:underline">
                                            <FileText className="w-3.5 h-3.5" /> View KYC Docs <ExternalLink className="w-3 h-3" />
                                        </button>
                                        <button className="flex items-center gap-1.5 text-[10px] font-black uppercase text-gray-400 hover:text-gray-600">
                                            <History className="w-3.5 h-3.5" /> Audit Trail
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 w-full md:w-auto">
                                <button 
                                    onClick={() => handleAction(p.id, 'REJECTED')}
                                    className="flex-1 md:flex-none px-6 py-3 rounded-xl border border-red-100 text-red-600 font-black text-xs uppercase tracking-widest hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <XCircle className="w-4 h-4" /> Reject
                                </button>
                                <button 
                                    onClick={() => handleAction(p.id, 'APPROVED')}
                                    className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-gray-900 text-white font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2 shadow-xl hover:shadow-indigo-100"
                                >
                                    <CheckCircle className="w-4 h-4" /> Approve
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};