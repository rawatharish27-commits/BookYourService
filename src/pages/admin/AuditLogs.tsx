import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Search, History, User, Database, ShieldAlert, Clock } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const AuditLogs: React.FC = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const { showToast } = useToast();

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await api.get('/api/v1/admin/audit-logs');
                setLogs(res.data);
            } catch (e) {
                showToast("Failed to fetch audit trails", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, [showToast]);

    const filtered = logs.filter(l => 
        l.action_type.toLowerCase().includes(search.toLowerCase()) ||
        l.admin_name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search audit trail..." 
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-4">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-lg flex items-center gap-2">
                        <History className="w-3 h-3" /> Immutable Records
                    </span>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-20 text-center text-gray-400 italic font-bold">Querying vault...</div>
                ) : (
                    <table className="min-w-full">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Admin</th>
                                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Operation</th>
                                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Target</th>
                                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Timestamp</th>
                                <th className="px-8 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.length === 0 ? (
                                <tr><td colSpan={5} className="p-20 text-center text-gray-400 font-bold italic">No log entries found.</td></tr>
                            ) : filtered.map(log => (
                                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 font-black text-xs">
                                                {log.admin_name?.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-gray-900">{log.admin_name}</div>
                                                <div className="text-[9px] font-bold text-gray-400 uppercase">{log.ip_address || 'Internal'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md uppercase tracking-tight">
                                            {log.action_type.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <Database className="w-3.5 h-3.5 text-gray-400" />
                                            <span className="text-xs font-bold text-gray-600">{log.target_type}</span>
                                            <span className="text-[10px] text-gray-300 font-mono">#{log.target_id.slice(0,8)}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                                            <Clock className="w-3 h-3" />
                                            {new Date(log.created_at).toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button 
                                            onClick={() => alert(JSON.stringify(log.payload, null, 2))}
                                            className="p-2 text-gray-300 hover:text-indigo-600 transition-colors"
                                        >
                                            <ShieldAlert className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};