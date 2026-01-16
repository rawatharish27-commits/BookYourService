/**
 * Admin Providers Page - Provider Approval Management
 * 
 * This page allows admins to:
 * - View pending provider applications
 * - Approve or reject providers
 * - See provider statistics
 */

import React, { useState, useEffect } from 'react';
import { getPendingProviders, approveProvider, rejectProvider, getProviderStats } from '../services/admin';
import type { Provider } from '../services/supabase';

type Status = 'loading' | 'success' | 'error';

const AdminProviders: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch providers and stats on mount
  useEffect(() => {
    loadData();
  }, []);

  // Auto-hide notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [providersData, statsData] = await Promise.all([
        filter === 'pending' ? getPendingProviders() : getAllProvidersList(),
        getProviderStats()
      ]);
      setProviders(providersData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      setNotification({ type: 'error', message: 'Failed to load providers' });
    } finally {
      setLoading(false);
    }
  };

  const getAllProvidersList = async (): Promise<Provider[]> => {
    // For now, return pending + some approved mock data
    const pending = await getPendingProviders();
    return [
      ...pending,
      ...pending.map((p, i) => ({
        ...p,
        id: `approved_${i}`,
        status: 'approved' as const,
        name: `Approved Provider ${i + 1}`
      }))
    ];
  };

  const handleApprove = async (providerId: string) => {
    setActionLoading(providerId);
    try {
      const success = await approveProvider(providerId);
      if (success) {
        setNotification({ type: 'success', message: 'Provider approved successfully!' });
        // Refresh the list
        setProviders(prev => prev.filter(p => p.id !== providerId));
        setStats(prev => ({ ...prev, pending: prev.pending - 1, approved: prev.approved + 1 }));
      } else {
        setNotification({ type: 'error', message: 'Failed to approve provider' });
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Error approving provider' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (providerId: string) => {
    if (!confirm('Are you sure you want to reject this provider?')) return;
    
    setActionLoading(providerId);
    try {
      const success = await rejectProvider(providerId);
      if (success) {
        setNotification({ type: 'success', message: 'Provider rejected' });
        setProviders(prev => prev.filter(p => p.id !== providerId));
        setStats(prev => ({ ...prev, pending: prev.pending - 1, rejected: prev.rejected + 1 }));
      } else {
        setNotification({ type: 'error', message: 'Failed to reject provider' });
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Error rejecting provider' });
    } finally {
      setActionLoading(null);
    }
  };

  // Filter providers based on search and status
  const filteredProviders = providers.filter(p => {
    const matchesStatus = filter === 'all' || p.status === filter;
    const matchesSearch = !searchQuery || 
      p.service_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-8 right-8 px-6 py-4 rounded-2xl shadow-2xl z-50 animate-slideIn ${
          notification.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'
        } text-white font-bold`}>
          {notification.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-[#0A2540] italic tracking-tighter">
            Provider <span className="text-blue-500">Management</span>
          </h1>
          <p className="text-slate-500 mt-2">Review and approve service provider applications</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Pending Review', value: stats.pending, icon: '⏳', color: 'yellow' },
            { label: 'Approved', value: stats.approved, icon: '✓', color: 'green' },
            { label: 'Rejected', value: stats.rejected, icon: '✕', color: 'red' },
            { label: 'Total', value: stats.total, icon: '📊', color: 'blue' }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">{stat.icon}</span>
                <span className={`w-3 h-3 rounded-full bg-${stat.color}-500 animate-pulse`}></span>
              </div>
              <p className="text-3xl font-black text-[#0A2540] italic">{stat.value}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 mb-8">
          <div className="flex gap-4 flex-wrap">
            {/* Search */}
            <div className="flex-1 min-w-[300px]">
              <input
                type="text"
                placeholder="Search by service, city, or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold outline-none focus:border-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              {(['pending', 'approved', 'rejected', 'all'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-6 py-4 rounded-2xl font-bold uppercase text-xs tracking-widest transition-all ${
                    filter === status 
                      ? 'bg-[#0A2540] text-white' 
                      : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Provider List */}
        {loading ? (
          <div className="text-center py-20">
            <div className="text-6xl animate-pulse">📋</div>
            <p className="text-slate-400 mt-4 font-bold uppercase tracking-widest">Loading providers...</p>
          </div>
        ) : filteredProviders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[3rem] border border-slate-100">
            <div className="text-6xl">📭</div>
            <h3 className="text-2xl font-black text-[#0A2540] mt-4 italic">No Providers Found</h3>
            <p className="text-slate-400 mt-2">No providers match your current filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProviders.map((provider) => (
              <div 
                key={provider.id}
                className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all"
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-6">
                    {/* Avatar */}
                    <div className="w-16 h-16 bg-[#0A2540] rounded-[1.5rem] flex items-center justify-center text-2xl text-white font-black italic">
                      {provider.name?.[0] || provider.service_type?.[0] || 'P'}
                    </div>

                    {/* Info */}
                    <div>
                      <h3 className="text-xl font-black text-[#0A2540] uppercase italic">
                        {provider.name || 'Unnamed Provider'}
                      </h3>
                      <div className="flex gap-4 mt-2 text-sm">
                        <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold">
                          {provider.service_type}
                        </span>
                        <span className="bg-slate-50 text-slate-500 px-3 py-1 rounded-full font-bold">
                          📍 {provider.city}
                        </span>
                        <span className="bg-slate-50 text-slate-500 px-3 py-1 rounded-full font-bold">
                          💼 {provider.experience} years exp.
                        </span>
                      </div>
                      
                      {provider.description && (
                        <p className="text-slate-400 mt-3 text-sm max-w-2xl">
                          {provider.description}
                        </p>
                      )}

                      <div className="flex gap-4 mt-3 text-xs text-slate-300 font-mono">
                        <span>ID: {provider.id.slice(0, 8)}...</span>
                        <span>Joined: {new Date(provider.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex flex-col items-end gap-3">
                    <span className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest ${
                      provider.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      provider.status === 'approved' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {provider.status}
                    </span>

                    {provider.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(provider.id)}
                          disabled={actionLoading === provider.id}
                          className="px-6 py-3 bg-emerald-500 text-white rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-emerald-600 transition-all disabled:opacity-50"
                        >
                          {actionLoading === provider.id ? 'Processing...' : '✓ Approve'}
                        </button>
                        <button
                          onClick={() => handleReject(provider.id)}
                          disabled={actionLoading === provider.id}
                          className="px-6 py-3 bg-rose-500 text-white rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-rose-600 transition-all disabled:opacity-50"
                        >
                          ✕ Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProviders;

