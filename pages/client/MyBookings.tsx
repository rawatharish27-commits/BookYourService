import React, { useEffect, useState } from 'react';
import { Booking, Role, BookingStatus } from '../../types';
import { getBookings, updateBookingStatus } from '../../services/mockApi';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/StatusBadge';
import { Clock, Ban } from 'lucide-react';

export const MyBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    if (!user) return;
    setLoading(true);
    const data = await getBookings(Role.CLIENT, user.id);
    setBookings(data);
    setLoading(false);
  };

  const handleCancel = async (id: string) => {
    if(window.confirm("Are you sure you want to cancel this booking?")) {
        try {
            await updateBookingStatus(id, BookingStatus.CANCELLED);
            fetchBookings();
        } catch (e) {
            alert((e as Error).message);
        }
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">My Bookings</h2>
      {loading ? (
        <div className="text-center p-8">Loading...</div>
      ) : (
        <div className="space-y-4">
          {bookings.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-lg shadow text-gray-500">
                  No bookings yet.
              </div>
          ) : (
            bookings.map(booking => (
                <div key={booking.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 className="font-bold text-lg text-gray-900">{booking.serviceTitle}</h3>
                    <p className="text-sm text-gray-500">Provider: {booking.clientName}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {new Date(booking.scheduled_time).toLocaleDateString()}</span>
                    <span className="font-semibold text-gray-900">${booking.total_amount}</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <StatusBadge status={booking.status} />
                    {booking.status === BookingStatus.PENDING && (
                    <button
                        onClick={() => handleCancel(booking.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1"
                    >
                        <Ban className="w-4 h-4" /> Cancel
                    </button>
                    )}
                </div>
                </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};