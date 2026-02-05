import React, { useEffect, useState } from 'react';
import { getSystemMetrics } from '../../services/api';
import { Activity, AlertTriangle, CheckCircle, Clock, DollarSign, Server, UserX, Users } from 'lucide-react';

interface Metrics {
    bookings_by_status: { status: string; count: string }[];
    providers_by_status: { verification_status: string; count: string }[];
    payments_by_status: { payment_status: string; count: string }[];
    total_volume: number;
    potential_fraud_clients: number;
    system_errors_last_24h: number;
}

export const DashboardOverview: React.FC = () => {
    const [metrics, setMetrics] = useState<Metrics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const data = await getSystemMetrics();
                setMetrics(data.metrics);
            } catch (e) {
                console.error("Failed to load metrics", e);
            } finally {
                setLoading(false);
            }
        };
        fetchMetrics();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading live metrics...</div>;
    if (!metrics) return <div className="p-8 text-center text-red-500">Failed to load system metrics.</div>;

    // Helper to get count safely
    const getCount = (arr: any[], key: string, val: string) => {
        const item = arr.find(x => x[key] === val);
        return item ? parseInt(item.count) : 0;
    };

    const pendingBookings = getCount(metrics.bookings_by_status, 'status', 'PENDING');
    const activeBookings = getCount(metrics.bookings_by_status, 'status', 'IN_PROGRESS') + getCount(metrics.bookings_by_status, 'status', 'ACCEPTED');
    const completedBookings = getCount(metrics.bookings_by_status, 'status', 'COMPLETED');
    const activeProviders = getCount(metrics.providers_by_status, 'verification_status', 'APPROVED');
    const pendingProviders = getCount(metrics.providers_by_status, 'verification_status', 'PENDING');

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            
            {/* KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Total Revenue</p>
                            <h3 className="text-2xl font-extrabold text-gray-900 mt-1">${metrics.total_volume || 0}</h3>
                        </div>
                        <div className="p-2 bg-green-50 rounded-lg text-green-600"><DollarSign className="w-5 h-5"/></div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Active Providers</p>
                            <h3 className="text-2xl font-extrabold text-gray-900 mt-1">{activeProviders}</h3>
                            <p className="text-xs text-yellow-600 mt-1">{pendingProviders} pending approval</p>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Users className="w-5 h-5"/></div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">System Health</p>
                            <h3 className="text-2xl font-extrabold text-gray-900 mt-1">
                                {metrics.system_errors_last_24h === 0 ? 'Healthy' : 'Issues'}
                            </h3>
                            {metrics.system_errors_last_24h > 0 && (
                                <p className="text-xs text-red-600 mt-1">{metrics.system_errors_last_24h} errors (24h)</p>
                            )}
                        </div>
                        <div className={`p-2 rounded-lg ${metrics.system_errors_last_24h > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                            <Server className="w-5 h-5"/>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Fraud Alerts</p>
                            <h3 className="text-2xl font-extrabold text-gray-900 mt-1">{metrics.potential_fraud_clients}</h3>
                            <p className="text-xs text-gray-500 mt-1">High-risk clients</p>
                        </div>
                        <div className="p-2 bg-orange-50 rounded-lg text-orange-600"><AlertTriangle className="w-5 h-5"/></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* BOOKING PIPELINE */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-indigo-600" /> Live Booking Pipeline
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                            <div className="flex items-center gap-3">
                                <Clock className="w-5 h-5 text-yellow-600" />
                                <span className="font-medium text-gray-700">Pending Assignment</span>
                            </div>
                            <span className="font-bold text-xl text-yellow-700">{pendingBookings}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <div className="flex items-center gap-3">
                                <Activity className="w-5 h-5 text-blue-600" />
                                <span className="font-medium text-gray-700">Active / In Progress</span>
                            </div>
                            <span className="font-bold text-xl text-blue-700">{activeBookings}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-100">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <span className="font-medium text-gray-700">Completed (Lifetime)</span>
                            </div>
                            <span className="font-bold text-xl text-green-700">{completedBookings}</span>
                        </div>
                    </div>
                </div>

                {/* ALERTS & FINANCIALS */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-600" /> Operational Alerts
                    </h3>
                    <div className="space-y-4">
                        {metrics.potential_fraud_clients > 0 ? (
                            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                                <h4 className="font-bold text-red-800 text-sm">Potential Fraud Detected</h4>
                                <p className="text-xs text-red-700 mt-1">
                                    {metrics.potential_fraud_clients} clients have >3 cancellations in 24h. 
                                    Check Users table for flags.
                                </p>
                            </div>
                        ) : (
                            <div className="p-4 bg-gray-50 border-l-4 border-gray-300 rounded-r-lg">
                                <p className="text-sm text-gray-500">No high-priority alerts.</p>
                            </div>
                        )}

                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <h4 className="font-bold text-gray-900 text-sm mb-3">Payment Success Rate</h4>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden flex">
                                    <div 
                                        className="bg-green-500 h-full" 
                                        style={{ width: `${(getCount(metrics.payments_by_status, 'payment_status', 'SUCCESS') / (metrics.payments_by_status.reduce((a,b) => a + parseInt(b.count), 0) || 1)) * 100}%` }}
                                    ></div>
                                </div>
                                <span className="text-xs font-bold text-gray-600">
                                    {getCount(metrics.payments_by_status, 'payment_status', 'SUCCESS')} / {metrics.payments_by_status.reduce((a,b) => a + parseInt(b.count), 0)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};