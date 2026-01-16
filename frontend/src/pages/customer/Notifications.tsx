/**
 * Customer Notifications Page - View all notifications
 */
import React from 'react';

const CustomerNotifications: React.FC = () => {
  const notifications = [
    { id: 'N1', type: 'booking', message: 'Your booking #BK001 has been completed', time: '2 hours ago', read: false },
    { id: 'N2', type: 'offer', message: 'Get 20% off on AC servicing this week!', time: '1 day ago', read: false },
    { id: 'N3', type: 'review', message: 'Provider Rahul S. replied to your review', time: '2 days ago', read: true }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-[#0A2540] italic">Notifications</h1>
        <button className="text-xs font-bold text-blue-500 uppercase">Mark all read</button>
      </div>
      
      <div className="space-y-3">
        {notifications.map(notif => (
          <div key={notif.id} className={`p-4 rounded-2xl ${notif.read ? 'bg-white' : 'bg-blue-50'}`}>
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                notif.type === 'booking' ? 'bg-green-100 text-green-600' :
                notif.type === 'offer' ? 'bg-purple-100 text-purple-600' :
                'bg-yellow-100 text-yellow-600'
              }`}>
                {notif.type === 'booking' ? '✓' : notif.type === 'offer' ? '🎁' : '★'}
              </div>
              <div className="flex-1">
                <p className={`font-bold ${notif.read ? 'text-slate-600' : 'text-[#0A2540]'}`}>{notif.message}</p>
                <p className="text-xs text-slate-400 mt-1">{notif.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerNotifications;

