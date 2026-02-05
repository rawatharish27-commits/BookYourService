import React, { useEffect, useState } from 'react';
import { Service, Role } from '../../types';
import { getServices, toggleServiceStatus } from '../../services/mockApi';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { PlusCircle, Edit2, Eye, EyeOff } from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge';

export const ProviderDashboard: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchServices();
  }, [user]);

  const fetchServices = async () => {
    if (!user) return;
    setLoading(true);
    const data = await getServices(Role.PROVIDER, user.id);
    setServices(data);
    setLoading(false);
  };

  const handleToggleStatus = async (service: Service) => {
      await toggleServiceStatus(service.id, service.isActive);
      fetchServices();
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Services</h2>
          <p className="text-gray-500">Manage your offerings and availability.</p>
        </div>
        <Link
          to="/provider/create-service"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium"
        >
          <PlusCircle className="w-5 h-5" />
          Create Service
        </Link>
      </div>

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin Approval</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {services.map(service => (
                <tr key={service.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img className="h-10 w-10 rounded-lg object-cover" src={service.image} alt="" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{service.title}</div>
                        <div className="text-sm text-gray-500">{service.categoryName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${service.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                     <StatusBadge status={service.isApproved ? 'APPROVED' : 'PENDING_APPROVAL'} />
                  </td>
                   <td className="px-6 py-4 whitespace-nowrap">
                     <StatusBadge status={service.isActive ? 'ACTIVE' : 'INACTIVE'} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                        onClick={() => handleToggleStatus(service)}
                        className={`text-gray-400 hover:text-gray-600 mx-2 ${service.isActive ? 'text-green-600 hover:text-green-800' : ''}`}
                        title={service.isActive ? "Deactivate" : "Activate"}
                    >
                        {service.isActive ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5"/>}
                    </button>
                    {/* Mock Edit */}
                    <button className="text-indigo-600 hover:text-indigo-900">
                        <Edit2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {services.length === 0 && (
              <div className="p-8 text-center text-gray-500">You haven't created any services yet.</div>
          )}
        </div>
      )}
    </div>
  );
};