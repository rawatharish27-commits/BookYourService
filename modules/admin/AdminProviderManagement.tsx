import React, { useState, useEffect } from 'react';
import { db } from '../../services/DatabaseService';
import { UserRole, UserStatus, User } from '../../types';
import { auth } from '../../services/AuthService';

const AdminProviderManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>(db.getUsers());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<UserStatus | 'ALL'>('ALL');

  useEffect(() => {
    const interval = setInterval(() => {
      setUsers(db.getUsers());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const providers = users.filter(u => u.role === UserRole.PROVIDER);
  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.phone.includes(searchTerm);
    const matchesStatus = filterStatus === 'ALL' || provider.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const providerStats = {
    total: providers.length,
    approved: providers.filter(p => p.status === UserStatus.APPROVED).length,
    pending: providers.filter(p => p.status === UserStatus.UNDER_REVIEW).length,
    suspended: providers.filter(p => p.status === UserStatus.SUSPENDED).length,
    probation: providers.filter(p => p.isProbation).length
  };

  const handleApproveProvider = async (userId: string) => {
    const result = await auth.approveProvider(userId);
    if (result.success) {
      setUsers(db.getUsers());
      alert('Provider approved successfully');
    } else {
      alert(result.message);
    }
  };

  const handleRejectProvider = (userId: string) => {
    const provider = providers.find(p => p.id === userId);
    if (provider) {
      provider.status = UserStatus.SUSPENDED;
      db.upsertUser(provider);
      setUsers(db.getUsers());
      alert('Provider rejected and suspended');
    }
  };

  const handleSuspendProvider = (userId: string) => {
    const provider = providers.find(p => p.id === userId);
    if (provider) {
      provider.status = UserStatus.SUSPENDED;
      db.upsertUser(provider);
      setUsers(db.getUsers());
      alert('Provider suspended');
    }
  };

  const handleActivateProvider = (userId: string) => {
    const provider = providers.find(p => p.id === userId);
    if (provider) {
      provider.status = UserStatus.APPROVED;
      db.upsertUser(provider);
      setUsers(db.getUsers());
      alert('Provider activated');
    }
  };

  const handleToggleProbation = (userId: string) => {
    const provider = providers.find(p => p.id === userId);
    if (provider) {
      provider.isProbation = !provider.isProbation;
      db.upsertUser(provider);
      setUsers(db.getUsers());
      alert(`Provider ${provider.isProbation ? 'placed on' : 'removed from'} probation`);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none mb-2">
          Provider <span className="text-blue-600">Management</span>
        </h1>
        <p className="text-sm text-slate-600">Partner oversight, quality control, and approval management</p>
      </div>

      {/* Provider Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-slate-100 text-center">
          <div className="text-2xl font-bold text-slate-900">{providerStats.total}</div>
          <div className="text-xs text-slate-600 uppercase tracking-wider">Total</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 text-center">
          <div className="text-2xl font-bold text-green-600">{providerStats.approved}</div>
          <div className="text-xs text-slate-600 uppercase tracking-wider">Approved</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 text-center">
          <div className="text-2xl font-bold text-yellow-600">{providerStats.pending}</div>
          <div className="text-xs text-slate-600 uppercase tracking-wider">Pending</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 text-center">
          <div className="text-2xl font-bold text-red-600">{providerStats.suspended}</div>
          <div className="text-xs text-slate-600 uppercase tracking-wider">Suspended</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 text-center">
          <div className="text-2xl font-bold text-orange-600">{providerStats.probation}</div>
          <div className="text-xs text-slate-600 uppercase tracking-wider">On Probation</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Search providers by name, email, or phone..."
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as UserStatus | 'ALL')}
          >
            <option value="ALL">All Status</option>
            <option value={UserStatus.APPROVED}>Approved</option>
            <option value={UserStatus.UNDER_REVIEW}>Under Review</option>
            <option value={UserStatus.SUSPENDED}>Suspended</option>
          </select>
        </div>
      </div>

      {/* Provider Management Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Approvals */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <span className="mr-2">⏳</span> Pending Approvals ({providerStats.pending})
          </h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {filteredProviders.filter(p => p.status === UserStatus.UNDER_REVIEW).map(provider => (
              <div key={provider.id} className="p-4 border border-yellow-200 bg-yellow-50 rounded-xl">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">{provider.name}</p>
                    <p className="text-sm text-slate-600">{provider.email || provider.phone}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Quality Score: <span className="font-semibold">{provider.qualityScore}/100</span> |
                      City: {provider.city || 'N/A'}
                    </p>
                    <p className="text-xs text-slate-500">
                      Documents: {provider.kycDetails?.documentsUploaded ? '✅ Uploaded' : '❌ Pending'}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleApproveProvider(provider.id)}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-bold hover:bg-green-700 transition-colors"
                  >
                    ✅ Approve
                  </button>
                  <button
                    onClick={() => handleRejectProvider(provider.id)}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg text-sm font-bold hover:bg-red-700 transition-colors"
                  >
                    ❌ Reject
                  </button>
                </div>
              </div>
            ))}
            {filteredProviders.filter(p => p.status === UserStatus.UNDER_REVIEW).length === 0 && (
              <div className="text-center py-8">
                <div className="text-3xl mb-2">✅</div>
                <p className="text-slate-600">No pending approvals</p>
              </div>
            )}
          </div>
        </div>

        {/* Active Providers */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <span className="mr-2">🛡️</span> Active Providers ({providerStats.approved})
          </h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {filteredProviders.filter(p => p.status === UserStatus.APPROVED).map(provider => (
              <div key={provider.id} className="p-4 border border-green-200 bg-green-50 rounded-xl">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">{provider.name}</p>
                    <p className="text-sm text-slate-600">{provider.email || provider.phone}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Jobs: <span className="font-semibold">{provider.jobCount || 0}</span> |
                      Rating: <span className="font-semibold">{provider.qualityScore}/100</span>
                    </p>
                    <p className="text-xs text-slate-500">
                      Status: {provider.isProbation ? '⚠️ On Probation' : '✅ Active'}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleToggleProbation(provider.id)}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-colors ${
                      provider.isProbation
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-orange-600 text-white hover:bg-orange-700'
                    }`}
                  >
                    {provider.isProbation ? 'Remove Probation' : 'Put on Probation'}
                  </button>
                  <button
                    onClick={() => handleSuspendProvider(provider.id)}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg text-sm font-bold hover:bg-red-700 transition-colors"
                  >
                    Suspend
                  </button>
                </div>
              </div>
            ))}
            {filteredProviders.filter(p => p.status === UserStatus.APPROVED).length === 0 && (
              <div className="text-center py-8">
                <div className="text-3xl mb-2">🛡️</div>
                <p className="text-slate-600">No active providers</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Suspended Providers */}
      {providerStats.suspended > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <span className="mr-2">🚫</span> Suspended Providers ({providerStats.suspended})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProviders.filter(p => p.status === UserStatus.SUSPENDED).map(provider => (
              <div key={provider.id} className="p-4 border border-red-200 bg-red-50 rounded-xl">
                <div className="text-center">
                  <p className="font-bold text-slate-900">{provider.name}</p>
                  <p className="text-sm text-slate-600 mb-3">{provider.email || provider.phone}</p>
                  <button
                    onClick={() => handleActivateProvider(provider.id)}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-bold hover:bg-green-700 transition-colors"
                  >
                    Reactivate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProviderManagement;