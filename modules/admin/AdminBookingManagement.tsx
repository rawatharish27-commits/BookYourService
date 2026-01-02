import React, { useState, useEffect } from 'react';
import { db } from '../../services/DatabaseService';
import { BookingStatus, User, Booking } from '../../types';

const AdminBookingManagement: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>(db.getBookings());
  const [users, setUsers] = useState<User[]>(db.getUsers());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<BookingStatus | 'ALL'>('ALL');

  useEffect(() => {
    const interval = setInterval(() => {
      setBookings(db.getBookings());
      setUsers(db.getUsers());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredBookings = bookings.filter(booking => {
    const customer = users.find(u => u.id === booking.userId);
    const provider = booking.providerId ? users.find(u => u.id === booking.providerId) : null;

    const matchesSearch = booking.problemTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'ALL' || booking.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const bookingStats = {
    total: bookings.length,
    inProgress: bookings.filter(b => b.status === BookingStatus.IN_PROGRESS).length,
    completed: bookings.filter(b => b.status === BookingStatus.COMPLETED).length,
    cancelled: bookings.filter(b => b.status === BookingStatus.CANCELLED).length,
    pending: bookings.filter(b => b.status === BookingStatus.PENDING).length
  };

  const handleCancelBooking = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking && booking.status !== BookingStatus.COMPLETED) {
      booking.status = BookingStatus.CANCELLED;
      db.upsertBooking(booking);
      setBookings(db.getBookings());
      alert('Booking cancelled successfully');
    }
  };

  const handleCompleteBooking = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking && booking.status === BookingStatus.IN_PROGRESS) {
      booking.status = BookingStatus.COMPLETED;
      db.upsertBooking(booking);
      setBookings(db.getBookings());
      alert('Booking marked as completed');
    }
  };

  const handleAssignProvider = (bookingId: string, providerId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      booking.providerId = providerId;
      booking.status = BookingStatus.IN_PROGRESS;
      db.upsertBooking(booking);
      setBookings(db.getBookings());
      alert('Provider assigned successfully');
    }
  };

  const availableProviders = users.filter(u => u.role === 'PROVIDER' && u.status === 'APPROVED');

  return (
    <div className="p-8 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none mb-2">
          Booking <span className="text-blue-600">Management</span>
        </h1>
        <p className="text-sm text-slate-600">Service dispatch oversight and booking administration</p>
      </div>

      {/* Booking Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-slate-100 text-center">
          <div className="text-2xl font-bold text-slate-900">{bookingStats.total}</div>
          <div className="text-xs text-slate-600 uppercase tracking-wider">Total</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 text-center">
          <div className="text-2xl font-bold text-blue-600">{bookingStats.inProgress}</div>
          <div className="text-xs text-slate-600 uppercase tracking-wider">In Progress</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 text-center">
          <div className="text-2xl font-bold text-green-600">{bookingStats.completed}</div>
          <div className="text-xs text-slate-600 uppercase tracking-wider">Completed</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 text-center">
          <div className="text-2xl font-bold text-red-600">{bookingStats.cancelled}</div>
          <div className="text-xs text-slate-600 uppercase tracking-wider">Cancelled</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 text-center">
          <div className="text-2xl font-bold text-yellow-600">{bookingStats.pending}</div>
          <div className="text-xs text-slate-600 uppercase tracking-wider">Pending</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Search by booking ID, customer, provider, or problem..."
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as BookingStatus | 'ALL')}
          >
            <option value="ALL">All Status</option>
            <option value={BookingStatus.PENDING}>Pending</option>
            <option value={BookingStatus.IN_PROGRESS}>In Progress</option>
            <option value={BookingStatus.COMPLETED}>Completed</option>
            <option value={BookingStatus.CANCELLED}>Cancelled</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Booking ID</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Problem</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Provider</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredBookings.map(booking => {
                const customer = users.find(u => u.id === booking.userId);
                const provider = booking.providerId ? users.find(u => u.id === booking.providerId) : null;

                return (
                  <tr key={booking.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-900">#{booking.id.slice(-8)}</div>
                      <div className="text-xs text-slate-500">{booking.category}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-slate-900 max-w-xs truncate">{booking.problemTitle}</div>
                      <div className="text-xs text-slate-500 max-w-xs truncate">{booking.problemDescription}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-slate-900">{customer?.name || 'Unknown'}</div>
                      <div className="text-xs text-slate-500">{customer?.phone || ''}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {provider ? (
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{provider.name}</div>
                          <div className="text-xs text-slate-500">{provider.phone}</div>
                        </div>
                      ) : (
                        <div className="text-sm text-slate-500">Unassigned</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        booking.status === BookingStatus.COMPLETED ? 'bg-green-100 text-green-800' :
                        booking.status === BookingStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-800' :
                        booking.status === BookingStatus.CANCELLED ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                      ₹{booking.totalAmount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {new Date(booking.createdAt || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        {booking.status === BookingStatus.PENDING && !booking.providerId && (
                          <select
                            onChange={(e) => handleAssignProvider(booking.id, e.target.value)}
                            className="text-xs px-2 py-1 border border-slate-300 rounded"
                            defaultValue=""
                          >
                            <option value="" disabled>Assign Provider</option>
                            {availableProviders.map(provider => (
                              <option key={provider.id} value={provider.id}>{provider.name}</option>
                            ))}
                          </select>
                        )}
                        {booking.status === BookingStatus.IN_PROGRESS && (
                          <button
                            onClick={() => handleCompleteBooking(booking.id)}
                            className="text-xs px-2 py-1 bg-green-600 text-white rounded font-bold hover:bg-green-700"
                          >
                            Complete
                          </button>
                        )}
                        {booking.status !== BookingStatus.CANCELLED && booking.status !== BookingStatus.COMPLETED && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="text-xs px-2 py-1 bg-red-600 text-white rounded font-bold hover:bg-red-700"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📅</div>
            <p className="text-slate-600">No bookings found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBookingManagement;