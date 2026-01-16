import { Card } from '../../components/ui';
import { DollarSign, Briefcase, Star, Clock } from 'lucide-react';

export const ProviderDashboard = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Earnings Card */}
      <Card
        title="Total Earnings"
        description="This month's income"
        icon={<DollarSign className="text-green-600" />}
        action={<span className="text-green-600 font-medium">View Details</span>}
      >
        <div className="mt-4">
          <p className="text-4xl font-bold text-gray-900">₹45,250</p>
          <p className="text-sm text-gray-600 mt-1">
            <span className="text-green-600">+12% from last month</span>
          </p>
        </div>
      </Card>

      {/* Requests Card */}
      <Card
        title="New Requests"
        description="Pending bookings"
        icon={<Briefcase className="text-purple-600" />}
        action={<span className="text-purple-600 font-medium">Review</span>}
      >
        <div className="mt-4">
          <p className="text-4xl font-bold text-gray-900">12</p>
          <p className="text-sm text-gray-600 mt-1">
            8 new today
          </p>
        </div>
      </Card>

      {/* Jobs Card */}
      <Card
        title="Active Jobs"
        description="Currently in progress"
        icon={<Clock className="text-orange-600" />}
        action={<span className="text-orange-600 font-medium">Manage</span>}
      >
        <div className="mt-4">
          <p className="text-4xl font-bold text-gray-900">3</p>
          <p className="text-sm text-gray-600 mt-1">
            2 ending today
          </p>
        </div>
      </Card>

      {/* Reviews Card */}
      <Card
        title="My Rating"
        description="Average score"
        icon={<Star className="text-yellow-600" />}
        action={<span className="text-yellow-600 font-medium">View Reviews</span>}
      >
        <div className="mt-4">
          <p className="text-4xl font-bold text-gray-900">4.8</p>
          <p className="text-sm text-gray-600 mt-1">
            Based on 128 reviews
          </p>
        </div>
      </Card>
    </div>
  );
};
