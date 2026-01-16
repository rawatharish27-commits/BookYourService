/**
 * Customer Bookings Page - Booking History & Management
 * 
 * This page allows customers to:
 * - View their booking history
 * - See current booking status
 * - Create new bookings (select provider and service)
 */

import React, { useState, useEffect } from 'react';
import { 
  getCustomerBookings, 
  createBooking, 
  cancelBooking, 
  getBookingStats,
  getBookingStatusMessage
} from '../services/booking';
import type { Provider, Booking } from '../services/supabase';
import { getProviderStatus } from '../services/provider';

// Mock available providers for booking
const MOCK_AVAILABLE_PROVIDERS: Provider[] = [
  {
    id: 'mock_provider_1',
    service_type: 'Electrician',
    experience: 5,
    status: 'approved',
    city: 'Mumbai',
    description: 'Experienced electrician specializing in residential wiring',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    name: 'Rahul Sharma'
  },
  {
    id: 'mock_provider_2',
    service_type: 'Plumber',
    experience: 3,
    status: 'approved',
    city: 'Delhi',
    description: 'Professional plumber with expertise in pipe fitting',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    name: 'Amit Kumar'
  },
  {
    id: 'mock_provider_3',
    service_type: 'AC Repair',
    experience: 7,
    status: 'approved',
    city: 'Bangalore',
    description: 'AC specialist with 7 years of experience',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    name: 'Suresh Patel'
  }
];

const SERVICE_TYPES = [
  'Electrical Repair',
  'Plumbing Service',
  'AC Repair & Maintenance',
  'Carpentry',
  'Painting',
  'Cleaning',
  'Appliance Repair',
  'Pest Control'
];

interface CustomerBookingsProps {
  customerId: string;
}

const CustomerBookings: React.FC<CustomerBookingsProps> = ({ customerId }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState({ total: 0, requested: 0, accepted: 0, completed: 0, cancelled: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'history' | 'new'>('history');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // New booking form state
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [selectedService, setSelectedService] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch bookings on mount
  useEffect(() => {
    loadData();
  }, [customerId]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bookingsData, statsData] = await Promise.all([
        getCustomerBookings(customerId),
        getBookingStats(customerId, 'customer')
      ]);
      setBookings(bookingsData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load bookings:', error);
      setNotification({ type: 'error', message: 'Failed to load bookings' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      const success = await cancelBooking(bookingId);
      if (success) {
        setNotification({ type: 'success', message: 'Booking cancelled' });
        loadData();
      } else {
        setNotification({ type: 'error', message: 'Failed to cancel booking' });
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Error cancelling booking' });
    }
  };

  const handleCreateBooking = async () => {
    if (!selectedProvider || !selectedService || !bookingDate) {
      setNotification({ type: 'error', message: 'Please fill all required fields' });
      return;
    }

    setSubmitting(true);
    try {
      const newBooking = await createBooking(
        customerId,
        selectedProvider.id,
        selectedService,
        bookingDate,
        notes
      );
      
      if (newBooking) {
        setNotification({ type: 'success', message: 'Booking created successfully!' });
        // Reset form
        setSelectedProvider(null);
        setSelectedService('');
        setBookingDate('');
        setNotes('');
        setActiveTab('history');
        loadData();
      } else {
        setNotification({ type: 'error', message: 'Failed to create booking' });
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Error creating booking' });
    } finally {
      setSubmitting(false);
    }
  };

  const statusInfo = (status: string) => getBookingStatusMessage(status);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-8 right-8 px-6 py-4 rounded-2xl shadow-2xl z-50 animate-slideIn ${
          notification.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'
        } text-white font-bold`}>
          {notification.message}
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-[#0A2540] italic tracking-tighter">
            My <span className="text-blue-500">Bookings</span>
          </h1>
          <p className="text-slate-500 mt-2">Manage your service bookings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total, icon: '📋' },
            { label: 'Pending', value: stats.requested, icon: '⏳' },
            { label: 'Accepted', value: stats.accepted, icon: '✓' },
            { label: 'Completed', value: stats.completed, icon: '✓✓' },
            { label: 'Cancelled', value: stats.cancelled, icon: '✕' }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 text-center">
              <div className="text-2xl mb-2">{stat.icon}</div>
              <p className="text-2xl font-black text-[#0A2540] italic">{stat.value}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('history')}
            className={`px-8 py-4 rounded-2xl font-bold uppercase text-xs tracking-widest transition-all ${
              activeTab === 'history' 
                ? 'bg-[#0A2540] text-white shadow-xl' 
                : 'bg-white text-slate-400 hover:bg-slate-50'
            }`}
          >
            📜 Booking History
          </button>
          <button
            onClick={() => setActiveTab('new')}
            className={`px-8 py-4 rounded-2xl font-bold uppercase text-xs tracking-widest transition-all ${
              activeTab === 'new' 
                ? 'bg-blue-500 text-white shadow-xl' 
                : 'bg-white text-slate-400 hover:bg-slate-50'
            }`}
          >
            ➕ New Booking
          </button>
        </div>

        {/* Content */}
        {activeTab === 'history' ? (
          // Booking History
          loading ? (
            <div className="text-center py-20">
              <div className="text-6xl animate-pulse">📋</div>
              <p className="text-slate-400 mt-4 font-bold uppercase tracking-widest">Loading bookings...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[3rem] border border-slate-100">
              <div className="text-6xl">📭</div>
              <h3 className="text-2xl font-black text-[#0A2540] mt-4 italic">No Bookings Yet</h3>
              <p className="text-slate-400 mt-2">Create your first booking to get started</p>
              <button 
                onClick={() => setActiveTab('new')}
                className="mt-6 px-8 py-4 bg-blue-500 text-white rounded-2xl font-bold uppercase text-xs tracking-widest"
              >
                Create Booking
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const info = statusInfo(booking.status);
                return (
                  <div 
                    key={booking.id}
                    className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex gap-6">
                        <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-2xl font-black italic ${
                          booking.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                          booking.status === 'cancelled' ? 'bg-rose-100 text-rose-600' :
                          booking.status === 'accepted' ? 'bg-blue-100 text-blue-600' :
                          'bg-yellow-100 text-yellow-600'
                        }`}>
                          {info.icon}
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-[#0A2540] uppercase italic">
                            {booking.service}
                          </h3>
                          <div className="flex gap-4 mt-2 text-sm">
                            <span className="bg-slate-50 text-slate-500 px-3 py-1 rounded-full font-bold">
                              📅 {new Date(booking.booking_date).toLocaleDateString()}
                            </span>
                            {booking.provider_name && (
                              <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold">
                                👤 {booking.provider_name}
                              </span>
                            )}
                          </div>
                          {booking.notes && (
                            <p className="text-slate-400 mt-3 text-sm">
                              📝 {booking.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        <span className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest ${
                          booking.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                          booking.status === 'cancelled' ? 'bg-rose-100 text-rose-700' :
                          booking.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {info.label}
                        </span>
                        
                        {booking.total_amount && (
                          <span className="text-xl font-black text-[#0A2540]">
                            ₹{booking.total_amount}
                          </span>
                        )}

                        {booking.status === 'requested' && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="px-4 py-2 bg-rose-50 text-rose-500 rounded-xl font-bold text-xs uppercase hover:bg-rose-100 transition-all"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          // New Booking Form
          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
            <h2 className="text-2xl font-black text-[#0A2540] italic mb-8">
              Create New <span className="text-blue-500">Booking</span>
            </h2>

            <div className="grid grid-cols-2 gap-8">
              {/* Select Service */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                  Select Service *
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold outline-none focus:border-blue-500"
                >
                  <option value="">Choose a service...</option>
                  {SERVICE_TYPES.map(service => (
                    <option key={service} value={service}>{service}</option>
                  ))}
                </select>
              </div>

              {/* Select Date */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                  Preferred Date *
                </label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold outline-none focus:border-blue-500"
                />
              </div>

              {/* Select Provider */}
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                  Select Provider (Optional)
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {MOCK_AVAILABLE_PROVIDERS.map((provider) => (
                    <button
                      key={provider.id}
                      onClick={() => setSelectedProvider(provider)}
                      className={`p-6 rounded-2xl border-2 text-left transition-all ${
                        selectedProvider?.id === provider.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-[#0A2540] rounded-xl flex items-center justify-center text-white font-black italic">
                          {provider.name?.[0]}
                        </div>
                        <div>
                          <p className="font-bold text-[#0A2540]">{provider.name}</p>
                          <p className="text-xs text-slate-400">{provider.service_type}</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500">{provider.city} • {provider.experience} years</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                  Additional Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe your requirement..."
                  rows={4}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold outline-none focus:border-blue-500 resize-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 mt-8 pt-8 border-t border-slate-100">
              <button
                onClick={() => setActiveTab('history')}
                className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBooking}
                disabled={submitting || !selectedService || !bookingDate}
                className="px-8 py-4 bg-blue-500 text-white rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Creating...' : 'Create Booking'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerBookings;

