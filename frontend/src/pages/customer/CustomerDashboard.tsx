import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { API, buildUrl } from '../../config/api';

// ============================================
// ADVANCED CUSTOMER DASHBOARD
// ============================================
// Purpose: Complete customer dashboard with all features
// Stack: React + Framer Motion + API Integration
// Type: Production-Grade

interface Booking {
  id: string;
  service: string;
  provider: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  price: number;
}

const CustomerDashboard: React.FC = () => {
  const navigate = useNavigate();

  // UI State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'bookings' | 'wallet'>('dashboard');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    totalBookings: 0,
    completedServices: 0,
    totalSpent: 0,
    activeProviders: 0,
  });

  // Mock data (Replace with API calls)
  const [recentBookings, setRecentBookings] = useState<Booking[]>([
    {
      id: '1',
      service: 'Home Cleaning',
      provider: 'Raj Kumar',
      date: '2025-01-15',
      time: '10:00 AM',
      status: 'completed',
      price: 500,
    },
    {
      id: '2',
      service: 'AC Repair',
      provider: 'Priya Services',
      date: '2025-01-18',
      time: '2:00 PM',
      status: 'confirmed',
      price: 800,
    },
    {
      id: '3',
      service: 'Plumbing',
      provider: 'Amit Repairs',
      date: '2025-01-20',
      time: '11:00 AM',
      status: 'pending',
      price: 1200,
    },
  ]);

  useEffect(() => {
    // Load user data
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    navigate('/login', { replace: true });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'pending':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'bookings', label: 'My Bookings', icon: '📅' },
    { id: 'wallet', label: 'Wallet', icon: '💳' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full"
          />
        </div>
      ) : (
        <>
          {/* ============================================
               HEADER/NAVBAR
               ============================================ */}
          <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                {/* Logo */}
                <Link to="/c/dashboard" className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                    <span className="text-white text-xl font-bold">B</span>
                  </div>
                  <span className="text-xl font-bold text-slate-900">
                    BookYourService
                  </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-1">
                  {tabs.map((tab) => (
                    <motion.button
                      key={tab.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                        activeTab === tab.id
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-xl">{tab.icon}</span>
                      <span className="hidden sm:inline">{tab.label}</span>
                    </motion.button>
                  ))}
                </div>

                {/* User Menu */}
                <div className="flex items-center space-x-4">
                  <button className="relative p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <span className="text-2xl">🔔</span>
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                  </button>
                  <div className="flex items-center space-x-3">
                    <div className="hidden md:flex items-center space-x-2">
                      <span className="text-sm font-semibold text-slate-700">
                        {user?.fullName || 'User'}
                      </span>
                      <span className="text-xs text-slate-500">Customer</span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleLogout}
                      className="px-4 py-2 bg-slate-100 hover:bg-red-100 text-slate-700 hover:text-red-700 rounded-xl font-medium transition-all"
                    >
                      Logout
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          {/* ============================================
               MOBILE NAVIGATION
               ============================================ */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50">
            <div className="flex items-center justify-around py-2">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex flex-col items-center space-y-1 px-6 py-2 rounded-xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-2xl">{tab.icon}</span>
                  <span className="text-xs font-medium">{tab.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* ============================================
               MAIN CONTENT AREA
               ============================================ */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
            <AnimatePresence mode="wait">
              {/* ============================================
                   DASHBOARD TAB
                   ============================================ */}
              {activeTab === 'dashboard' && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  {/* Welcome Section */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-8 text-white shadow-xl"
                  >
                    <h1 className="text-3xl font-bold mb-2">
                      Welcome back, {user?.fullName?.split(' ')[0] || 'Customer'}! 👋
                    </h1>
                    <p className="text-blue-100">
                      Ready to book your next service?
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate('/services')}
                      className="mt-4 px-6 py-3 bg-white text-blue-700 rounded-xl font-bold hover:shadow-xl transition-all"
                    >
                      🚀 Book a Service Now
                    </motion.button>
                  </motion.div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { label: 'Total Bookings', value: stats.totalBookings, icon: '📅', color: 'from-blue-500 to-blue-600' },
                      { label: 'Completed Services', value: stats.completedServices, icon: '✅', color: 'from-green-500 to-green-600' },
                      { label: 'Total Spent', value: `₹${stats.totalSpent}`, icon: '💰', color: 'from-purple-500 to-purple-600' },
                      { label: 'Active Providers', value: stats.activeProviders, icon: '⭐', color: 'from-orange-500 to-orange-600' },
                    ].map((stat, index) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className={`bg-white rounded-2xl p-6 shadow-lg border-2 border-slate-200 hover:border-blue-300 transition-all cursor-pointer`}
                      >
                        <div className="text-4xl mb-2">{stat.icon}</div>
                        <div className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</div>
                        <div className="text-sm text-slate-600">{stat.label}</div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Recent Bookings */}
                  <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-6">
                      <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
                        <span className="mr-2">📅</span>
                        Recent Bookings
                      </h2>
                    </div>
                    <div className="divide-y divide-slate-200">
                      {recentBookings.slice(0, 5).map((booking) => (
                        <motion.div
                          key={booking.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="p-6 hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h3 className="font-bold text-slate-900 text-lg">{booking.service}</h3>
                              <p className="text-sm text-slate-600">{booking.provider}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                              {booking.status.toUpperCase()}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
                            <div>📅 {booking.date}</div>
                            <div>⏰ {booking.time}</div>
                          </div>
                          <div className="flex items-center justify-between pt-3">
                            <div className="text-xl font-bold text-slate-900">₹{booking.price}</div>
                            {booking.status === 'pending' && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold text-sm hover:bg-red-600 transition-all"
                              >
                                Cancel
                              </motion.button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    <div className="p-6 text-center">
                      <Link
                        to="/c/bookings"
                        className="text-blue-600 hover:text-blue-700 font-semibold transition-colors inline-flex items-center space-x-2"
                      >
                        View All Bookings <span>→</span>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ============================================
                   BOOKINGS TAB
                   ============================================ */}
              {activeTab === 'bookings' && (
                <motion.div
                  key="bookings"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-6">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center">
                      <span className="mr-2">📋</span>
                      All Bookings
                    </h2>
                    <p className="text-slate-600">View and manage all your service bookings</p>
                  </div>
                  <div className="divide-y divide-slate-200">
                    {recentBookings.map((booking) => (
                      <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-6 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-bold text-slate-900 text-xl mb-1">{booking.service}</h3>
                            <p className="text-slate-600">{booking.provider}</p>
                            <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 mt-2">
                              <div>📅 {booking.date}</div>
                              <div>⏰ {booking.time}</div>
                            </div>
                          </div>
                          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(booking.status)}`}>
                            {booking.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                          <div className="text-2xl font-bold text-slate-900">₹{booking.price}</div>
                          <div className="flex items-center space-x-2">
                            {booking.status === 'confirmed' && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-semibold text-sm hover:bg-yellow-600 transition-all"
                              >
                                Reschedule
                              </motion.button>
                            )}
                            {booking.status === 'pending' && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold text-sm hover:bg-red-600 transition-all"
                              >
                                Cancel
                              </motion.button>
                            )}
                            <Link
                              to={`/bookings/${booking.id}`}
                              className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ============================================
                   WALLET TAB
                   ============================================ */}
              {activeTab === 'wallet' && (
                <motion.div
                  key="wallet"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Wallet Balance Card */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl p-8 text-white shadow-xl"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-3xl font-bold mb-2">💳 Wallet Balance</h2>
                        <p className="text-purple-100">Available for booking services</p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl font-semibold transition-all"
                      >
                        + Add Money
                      </motion.button>
                    </div>
                    <div className="text-6xl font-black mb-2">₹5,450.00</div>
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <div className="text-purple-100 text-sm mb-1">This Month</div>
                        <div className="text-2xl font-bold">₹2,500</div>
                      </div>
                      <div>
                        <div className="text-purple-100 text-sm mb-1">Total Spent</div>
                        <div className="text-2xl font-bold">₹12,350</div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Recent Transactions */}
                  <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-6">
                      <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center">
                        <span className="mr-2">💰</span>
                        Recent Transactions
                      </h2>
                    </div>
                    <div className="divide-y divide-slate-200">
                      {[
                        { id: '1', type: 'credit', desc: 'Booking Refund', amount: '+500.00', date: '2025-01-15' },
                        { id: '2', type: 'debit', desc: 'Home Cleaning', amount: '-500.00', date: '2025-01-15' },
                        { id: '3', type: 'credit', desc: 'Wallet Top-up', amount: '+1000.00', date: '2025-01-10' },
                      ].map((txn) => (
                        <div key={txn.id} className="p-6 hover:bg-slate-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm text-slate-600">{txn.date}</div>
                              <div className="font-semibold text-slate-900">{txn.desc}</div>
                            </div>
                            <div className={`text-xl font-bold ${txn.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                              {txn.amount}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </>
      )}
    </div>
  );
};

export default CustomerDashboard;
