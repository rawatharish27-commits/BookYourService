import React, { useEffect, useState } from 'react';
import { Service, Role } from '../../types';
import { getServices, approveService, rejectService } from '../../services/mockApi';
import { Check, X, AlertTriangle } from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge';

export const AdminDashboard: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    const data = await getServices(Role.ADMIN);
    // Sort by unapproved first
    data.sort((a, b) => (a.isApproved === b.isApproved ? 0 : a.isApproved ? 1 : -1));
    setServices(data);
    setLoading(false);
  };

  const handleApprove = async (id: string) => {
    if(window.confirm('Approve this service? It will become visible to clients.')) {
        await approveService(id);
        fetchServices();
    }
  };

  const handleReject = async (id: string) => {
      if(window.confirm('Reject and delete this service?')) {
        await rejectService(id);
        fetchServices();
      }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Control Panel</h2>
      <p className="text-gray-500 mb-8">System Rule 5 Enforcement: Review and approve new services.</p>

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-gray-700">Pending Approvals & Service Oversight</span>
          </div>
          
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approval Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {services.map(service => (
                <tr key={service.id} className={!service.isApproved ? "bg-yellow-50" : ""}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{service.title}</div>
                    <div className="text-xs text-gray-500">{service.categoryName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {service.providerName}
                    <div className="text-xs text-gray-400">{service.providerId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${service.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                     <StatusBadge status={service.isApproved ? 'APPROVED' : 'PENDING_APPROVAL'} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {!service.isApproved && (
                      <div className="flex justify-end gap-2">
                        <button 
                            onClick={() => handleApprove(service.id)}
                            className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 rounded-md flex items-center gap-1 transition-colors"
                        >
                          <Check className="w-4 h-4" /> Approve
                        </button>
                        <button 
                            onClick={() => handleReject(service.id)}
                            className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded-md flex items-center gap-1 transition-colors"
                        >
                          <X className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    )}
                    {service.isApproved && (
                        <span className="text-gray-400 text-xs italic">No actions needed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};