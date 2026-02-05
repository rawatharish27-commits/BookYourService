import React, { useEffect, useState } from 'react';
import { Service, Role, BookingStatus } from '../../types';
import { getServices, createBooking } from '../../services/mockApi';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, DollarSign, Calendar } from 'lucide-react';

export const ClientDashboard: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    const data = await getServices(Role.CLIENT);
    setServices(data);
    setLoading(false);
  };

  const handleBook = async (service: Service) => {
    if (!user) return;
    const confirm = window.confirm(`Book ${service.title} for $${service.price}?`);
    if (confirm) {
      try {
        await createBooking({
            serviceId: service.id,
            clientId: user.id,
            providerId: service.providerId,
            price: service.price,
            date: new Date().toISOString().split('T')[0] // Simple date for now
        });
        alert('Booking Request Sent! View status in My Bookings.');
        navigate('/client/bookings');
      } catch (e) {
          alert('Booking failed: ' + (e as Error).message);
      }
    }
  };

  // Safe navigation of categoryName which might be missing in older mocks but enforced in new types
  const filteredServices = services.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.categoryName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-900">Available Services</h2>
           <p className="text-gray-500">Browse and book professionals for your needs.</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for cleaning, plumbing..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map(service => (
            <div key={service.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <img src={service.image} alt={service.title} className="w-full h-48 object-cover" />
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <span className="bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded font-medium uppercase tracking-wide">
                    {service.categoryName}
                  </span>
                  <span className="flex items-center text-gray-900 font-bold">
                    <DollarSign className="w-4 h-4" /> {service.price}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{service.title}</h3>
                <p className="text-sm text-gray-500 mb-4">{service.description}</p>
                
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
                   <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                      {(service.providerName || '?').charAt(0)}
                   </div>
                   <span>{service.providerName}</span>
                </div>

                <button
                  onClick={() => handleBook(service)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  Book Now
                </button>
              </div>
            </div>
          ))}
          
          {filteredServices.length === 0 && (
             <div className="col-span-full text-center py-12 text-gray-500">
               No services found matching your search.
             </div>
          )}
        </div>
      )}
    </div>
  );
};