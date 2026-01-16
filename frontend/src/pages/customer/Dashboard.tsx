import { Card } from '../../components/ui';
import { Calendar, Wallet, MessageSquare, CheckCircle } from 'lucide-react';

export const CustomerDashboard = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Bookings Card */}
      <Card
        title="Total Bookings"
        description="Your booking history"
        icon={<Calendar className="text-blue-600" />}
        action={<span className="text-blue-600 font-medium">View All</span>}
      >
        <div className="mt-4">
          <p className="text-4xl font-bold text-gray-900">24</p>
          <p className="text-sm text-green-600 mt-1">
            <CheckCircle className="inline w-4 h-4 mr-1" />
            3 Pending
          </p>
        </div>
      </Card>

      {/* Wallet Card */}
      <Card
        title="Wallet Balance"
        description="Available credits"
        icon={<Wallet className="text-purple-600" />}
        action={<span className="text-purple-600 font-medium">Add Credits</span>}
      >
        <div className="mt-4">
          <p className="text-4xl font-bold text-gray-900">₹1,250</p>
          <p className="text-sm text-gray-500 mt-1">Last transaction: 2 days ago</p>
        </div>
      </Card>

      {/* Messages Card */}
      <Card
        title="New Messages"
        description="Unread notifications"
        icon={<MessageSquare className="text-orange-600" />}
        action={<span className="text-orange-600 font-medium">View All</span>}
      >
        <div className="mt-4">
          <p className="text-4xl font-bold text-gray-900">5</p>
          <p className="text-sm text-orange-600 mt-1">2 New Today</p>
        </div>
      </Card>

      {/* Upcoming Bookings Card */}
      <Card
        title="Upcoming Bookings"
        description="Next scheduled service"
        icon={<Calendar className="text-green-600" />}
        action={<span className="text-green-600 font-medium">View Details</span>}
      >
        <div className="mt-4">
          <p className="text-2xl font-bold text-gray-900">Tomorrow</p>
          <p className="text-sm text-gray-600 mt-1">
            10:00 AM - Home Cleaning
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Provider: Mrs. Sharma (⭐ 4.8)
          </p>
        </div>
      </Card>
    </div>
  );
};
