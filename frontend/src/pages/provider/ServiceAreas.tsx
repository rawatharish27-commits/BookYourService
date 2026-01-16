/**
 * PROVIDER SERVICE AREAS PAGE
 * Route: /provider/service-areas
 * DB: provider_areas table
 * UI: Map + radius settings
 * 
 * Security: RLS ensures provider only updates their own areas
 */

import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase-production';

type ServiceArea = {
  id: string;
  area_name: string;
  city: string;
  radius_km: number;
  is_active: boolean;
  created_at: string;
};

export default function ProviderServiceAreas() {
  const [areas, setAreas] = useState<ServiceArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newArea, setNewArea] = useState({
    area_name: '',
    city: '',
    radius_km: 5
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAreas();
  }, []);

  const loadAreas = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('provider_areas')
      .select('*')
      .eq('provider_id', user.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading areas:', error);
    }

    setAreas(data as ServiceArea[] || []);
    setLoading(false);
  };

  const handleAddArea = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { data: user } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('provider_areas')
      .insert({
        provider_id: user.user.id,
        ...newArea,
        is_active: true
      });

    if (!error) {
      setShowAddModal(false);
      setNewArea({ area_name: '', city: '', radius_km: 5 });
      loadAreas();
    } else {
      alert('Failed to add service area');
    }

    setSubmitting(false);
  };

  const handleToggleArea = async (id: string) => {
    const { error } = await supabase
      .from('provider_areas')
      .update({ is_active: false })
      .eq('id', id);

    if (!error) {
      loadAreas();
    }
  };

  const handleDeleteArea = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service area?')) return;

    const { error } = await supabase
      .from('provider_areas')
      .delete()
      .eq('id', id);

    if (!error) {
      loadAreas();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Service Areas</h1>
            <p className="text-gray-600">Define where you provide services</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Add New Area
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : areas.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg">
            <div className="text-6xl mb-4">🗺️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Service Areas Defined</h2>
            <p className="text-gray-600 mb-6">Add service areas to start receiving bookings</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              Add First Area
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {areas.map((area) => (
              <div key={area.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{area.area_name}</h3>
                    <p className="text-gray-600 text-sm">{area.city}</p>
                  </div>
                  <div className="flex gap-2">
                    {!area.is_active && (
                      <button
                        onClick={() => handleToggleArea(area.id)}
                        className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-medium"
                      >
                        Reactivate
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteArea(area.id)}
                      className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Service Radius</span>
                    <span className="text-lg font-semibold text-gray-900">{area.radius_km} km</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Status</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      area.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {area.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Added On</span>
                    <span className="text-sm text-gray-700">
                      {new Date(area.created_at).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Simulated Map */}
                <div className="bg-blue-50 rounded-lg p-4 h-40 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📍</div>
                    <p className="text-sm text-gray-600">Service area for {area.area_name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {area.city} + {area.radius_km}km radius
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Area Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Add Service Area</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddArea} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Area Name *
                </label>
                <input
                  type="text"
                  value={newArea.area_name}
                  onChange={(e) => setNewArea({ ...newArea, area_name: e.target.value })}
                  placeholder="e.g., Downtown Mumbai"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={newArea.city}
                  onChange={(e) => setNewArea({ ...newArea, city: e.target.value })}
                  placeholder="e.g., Mumbai"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Radius (km) *
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={newArea.radius_km}
                    onChange={(e) => setNewArea({ ...newArea, radius_km: parseInt(e.target.value) })}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-2xl font-bold text-blue-600 min-w-[60px] text-center">
                    {newArea.radius_km} km
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Bookings will be requested from customers within this radius
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !newArea.area_name || !newArea.city}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed font-semibold"
                >
                  {submitting ? 'Adding...' : 'Add Area'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
