import { Card } from '../../components/ui';
import { Users, Briefcase, DollarSign, Star, AlertCircle, Clock } from 'lucide-react';

export const AdminDashboard = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Users Card */}
      <Card
        title="Total Users"
        description="All registered customers & providers"
        icon={<Users className="text-indigo-600" />}
        action={<span className="text-indigo-600 font-medium">View All</span>}
      >
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-4xl font-bold text-gray-900">12,456</p>
            <p className="text-sm text-green-600">
              <span className="font-medium">+234</span> today
            </p>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 rounded-full" style={{ width: '70%' }}></div>
          </div>
        </div>
      </Card>

      {/* Providers Card */}
      <Card
        title="Active Providers"
        description="Verified service professionals"
        icon={<Briefcase className="text-purple-600" />}
        action={<span className="text-purple-600 font-medium">Manage</span>}
      >
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-4xl font-bold text-gray-900">1,892</p>
            <p className="text-sm text-purple-600">
              <span className="font-medium">45</span> pending approval
            </p>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-purple-600 rounded-full" style={{ width: '85%' }}></div>
          </div>
        </div>
      </Card>

      {/* Bookings Card */}
      <Card
        title="Total Bookings"
        description="Completed and pending services"
        icon={<Clock className="text-blue-600" />}
        action={<span className="text-blue-600 font-medium">View All</span>}
      >
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-4xl font-bold text-gray-900">45,891</p>
            <p className="text-sm text-blue-600">
              <span className="font-medium">892</span> pending
            </p>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full" style={{ width: '95%' }}></div>
          </div>
        </div>
      </Card>

      {/* Revenue Card */}
      <Card
        title="Total Revenue"
        description="Gross income this month"
        icon={<DollarSign className="text-green-600" />}
        action={<span className="text-green-600 font-medium">View Report</span>}
      >
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-4xl font-bold text-gray-900">₹23,45,670</p>
            <p className="text-sm text-green-600">
              <span className="font-medium">+18%</span> from last month
            </p>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-green-600 rounded-full" style={{ width: '88%' }}></div>
          </div>
        </div>
      </Card>

      {/* Recent Users */}
      <div className="col-span-1 md:col-span-2 lg:col-span-2 border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent User Signups</h3>
        <div className="space-y-3">
          {[
            { name: 'Alice Johnson', email: 'alice@email.com', role: 'Customer', date: '2 hours ago', status: 'Active' },
            { name: 'Bob Wilson', email: 'bob@provider.com', role: 'Provider', date: '5 hours ago', status: 'Pending' },
            { name: 'Charlie Brown', email: 'charlie@provider.com', role: 'Provider', date: '1 day ago', status: 'Active' },
            { name: 'David Lee', email: 'david@email.com', role: 'Customer', date: '2 days ago', status: 'Suspended' },
          ].map((user, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
                <p className="text-xs text-gray-400 mt-1">{user.date}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`
                  px-2 py-1 rounded-full text-xs font-medium
                  ${user.status === 'Active' ? 'bg-green-100 text-green-800' : ''}
                  ${user.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                  ${user.status === 'Suspended' ? 'bg-red-100 text-red-800' : ''}
                `}>
                  {user.status}
                </span>
                <span className="text-xs text-gray-500">{user.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Status */}
      <div className="col-span-1 md:col-span-2 lg:col-span-2 border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <Star className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Uptime</p>
              <p className="text-sm text-gray-500">99.95% this month</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Error Rate</p>
              <p className="text-sm text-gray-500">0.02% (below SLA)</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Star className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Response Time</p>
              <p className="text-sm text-gray-500">256ms average</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Database Load</p>
              <p className="text-sm text-gray-500">45% (stable)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
