/**
 * CANCEL BOOKING PAGE
 * Route: /customer/booking/:id/cancel
 * DB: cancellations table
 * UI: Cancellation reason form + confirm modal
 */

import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase-production';
import { useNavigate, useParams } from 'react-router-dom';

const CANCELLATION_REASONS = [
  'No longer need service',
  'Found cheaper alternative',
  'Rescheduling to different time',
  'Provider unavailable',
  'Change in plans',
  'Other (please specify)'
];

export default function CancelBooking() {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const [booking, setBooking] = useState<any>(null);
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [otherDetails, setOtherDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (bookingId) loadBooking();
  }, [bookingId]);

  const loadBooking = async () => {
    const { data } = await supabase
      .from('bookings')
      .select('*, service_title, total_amount')
      .eq('id', bookingId)
      .single();
    setBooking(data);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    
    const { error } = await supabase
      .from('bookings')
      .update({ 
        status: 'cancelled',
        cancel_reason: selectedReason === 'Other (please specify)' ? customReason : selectedReason,
        cancel_details: otherDetails,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId);

    if (!error) {
      // Log cancellation
      await supabase.from('cancellations').insert({
        booking_id: bookingId,
        reason: selectedReason,
        details: otherDetails
      });
      
      navigate('/customer/bookings');
    }
    
    setSubmitting(false);
  };

  if (!booking) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <button onClick={() => navigate(-1)} className="mb-8 text-gray-500 hover:text-gray-700">
          ← Back to Booking
        </button>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cancel Booking</h1>
          <p className="text-gray-600 mb-8">
            We're sorry to see you go. Please let us know why you're cancelling.
          </p>

          {booking && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Booking Details</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-semibold text-gray-900">{booking.service_title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-semibold text-gray-900">{new Date(booking.booking_date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-semibold text-gray-900">{booking.booking_time}</span>
                </div>
                {booking.total_amount && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-bold text-blue-600 text-lg">₹{booking.total_amount}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); setShowConfirm(true); }}>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Reason for Cancellation *
                </label>
                <div className="space-y-2">
                  {CANCELLATION_REASONS.map((reason) => (
                    <label key={reason} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="reason"
                        value={reason}
                        checked={selectedReason === reason}
                        onChange={(e) => {
                          setSelectedReason(e.target.value);
                          setCustomReason('');
                        }}
                        className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-gray-700">{reason}</span>
                    </label>
                  ))}
                </div>
              </div>

              {selectedReason === 'Other (please specify)' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Please specify *
                  </label>
                  <textarea
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Please provide more details about why you're cancelling..."
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Details (Optional)
                </label>
                <textarea
                  value={otherDetails}
                  onChange={(e) => setOtherDetails(e.target.value)}
                  placeholder="Any other details you'd like to share..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={!selectedReason || (selectedReason === 'Other (please specify)' && !customReason)}
                className="w-full px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold text-lg"
              >
                Continue to Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Confirmation Modal */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Cancel Booking?</h2>
                <p className="text-gray-600">
                  Are you sure you want to cancel this booking? This action cannot be undone.
                </p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-red-800 mb-2">Important:</h3>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Your booking will be permanently cancelled</li>
                  <li>• If you've already paid, refund will be processed in 7-10 business days</li>
                  <li>• You can book this service again anytime</li>
                </ul>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors font-semibold"
                >
                  {submitting ? 'Processing...' : 'Yes, Cancel My Booking'}
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  disabled={submitting}
                  className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors font-semibold"
                >
                  No, Go Back
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
