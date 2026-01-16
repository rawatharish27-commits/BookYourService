import React, { useState, useEffect } from 'react';
import { db } from '../../services/DatabaseService';
import { UserRole, UserStatus, User } from '../../types';

const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>(db.getUsers());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<UserRole | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<UserStatus | 'ALL'>('ALL');

  useEffect(() => {
    const interval = setInterval(() => {
      setUsers(db.getUsers());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone.includes(searchTerm);
    const matchesRole = filterRole === 'ALL' || user.role === filterRole;
    const matchesStatus = filterStatus === 'ALL' || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleSuspendUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      user.status = UserStatus.SUSPENDED;
      db.upsertUser(user);
      setUsers(db.getUsers());
      alert('User suspended successfully');
    }
  };

  const handleActivateUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      user.status = UserStatus.ACTIVE;
      db.upsertUser(user);
      setUsers(db.getUsers());
      alert('User activated successfully');
    }
  };

  const userStats = {
    total: users.length,
    active: users.filter(u => u.status === UserStatus.ACTIVE).length,
    suspended: users.filter(u => u.status === UserStatus.SUSPENDED).length,
    pending: users.filter(u => u.status === UserStatus.PENDING || u.status === UserStatus.UNDER_REVIEW).length
  };

  return (
    <div className="p-8 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none mb-2">
          User <span className="text-blue-600">Management</span>
        </h1>
        <p className="text-sm text-slate-600">Complete user oversight and account management</p>
      </div>

      {/* User Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-slate-100 text-center">
          <div className="text-2xl font-bold text-slate-900">{userStats.total}</div>
          <div className="text-xs text-slate-600 uppercase tracking-wider">Total Users</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 text-center">
          <div className="text-2xl font-bold text-green-600">{userStats.active}</div>
          <div className="text-xs text-slate-600 uppercase tracking-wider">Active</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 text-center">
          <div className="text-2xl font-bold text-red-600">{userStats.suspended}</div>
          <div className="text-xs text-slate-600 uppercase tracking-wider">Suspended</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 text-center">
          <div className="text-2xl font-bold text-yellow-600">{userStats.pending}</div>
          <div className="text-xs text-slate-600 uppercase tracking-wider">Pending</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100">
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as UserRole | 'ALL')}
          >
            <option value="ALL">All Roles</option>
            <option value={UserRole.USER}>Customers</option>
            <option value={UserRole.PROVIDER}>Providers</option>
            <option value={UserRole.ADMIN}>Admins</option>
          </select>
          <select
            className="px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as UserStatus | 'ALL')}
          >
            <option value="ALL">All Status</option>
            <option value={UserStatus.ACTIVE}>Active</option>
            <option value={UserStatus.SUSPENDED}>Suspended</option>
            <option value={UserStatus.PENDING}>Pending</option>
            <option value={UserStatus.UNDER_REVIEW}>Under Review</option>
          </select>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Wallet</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-bold text-slate-900">{user.name}</div>
                      <div className="text-sm text-slate-500">{user.email || user.phone}</div>
                      <div className="text-xs text-slate-400">{user.city || 'N/A'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      user.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-800' :
                      user.role === UserRole.PROVIDER ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      user.status === UserStatus.ACTIVE ? 'bg-green-100 text-green-800' :
                      user.status === UserStatus.SUSPENDED ? 'bg-red-100 text-red-800' :
                      user.status === UserStatus.APPROVED ? 'bg-green-100 text-green-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                    ₹{user.walletBalance}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {user.status === UserStatus.SUSPENDED ? (
                        <button
                          onClick={() => handleActivateUser(user.id)}
                          className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Activate
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSuspendUser(user.id)}
                          className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Suspend
                        </button>
                      )}
                      <button className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors">
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">👥</div>
            <p className="text-slate-600">No users found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUserManagement;