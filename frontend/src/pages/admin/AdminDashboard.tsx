import React from 'react';

const AdminDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="text-6xl mb-4">🛠️</div>
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Admin Dashboard</h1>
        <p className="text-slate-600 mb-8">Complete system control and management</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: '👥', title: 'User Management', desc: 'Manage customers and providers', color: 'from-blue-500 to-blue-600' },
            { icon: '📊', title: 'Dashboard Analytics', desc: 'View system statistics and metrics', color: 'from-green-500 to-green-600' },
            { icon: '📋', title: 'Booking Management', desc: 'View and manage all service bookings', color: 'from-purple-500 to-purple-600' },
            { icon: '⚙️', title: 'System Settings', desc: 'Configure platform settings', color: 'from-orange-500 to-orange-600' },
            { icon: '💰', title: 'Financial Reports', desc: 'Revenue and payment analytics', color: 'from-pink-500 to-pink-600' },
            { icon: '🚨', title: 'Fraud Detection', desc: 'Monitor suspicious activities', color: 'from-red-500 to-red-600' },
            { icon: '🔔', title: 'System Alerts', desc: 'View system notifications', color: 'from-yellow-500 to-yellow-600' },
          ].map((item) => (
            <div key={item.title} className={`bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-slate-200 hover:border-orange-300 cursor-pointer ${item.color}`}>
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
