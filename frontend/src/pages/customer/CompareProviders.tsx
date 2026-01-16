/**
 * Compare Providers Page (Production-Grade)
 * 
 * Customers can compare multiple providers side-by-side
 * before making a booking decision.
 * 
 * Features:
 * - Compare providers by price, rating, response time
 * - View provider details, reviews, portfolio
 * - Select preferred provider
 * - Book directly from comparison
 * 
 * Database:
 * - providers table
 * - reviews table
 * - bookings table
 */

import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase-production';
import type { Database } from '../../services/supabase-production';
import { useNavigate, useSearchParams } from 'react-router-dom';

type ProviderWithStats = Database['public']['Tables']['providers']['Row'] & {
  total_bookings?: number;
  completed_bookings?: number;
  avg_rating?: number;
  total_reviews?: number;
};

interface ComparisonItem {
  provider: ProviderWithStats;
  price: number;
  availability: string;
  responseTime: string;
  isSelected: boolean;
}

export default function CompareProviders() {
  const navigate = useNavigate();
  const searchParams = useSearchParams();
  const serviceId = searchParams.get('service');
  const category = searchParams.get('category');

  const [providers, setProviders] = useState<ProviderWithStats[]>([]);
  const [comparison, setComparison] = useState<ComparisonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load providers for comparison
  useEffect(() => {
    loadProviders();
  }, [serviceId, category]);

  // Prepare comparison data
  useEffect(() => {
    if (providers.length > 0) {
      prepareComparison();
    }
  }, [providers]);

  const loadProviders = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch providers for given category/service
      let query = supabase
        .from('providers')
        .select(`
          id,
          status,
          experience,
          hourly_rate,
          city,
          description,
          rating,
          total_jobs,
          is_online
        `)
        .eq('status', 'approved')
        .eq('is_online', true);

      // Filter by city (if available from user location)
      // This would require getting user's city from their profile

      if (category) {
        query = query.eq('city', category); // Using city as category filter
      }

      const { data: providersData, error: providersError } = await query;

      if (providersError) {
        throw providersError;
      }

      // Fetch statistics for each provider
      const providersWithStats = await Promise.all(
        (providersData || []).map(async (provider: any) => {
          // Get booking statistics
          const { data: bookingsData } = await supabase
            .from('bookings')
            .select('status')
            .eq('provider_id', provider.id);

          const totalBookings = bookingsData?.length || 0;
          const completedBookings = bookingsData?.filter(b => b.status === 'completed').length || 0;

          // Get reviews
          const { data: reviewsData } = await supabase
            .from('reviews')
            .select('rating')
            .eq('provider_id', provider.id);

          const totalReviews = reviewsData?.length || 0;
          const avgRating = totalReviews > 0
            ? reviewsData.reduce((sum: number, r: any) => sum + r.rating, 0) / totalReviews
            : 0;

          return {
            ...provider,
            total_bookings: totalBookings,
            completed_bookings: completedBookings,
            avg_rating: avgRating,
            total_reviews: totalReviews,
          };
        })
      );

      setProviders(providersWithStats);

    } catch (err: any) {
      console.error('Error loading providers:', err);
      setError('Failed to load providers for comparison');
    } finally {
      setLoading(false);
    }
  };

  const prepareComparison = () => {
    // Prepare comparison data with pricing and availability
    const comparisonData: ComparisonItem[] = providers.map((provider: any) => ({
      provider,
      price: provider.hourly_rate || 0,
      availability: provider.is_online ? 'Available Now' : 'Busy',
      responseTime: '< 5 min', // This could be calculated from bookings
      isSelected: false,
    }));

    setComparison(comparisonData);
  };

  const toggleProviderSelection = (providerId: string) => {
    setComparison(prev => 
      prev.map(item => ({
        ...item,
        isSelected: item.provider.id === providerId ? !item.isSelected : item.isSelected
      }))
    );
  };

  const bookWithProvider = (providerId: string) => {
    // Navigate to booking page with selected provider
    if (serviceId) {
      navigate(`/customer/book?service=${serviceId}&provider=${providerId}`);
    } else if (category) {
      navigate(`/customer/services?category=${category}&provider=${providerId}`);
    }
  };

  const removeFromComparison = (providerId: string) => {
    setComparison(prev => prev.filter(item => item.provider.id !== providerId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading providers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-red-50 rounded-lg">
          <h2 className="text-xl font-bold text-red-800 mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
          <button onClick={() => navigate(-1)} className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Compare Providers</h1>
              <p className="text-gray-600 mt-1">
                Compare providers side-by-side to make the best choice
              </p>
            </div>
            <button
              onClick={() => navigate('/customer/services')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Browse More Providers
            </button>
          </div>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {comparison.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Providers to Compare</h2>
            <p className="text-gray-600 mb-6">
              Select providers from services page to compare them
            </p>
            <button
              onClick={() => navigate('/customer/services')}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Browse Services
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Comparison Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 bg-gray-50 border-b border-gray-200">
                <div className="p-4 font-semibold text-gray-900 border-r border-gray-200">
                  Provider
                </div>
                <div className="p-4 font-semibold text-gray-900 border-r border-gray-200 text-right">
                  Price/Hour
                </div>
                <div className="p-4 font-semibold text-gray-900 border-r border-gray-200 text-center">
                  Rating
                </div>
                <div className="p-4 font-semibold text-gray-900 text-center">
                  Reviews
                </div>
              </div>

              {/* Provider Cards */}
              {comparison.map((item, index) => (
                <div
                  key={item.provider.id}
                  className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 border-b border-gray-200 ${
                    index === 0 ? '' : 'border-t'
                  }`}
                >
                  {/* Provider Card */}
                  <div className={`p-4 border-r border-gray-200 ${item.isSelected ? 'bg-blue-50' : ''}`}>
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <input
                            type="checkbox"
                            checked={item.isSelected}
                            onChange={() => toggleProviderSelection(item.provider.id)}
                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <h3 className="text-lg font-bold text-gray-900">
                            Provider {item.provider.id.slice(0, 8)}
                          </h3>
                          {item.provider.is_online && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Online
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {item.provider.description || 'Professional service provider'}
                        </p>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500">Experience:</span>
                            <span className="font-medium text-gray-900">{item.provider.experience} years</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500">Jobs Completed:</span>
                            <span className="font-medium text-gray-900">{item.provider.total_jobs}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500">Location:</span>
                            <span className="font-medium text-gray-900">{item.provider.city}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => bookWithProvider(item.provider.id)}
                            disabled={!item.isSelected}
                            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                              item.isSelected
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            Book Now
                          </button>
                          <button
                            onClick={() => navigate(`/customer/providers/${item.provider.id}`)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromComparison(item.provider.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Remove from comparison"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="p-4 border-r border-gray-200 text-right">
                    <p className="text-3xl font-bold text-gray-900">
                      {item.price > 0 ? `₹${item.price}` : 'Contact for Price'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">per hour</p>
                  </div>

                  {/* Rating */}
                  <div className="p-4 border-r border-gray-200 text-center">
                    {item.provider.avg_rating > 0 ? (
                      <div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">
                          {item.provider.avg_rating.toFixed(1)}
                        </div>
                        <div className="flex justify-center text-yellow-400 text-sm">
                          {'★'.repeat(Math.round(item.provider.avg_rating))}
                          {'☆'.repeat(5 - Math.round(item.provider.avg_rating))}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {item.provider.total_reviews} reviews
                        </p>
                      </div>
                    ) : (
                      <div className="text-gray-400">
                        <p className="text-lg">No ratings yet</p>
                      </div>
                    )}
                  </div>

                  {/* Reviews */}
                  <div className="p-4 text-center">
                    <p className="text-3xl font-bold text-gray-900 mb-1">
                      {item.provider.total_reviews}
                    </p>
                    <p className="text-sm text-gray-600">reviews</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Selection Summary */}
            {comparison.some(item => item.isSelected) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {comparison.filter(item => item.isSelected).length} Provider(s) Selected
                    </h3>
                    <p className="text-sm text-gray-600">
                      Click "Book Now" to proceed with selected provider(s)
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const selectedProviders = comparison.filter(item => item.isSelected);
                      if (selectedProviders.length === 1) {
                        bookWithProvider(selectedProviders[0].provider.id);
                      } else {
                        // For multiple selection, navigate to bookings page
                        navigate('/customer/bookings');
                      }
                    }}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
