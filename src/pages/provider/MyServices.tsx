import React, { useEffect, useState } from 'react';
import Seo from "../../components/seo/Seo";
import { getServices, updateServiceStatus } from '../../services/api';
import { Role, Service } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  Plus, Edit3, PauseCircle, PlayCircle, Trash2, 
  Search, Settings, Sparkles, AlertCircle 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StatusBadge } from '../../components/StatusBadge';

export default function MyServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) fetchServices();
  }, [user]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const data = await getServices(Role.PROVIDER);
      setServices(data || []);
    } catch (e) {
      showToast("Failed to load services", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (serviceId: string, currentActive: boolean) => {
    try {
      await updateServiceStatus(serviceId, !currentActive);
      showToast(`Service ${!currentActive ? 'activated' : 'paused'}`, "success");
      fetchServices();
    } catch (e) {
      showToast("Failed to update status", "error");
    }
  };

  return (
    <>
      <Seo title="My Services" description="Manage your service catalog and pricing" />

      <div className="max-w-6xl mx-auto py-12 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <Settings className="w-8 h-8 text-indigo-600" /> My <span className="text-indigo-600">Services</span>
            </h1>
            <p className="text-gray-500 font-medium mt-1">Control your offerings, pricing and availability.</p>
          </div>
          
          <button 
            onClick={() => navigate('/provider/create-service')}
            className="bg-gray-900 text-white px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-100"
          >
            <Plus className="w-5 h-5" /> Add New Service
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="text-gray-400 font-bold mt-4 animate-pulse">Syncing catalog...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] border border-dashed border-gray-200 p-20 text-center">
            <Sparkles className="w-16 h-16 text-gray-200 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-gray-400 mb-2">No services yet</h3>
            <p className="text-gray-500 max-w-xs mx-auto mb-8">Start your journey by adding your first professional service offer.</p>
            <button 
              onClick={() => navigate('/provider/create-service')}
              className="text-indigo-600 font-black uppercase text-xs tracking-[0.2em] hover:underline"
            >
              Create Service Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {services.map((service) => (
              <div key={service.id} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 transition-all hover:border-indigo-100 group">
                <div className="flex gap-6 items-start">
                  <div className="w-20 h-20 rounded-3xl overflow-hidden shadow-md shrink-0">
                    <img src={service.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={service.title} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="text-xl font-black text-gray-900">{service.title}</h3>
                      <StatusBadge status={service.isActive ? 'ACTIVE' : 'INACTIVE'} />
                    </div>
                    <p className="text-sm text-gray-500 font-medium mb-3 max-w-xl line-clamp-1">{service.description}</p>
                    <div className="flex flex-wrap gap-4">
                      <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">{service.categoryName}</span>
                      <span className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {service.zoneName}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between w-full lg:w-auto border-t lg:border-none pt-6 lg:pt-0 gap-4">
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Base Price</p>
                    <p className="text-3xl font-black text-gray-900">₹{service.price}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="p-3 bg-gray-50 text-gray-500 rounded-xl hover:bg-gray-100 hover:text-indigo-600 transition-colors" title="Edit Pricing">
                      <Edit3 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleToggleStatus(service.id, service.isActive)}
                      className={`p-3 rounded-xl transition-all ${service.isActive ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                      title={service.isActive ? 'Pause Service' : 'Activate Service'}
                    >
                      {service.isActive ? <PauseCircle className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
                    </button>
                    <button className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors" title="Delete Permanent">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
