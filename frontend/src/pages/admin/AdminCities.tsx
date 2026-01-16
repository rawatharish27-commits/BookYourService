/**
 * ADMIN CITIES PAGE
 * Route: /admin/cities
 * DB: cities table
 * UI: Enable/disable cities + pricing overrides
 * 
 * Security: RLS ensures only admins can manage cities
 */

import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase-production';

type City = {
  id: string;
  name: string;
  state: string;
  country: string;
  is_active: boolean;
  min_booking_amount: number;
  platform_fee_percent: number;
  created_at: string;
  total_providers?: number;
  total_bookings?: number;
};

export default function AdminCities() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCity, setNewCity] = useState({
    name: '',
    state: '',
    country: 'India',
    min_booking_amount: 100,
    platform_fee_percent: 10
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCities();
  }, [filter]);

  const loadCities = async () => {
    setLoading(true);

    try {
      // Fetch cities with provider and booking counts
      let query = supabase
        .from('cities')
        .select(`
          *,
          providers:providers(id)(count),
          bookings:bookings(id)(count)
        `)
        .order('name', { ascending: true });

      if (filter === 'active') {
        query = query.eq('is_active', true);
      } else if (filter === 'inactive') {
        query = query.eq('is_active', false);
      }

      const { data: citiesData, error } = await query;

      if (error) {
        throw error;
      }

      // Transform data to include counts
      const citiesWithCounts = (citiesData || []).map((city: any) => ({
        ...city,
        total_providers: city.providers?.count || 0,
        total_bookings: city.bookings?.count || 0,
      }));

      setCities(citiesWithCounts);

    } catch (err: any) {
      console.error('Error loading cities:', err);
      alert('Failed to load cities');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCity = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('cities')
        .insert({
          ...newCity,
          is_active: true,
          created_at: new Date().toISOString(),
        });

      if (error) {
        throw error;
      }

      setShowAddModal(false);
      setNewCity({
        name: '',
        state: '',
        country: 'India',
        min_booking_amount: 100,
        platform_fee_percent: 10,
      });

      loadCities();
      alert('City added successfully');

    } catch (err: any) {
      console.error('Error adding city:', err);
      alert('Failed to add city');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleCity = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('cities')
        .update({ 
          is_active: !isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        throw error;
      }

      loadCities();
      alert(`City ${!isActive ? 'activated' : 'deactivated'} successfully`);

    } catch (err: any) {
      console.error('Error toggling city:', err);
      alert('Failed to update city status');
    }
  };

  const handleUpdatePricing = async (id: string, field: 'min_booking_amount' | 'platform_fee_percent', value: number) => {
    try {
      const { error } = await supabase
        .from('cities')
        .update({ 
          [field]: value,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        throw error;
      }

      loadCities();
      alert('Pricing updated successfully');

    } catch (err: any) {
      console.error('Error updating pricing:', err);
      alert('Failed to update pricing');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading cities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">City Operations</h1>
              <p className="text-gray-600 mt-1">Manage cities, enable/disable, and configure pricing</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Add New City
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2">
            {['all', 'active', 'inactive'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-6 py-3 font-medium transition-colors ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)} Cities
                {f === 'active' && (
                  <span className="ml-2 px-2 py-0.5 bg-blue-500 rounded-full text-xs">
                    {cities.filter(c => c.is_active).length}
                  </span>
                )}
                {f === 'inactive' && (
                  <span className="ml-2 px-2 py-0.5 bg-gray-500 rounded-full text-xs">
                    {cities.filter(c => !c.is_active).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cities Table */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {cities.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg">
            <div className="text-6xl mb-4">🏙️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Cities Found</h2>
            <p className="text-gray-600 mb-6">Add your first city to start operations</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Add First City
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">City</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">State</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Providers</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Bookings</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Min Amount</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Platform Fee</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cities.map((city) => (
                  <tr key={city.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-lg font-bold text-gray-900">{city.name}</div>
                      <div className="text-sm text-gray-500">{city.country}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{city.state}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-xl font-bold text-blue-600">{city.total_providers}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-xl font-bold text-purple-600">{city.total_bookings}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm text-gray-500 mb-1">Min</div>
                      <div className="text-lg font-bold text-gray-900">₹{city.min_booking_amount}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm text-gray-500 mb-1">Fee</div>
                      <div className="text-lg font-bold text-gray-900">{city.platform_fee_percent}%</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        city.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {city.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => {
                            const newMin = prompt('Enter new minimum booking amount:', city.min_booking_amount);
                            if (newMin) handleUpdatePricing(city.id, 'min_booking_amount', parseInt(newMin));
                          }}
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 text-sm font-medium"
                        >
                          Edit Min
                        </button>
                        <button
                          onClick={() => {
                            const newFee = prompt('Enter new platform fee percentage:', city.platform_fee_percent);
                            if (newFee) handleUpdatePricing(city.id, 'platform_fee_percent', parseFloat(newFee));
                          }}
                          className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded hover:bg-purple-100 text-sm font-medium"
                        >
                          Edit Fee
                        </button>
                        <button
                          onClick={() => handleToggleCity(city.id, city.is_active)}
                          className={`px-3 py-1.5 rounded text-sm font-medium ${
                            city.is_active
                              ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                              : 'bg-green-50 text-green-700 hover:bg-green-100'
                          }`}
                        >
                          {city.is_active ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add City Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Add New City</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddCity} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City Name *
                  </label>
                  <input
                    type="text"
                    value={newCity.name}
                    onChange={(e) => setNewCity({ ...newCity, name: e.target.value })}
                    placeholder="e.g., Mumbai"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    value={newCity.state}
                    onChange={(e) => setNewCity({ ...newCity, state: e.target.value })}
                    placeholder="e.g., Maharashtra"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country *
                </label>
                <input
                  type="text"
                  value={newCity.country}
                  onChange={(e) => setNewCity({ ...newCity, country: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Booking Amount (₹) *
                  </label>
                  <input
                    type="number"
                    min="50"
                    step="50"
                    value={newCity.min_booking_amount}
                    onChange={(e) => setNewCity({ ...newCity, min_booking_amount: parseInt(e.target.value) || 100 })}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum booking amount for this city
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Platform Fee (%) *
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="20"
                    step="1"
                    value={newCity.platform_fee_percent}
                    onChange={(e) => setNewCity({ ...newCity, platform_fee_percent: parseFloat(e.target.value) || 10 })}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Platform commission percentage (5-20%)
                  </p>
                </div>
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
                  disabled={submitting || !newCity.name || !newCity.state}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed font-semibold"
                >
                  {submitting ? 'Adding...' : 'Add City'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
