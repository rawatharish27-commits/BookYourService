/**
 * Booking Timeline Page (Production-Grade)
 * 
 * Customers can track their booking progress with a visual timeline.
 * Shows all status updates, provider actions, and payment milestones.
 * 
 * Features:
 * - Vertical stepper timeline
 * - Realtime status updates
 * - Contact provider at any step
 * - Reschedule/cancel options
 * - Download receipt
 * 
 * Database:
 * - bookings table
 * - activity_logs table (for timeline events)
 */

import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase-production';
import type { Database } from '../../services/supabase-production';
import { useNavigate, useParams } from 'react-router-dom';

type BookingWithTimeline = Database['public']['Tables']['bookings']['Row'] & {
  customer_name?: string;
  provider_name?: string;
  provider_phone?: string;
  service_title?: string;
  total_amount?: number;
  payment_status?: string;
};

type TimelineEvent = {
  id: string;
  timestamp: string;
  event: string;
  description: string;
  icon: string;
  status: 'pending' | 'completed' | 'in-progress' | 'cancelled';
};

export default function BookingTimeline() {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const [booking, setBooking] = useState<BookingWithTimeline | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load booking and timeline on component mount
  useEffect(() => {
    if (bookingId) {
      loadBookingAndTimeline();
      subscribeToBookingUpdates();
    }
  }, [bookingId]);

  const loadBookingAndTimeline = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch booking details
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select(`
          id,
          customer_id,
          provider_id,
          service_id,
          service_title,
          status,
          booking_date,
          booking_time,
          notes,
          total_amount,
          created_at,
          updated_at,
          completed_at,
          customer:customer_id(name, phone),
          provider:provider_id(name, phone),
          payments:payment_webhook(payment_status, gateway_status)
        `)
        .eq('id', bookingId)
        .single();

      if (bookingError) {
        throw bookingError;
      }

      if (!bookingData) {
        throw new Error('Booking not found');
      }

      setBooking(bookingData as BookingWithTimeline);

      // Generate timeline based on booking status
      const timelineEvents = generateTimeline(bookingData);
      setTimeline(timelineEvents);

    } catch (err: any) {
      console.error('Error loading booking timeline:', err);
      setError(err.message || 'Failed to load booking timeline');
    } finally {
      setLoading(false);
    }
  };

  const subscribeToBookingUpdates = () => {
    const subscription = supabase
      .channel(`booking-${bookingId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: `id=eq.${bookingId}`
        },
        (payload) => {
          console.log('Booking update detected:', payload);
          loadBookingAndTimeline();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const generateTimeline = (booking: any): TimelineEvent[] => {
    const events: TimelineEvent[] = [];

    // 1. Booking Created
    events.push({
      id: '1',
      timestamp: booking.created_at,
      event: 'Booking Requested',
      description: 'Your booking request has been submitted successfully.',
      icon: '📝',
      status: 'completed',
    });

    // 2. Payment Initiated (if payment status exists)
    if (booking.payments?.[0]?.created_at) {
      const payment = booking.payments[0];
      events.push({
        id: '2',
        timestamp: payment.created_at,
        event: 'Payment Initiated',
        description: `Payment of ₹${payment.amount / 100} has been initiated via ${payment.gateway === 'razorpay' ? 'Razorpay' : 'Stripe'}.`,
        icon: '💳',
        status: payment.payment_status === 'paid' ? 'completed' : 'in-progress',
      });
    }

    // 3. Payment Completed
    if (booking.payments?.[0]?.updated_at && booking.payments[0].payment_status === 'paid') {
      events.push({
        id: '3',
        timestamp: booking.payments[0].updated_at,
        event: 'Payment Confirmed',
        description: 'Payment has been confirmed successfully.',
        icon: '✅',
        status: 'completed',
      });
    }

    // 4. Provider Assigned
    if (booking.provider_id && booking.updated_at > booking.created_at) {
      events.push({
        id: '4',
        timestamp: booking.updated_at,
        event: 'Provider Assigned',
        description: `${booking.provider?.name || 'Provider'} has been assigned to your booking.`,
        icon: '👨‍🔧',
        status: 'completed',
      });
    }

    // 5. Booking Accepted
    if (booking.status === 'accepted') {
      events.push({
        id: '5',
        timestamp: booking.updated_at,
        event: 'Booking Confirmed',
        description: 'Provider has accepted your booking.',
        icon: '🤝',
        status: 'completed',
      });
    }

    // 6. Service In Progress
    if (booking.status === 'in_progress') {
      events.push({
        id: '6',
        timestamp: booking.updated_at,
        event: 'Service In Progress',
        description: 'Provider is currently working on your service.',
        icon: '🔧',
        status: 'in-progress',
      });
    }

    // 7. Service Completed
    if (booking.status === 'completed') {
      events.push({
        id: '7',
        timestamp: booking.completed_at || booking.updated_at,
        event: 'Service Completed',
        description: 'Service has been completed successfully.',
        icon: '🎉',
        status: 'completed',
      });
    }

    // 8. Review Pending
    if (booking.status === 'completed' && !booking.booking_rating) {
      events.push({
        id: '8',
        timestamp: booking.completed_at || booking.updated_at,
        event: 'Review Pending',
        description: 'Please leave a review for the service provided.',
        icon: '⭐',
        status: 'pending',
      });
    }

    // 9. Booking Cancelled
    if (booking.status === 'cancelled') {
      events.push({
        id: '9',
        timestamp: booking.updated_at,
        event: 'Booking Cancelled',
        description: 'Booking has been cancelled.',
        icon: '❌',
        status: 'cancelled',
      });
    }

    return events.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  };

  const handleReschedule = () => {
    if (booking && booking.status !== 'cancelled') {
      navigate(`/customer/booking/${booking.id}/reschedule`);
    }
  };

  const handleCancel = () => {
    if (booking && booking.status !== 'cancelled') {
      navigate(`/customer/booking/${booking.id}/cancel`);
    }
  };

  const handleContactProvider = () => {
    if (booking && booking.provider_phone) {
      window.location.href = `tel:${booking.provider_phone}`;
    }
  };

  const handleDownloadReceipt = () => {
    if (booking && booking.status === 'completed') {
      // Navigate to receipt download page
      window.open(`/customer/booking/${booking.id}/receipt`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading booking timeline...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-red-50 rounded-lg">
          <h2 className="text-xl font-bold text-red-800 mb-2">Error Loading Timeline</h2>
          <p className="text-red-600">{error}</p>
          <button onClick={() => navigate(-1)} className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Booking Timeline</h1>
              <p className="text-gray-600 mt-1">
                Track your booking progress step by step
              </p>
            </div>
            <button
              onClick={() => navigate('/customer/bookings')}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
            >
              View All Bookings
            </button>
          </div>
        </div>
      </div>

      {/* Booking Summary Card */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {booking.service_title || 'Service Booking'}
              </h2>
              <div className="flex items-center gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(booking.booking_date).toLocaleDateString('en-IN', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {booking.booking_time || 'To be confirmed'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="text-lg font-bold text-blue-600">
                    {booking.total_amount ? `₹${booking.total_amount}` : 'To be confirmed'}
                  </p>
                </div>
              </div>

              {booking.provider_name && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Assigned Provider</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-semibold text-gray-900">
                        {booking.provider_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {booking.provider_phone || 'Contact for details'}
                      </p>
                    </div>
                    {booking.provider_phone && (
                      <button
                        onClick={handleContactProvider}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Call Provider
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Status Badge */}
            <div className="flex flex-col gap-2 md:min-w-[150px]">
              <div className={`px-4 py-2 rounded-lg text-center font-medium ${
                booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                booking.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                booking.status === 'accepted' ? 'bg-purple-100 text-purple-800' :
                booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {booking.status === 'completed' ? 'Completed' :
                 booking.status === 'in_progress' ? 'In Progress' :
                 booking.status === 'accepted' ? 'Confirmed' :
                 booking.status === 'cancelled' ? 'Cancelled' :
                 'Pending'}
              </div>

              {booking.payment_status === 'paid' && (
                <button
                  onClick={handleDownloadReceipt}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  Download Receipt
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {booking.status !== 'completed' && booking.status !== 'cancelled' && (
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              {booking.status === 'accepted' && (
                <button
                  onClick={handleReschedule}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                >
                  Reschedule Booking
                </button>
              )}
              <button
                onClick={handleCancel}
                className="flex-1 px-6 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-semibold"
              >
                Cancel Booking
              </button>
            </div>
          )}

          {booking.status === 'completed' && (
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => navigate(`/customer/rebook?provider=${booking.provider_id}`)}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Book Same Service
              </button>
              <button
                onClick={() => navigate(`/customer/review/${booking.id}`)}
                className="flex-1 px-6 py-3 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors font-semibold"
              >
                Leave Review
              </button>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Booking Progress Timeline</h3>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

            {/* Timeline Events */}
            <div className="space-y-8">
              {timeline.map((event, index) => (
                <div
                  key={event.id}
                  className="relative pl-16"
                >
                  {/* Timeline Node */}
                  <div className={`absolute left-2 w-8 h-8 rounded-full flex items-center justify-center border-4 ${
                    event.status === 'completed' ? 'bg-green-100 border-green-500' :
                    event.status === 'in-progress' ? 'bg-blue-100 border-blue-500' :
                    event.status === 'cancelled' ? 'bg-red-100 border-red-500' :
                    'bg-gray-100 border-gray-400'
                  }`}>
                    <span className="text-sm">{event.icon}</span>
                  </div>

                  {/* Event Content */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">
                          {event.event}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(event.timestamp).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        event.status === 'completed' ? 'bg-green-100 text-green-800' :
                        event.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        event.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {event.status === 'completed' ? 'Completed' :
                         event.status === 'in-progress' ? 'In Progress' :
                         event.status === 'cancelled' ? 'Cancelled' :
                         'Pending'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
