/**
 * Provider Bookings Page - Provider Booking Management
 * 
 * This page allows providers to:
 * - View their assigned bookings
 * - Accept or complete bookings
 * - See their booking statistics
 */

import React, { useState, useEffect } from 'react';
import { 
  getProviderBookings, 
  acceptBooking, 
  completeBooking,
  getBookingStats,
  getBookingStatusMessage
} from '../services/booking';
import type { Booking } from '../services/supabase';

interface ProviderBookingsProps {
  providerId: string;
}

const ProviderBookings: React.FC<ProviderBookingsProps> = ({ providerId }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState({ total: 0, requested: 0, accepted: 0, completed: 0, cancelled: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'requested' | 'accepted' | 'completed'>('all');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch bookings on mount
  useEffect(() => {
    loadData();
  }, [providerId]);

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
        getProviderBookings(providerId),
        getBookingStats(providerId, 'provider')
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

  const handleAcceptBooking = async (bookingId: string) => {
    setActionLoading(bookingId);
    try {
      const success = await acceptBooking(bookingId, providerId);
      if (success) {
        setNotification({ type: 'success', message: 'Booking accepted!' });
        loadData();
      } else {
        setNotification({ type: 'error', message: 'Failed to accept booking' });
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Error accepting booking' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteBooking = async (bookingId: string) => {
    setActionLoading(bookingId);
    try {
      const success = await completeBooking(bookingId);
      if (success) {
        setNotification({ type: 'success', message: 'Booking completed!' });
        loadData();
      } else {
        setNotification({ type: 'error', message: 'Failed to complete booking' });
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Error completing booking' });
    } finally {
      setActionLoading(null);
    }
  };

  const statusInfo = (status: string) => getBookingStatusMessage(status);

  // Filter bookings
  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === filter);

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
            My <span className="text-blue-500">Jobs</span>
          </h1>
          <p className="text-slate-500 mt-2">Manage your service bookings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Pending', value: stats.requested, icon: '⏳', color: 'yellow' },
            { label: 'Active', value: stats.accepted, icon: '🔧', color: 'blue' },
            { label: 'Completed', value: stats.completed, icon: '✓✓', color: 'green' },
            { label: 'Total', value: stats.total, icon: '📋', color: 'slate' }
          ].map((stat, i) => (
            <div key={i} className={`bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 text-center ${
              filter === stat.label.toLowerCase() ? 'ring-2 ring-blue-500' : ''
            }`} onClick={() => setFilter(stat.label.toLowerCase() as any)}>
              <div className="text-2xl mb-2">{stat.icon}</div>
              <p className="text-2xl font-black text-[#0A2540] italic">{stat.value}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8">
          {(['all', 'requested', 'accepted', 'completed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-6 py-3 rounded-2xl font-bold uppercase text-xs tracking-widest transition-all ${
                filter === status 
                  ? 'bg-[#0A2540] text-white shadow-xl' 
                  : 'bg-white text-slate-400 hover:bg-slate-50'
              }`}
            >
              {status === 'all' ? 'All Jobs' : status}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="text-center py-20">
            <div className="text-6xl animate-pulse">🔧</div>
            <p className="text-slate-400 mt-4 font-bold uppercase tracking-widest">Loading jobs...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[3rem] border border-slate-100">
            <div className="text-6xl">📭</div>
            <h3 className="text-2xl font-black text-[#0A2540] mt-4 italic">
              {filter === 'all' ? 'No Jobs Yet' : `No ${filter} Jobs`}
            </h3>
            <p className="text-slate-400 mt-2">
              {filter === 'all' 
                ? 'Accept bookings to start earning' 
                : `You don't have any ${filter} jobs`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => {
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
                          {booking.customer_name && (
                            <span className="bg-purple-50 text-purple-600 px-3 py-1 rounded-full font-bold">
                              👤 {booking.customer_name}
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
                        booking.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {info.label}
                      </span>
                      
                      {booking.total_amount && (
                        <span className="text-2xl font-black text-emerald-600">
                          ₹{booking.total_amount}
                        </span>
                      )}

                      {/* Action Buttons */}
                      {booking.status === 'requested' && (
                        <button
                          onClick={() => handleAcceptBooking(booking.id)}
                          disabled={actionLoading === booking.id}
                          className="px-6 py-3 bg-blue-500 text-white rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-blue-600 transition-all disabled:opacity-50"
                        >
                          {actionLoading === booking.id ? 'Processing...' : '✓ Accept Job'}
                        </button>
                      )}

                      {booking.status === 'accepted' && (
                        <button
                          onClick={() => handleCompleteBooking(booking.id)}
                          disabled={actionLoading === booking.id}
                          className="px-6 py-3 bg-emerald-500 text-white rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-emerald-600 transition-all disabled:opacity-50"
                        >
                          {actionLoading === booking.id ? 'Processing...' : '✓✓ Complete Job'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Status Timeline */}
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${
                          ['requested', 'accepted', 'completed'].includes(booking.status) 
                            ? 'bg-blue-500' : 'bg-slate-200'
                        }`}></span>
                        Created
                      </span>
                      <div className={`flex-1 h-0.5 ${
                        ['accepted', 'completed'].includes(booking.status) 
                          ? 'bg-blue-500' : 'bg-slate-200'
                      }`}></div>
                      <span className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${
                          ['accepted', 'completed'].includes(booking.status) 
                            ? 'bg-blue-500' : 'bg-slate-200'
                        }`}></span>
                        Accepted
                      </span>
                      <div className={`flex-1 h-0.5 ${
                        booking.status === 'completed' ? 'bg-blue-500' : 'bg-slate-200'
                      }`}></div>
                      <span className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${
                          booking.status === 'completed' ? 'bg-blue-500' : 'bg-slate-200'
                        }`}></span>
                        Completed
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderBookings;

