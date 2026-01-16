import React from 'react';

const ProviderDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="text-6xl mb-4">👨‍🔧</div>
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Provider Dashboard</h1>
        <p className="text-slate-600 mb-8">Your professional service management center</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: '📅', title: 'Manage Bookings', desc: 'View and manage all your service bookings' },
            { icon: '💰', title: 'Track Earnings', desc: 'Monitor your income and payouts' },
            { icon: '⭐', title: 'Customer Reviews', desc: 'See what customers say about you' },
            { icon: '📅', title: 'Set Availability', desc: 'Update your working hours and schedule' },
            { icon: '👤', title: 'Profile Settings', desc: 'Update your profile and services' },
            { icon: '💬', title: 'Messages', desc: 'Chat with customers and support' },
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-slate-200 hover:border-purple-300 cursor-pointer">
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

export default ProviderDashboard;
