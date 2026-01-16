import React, { useState, useEffect } from 'react';
import { db } from '../../services/DatabaseService';
import { WalletLedger } from '../../types';

const AdminFinancialReports: React.FC = () => {
  const [ledger, setLedger] = useState<WalletLedger[]>([]);
  const [filteredLedger, setFilteredLedger] = useState<WalletLedger[]>([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadData = () => {
      const ledgerData = db.getLedger();
      setLedger(ledgerData);
      setFilteredLedger(ledgerData);
    };

    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let filtered = ledger;

    // Date range filter
    if (dateRange.start && dateRange.end) {
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        return entryDate >= startDate && entryDate <= endDate;
      });
    }

    // Category filter
    if (categoryFilter !== 'ALL') {
      filtered = filtered.filter(entry => entry.category === categoryFilter);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (entry.bookingId && entry.bookingId.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredLedger(filtered);
  }, [ledger, dateRange, categoryFilter, searchTerm]);

  const calculateTotals = () => {
    const platformFees = filteredLedger.filter(l => l.category === 'PLATFORM_FEE').reduce((s, l) => s + l.amount, 0);
    const servicePayouts = filteredLedger.filter(l => l.category === 'SERVICE_PAYOUT').reduce((s, l) => s + l.amount, 0);
    const refunds = filteredLedger.filter(l => l.category === 'REFUND').reduce((s, l) => s + l.amount, 0);
    const penalties = filteredLedger.filter(l => l.category === 'PENALTY').reduce((s, l) => s + l.amount, 0);
    const withdrawals = filteredLedger.filter(l => l.category === 'WITHDRAWAL').reduce((s, l) => s + l.amount, 0);

    const totalRevenue = platformFees;
    const totalPayouts = servicePayouts + refunds + withdrawals;
    const netIncome = totalRevenue - totalPayouts - penalties;

    return { platformFees, servicePayouts, refunds, penalties, withdrawals, totalRevenue, totalPayouts, netIncome };
  };

  const totals = calculateTotals();

  const getMonthlyTrends = () => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const thisMonthRevenue = ledger.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= thisMonth && entry.category === 'PLATFORM_FEE';
    }).reduce((sum, entry) => sum + entry.amount, 0);

    const lastMonthRevenue = ledger.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= lastMonth && entryDate < thisMonth && entry.category === 'PLATFORM_FEE';
    }).reduce((sum, entry) => sum + entry.amount, 0);

    const growthRate = lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100) : 0;

    return { thisMonthRevenue, lastMonthRevenue, growthRate };
  };

  const trends = getMonthlyTrends();

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-6 rounded-lg border border-slate-200">
        <h3 className="text-lg font-semibold mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Categories</option>
              <option value="PLATFORM_FEE">Platform Fee</option>
              <option value="SERVICE_PAYOUT">Service Payout</option>
              <option value="REFUND">Refund</option>
              <option value="PENALTY">Penalty</option>
              <option value="WITHDRAWAL">Withdrawal</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search by User ID or Booking ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <h3 className="text-sm font-medium text-slate-600 mb-2">Total Revenue</h3>
          <p className="text-2xl font-bold text-green-600">₹{totals.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <h3 className="text-sm font-medium text-slate-600 mb-2">Total Payouts</h3>
          <p className="text-2xl font-bold text-red-600">₹{totals.totalPayouts.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <h3 className="text-sm font-medium text-slate-600 mb-2">Net Income</h3>
          <p className={`text-2xl font-bold ${totals.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ₹{totals.netIncome.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <h3 className="text-sm font-medium text-slate-600 mb-2">Transactions</h3>
          <p className="text-2xl font-bold text-blue-600">{filteredLedger.length}</p>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="bg-white p-6 rounded-lg border border-slate-200">
        <h3 className="text-lg font-semibold mb-4">Revenue Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="text-sm font-medium text-slate-600 mb-2">Platform Fees</h4>
            <p className="text-xl font-bold text-green-600">₹{totals.platformFees.toLocaleString()}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-slate-600 mb-2">Service Payouts</h4>
            <p className="text-xl font-bold text-red-600">₹{totals.servicePayouts.toLocaleString()}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-slate-600 mb-2">Refunds</h4>
            <p className="text-xl font-bold text-orange-600">₹{totals.refunds.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-white p-6 rounded-lg border border-slate-200">
        <h3 className="text-lg font-semibold mb-4">Monthly Trends</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="text-sm font-medium text-slate-600 mb-2">This Month</h4>
            <p className="text-xl font-bold text-blue-600">₹{trends.thisMonthRevenue.toLocaleString()}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-slate-600 mb-2">Last Month</h4>
            <p className="text-xl font-bold text-slate-600">₹{trends.lastMonthRevenue.toLocaleString()}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-slate-600 mb-2">Growth Rate</h4>
            <p className={`text-xl font-bold ${trends.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trends.growthRate >= 0 ? '+' : ''}{trends.growthRate.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white p-6 rounded-lg border border-slate-200">
        <h3 className="text-lg font-semibold mb-4">Transaction History ({filteredLedger.length} transactions)</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-bold text-slate-600 uppercase">Date</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-slate-600 uppercase">User ID</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-slate-600 uppercase">Type</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-slate-600 uppercase">Category</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-slate-600 uppercase">Amount</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-slate-600 uppercase">Booking ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredLedger.slice(0, 50).map((entry) => (
                <tr key={entry.id}>
                  <td className="px-4 py-2 text-sm">{new Date(entry.timestamp).toLocaleDateString()}</td>
                  <td className="px-4 py-2 text-sm font-mono text-xs">{entry.userId}</td>
                  <td className="px-4 py-2 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      entry.type === 'CREDIT' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {entry.type}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm">{entry.category.replace('_', ' ')}</td>
                  <td className={`px-4 py-2 text-sm font-bold ${
                    entry.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {entry.type === 'CREDIT' ? '+' : '-'}₹{entry.amount}
                  </td>
                  <td className="px-4 py-2 text-sm font-mono text-xs">{entry.bookingId || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredLedger.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              No transactions found matching the current filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminFinancialReports;