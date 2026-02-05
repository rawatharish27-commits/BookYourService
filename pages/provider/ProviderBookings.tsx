import React, { useEffect, useState } from 'react';
import { Booking, Role, BookingStatus } from '../../types';
import { getBookings, updateBookingStatus } from '../../services/mockApi';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/StatusBadge';
import { CheckCircle, XCircle, Play, CheckSquare } from 'lucide-react';

export const ProviderBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    if (!user) return;
    setLoading(true);
    const data = await getBookings(Role.PROVIDER, user.id);
    setBookings(data);
    setLoading(false);
  };

  const changeStatus = async (id: string, status: BookingStatus) => {
    try {
        await updateBookingStatus(id, status);
        fetchBookings();
    } catch (e) {
        alert((e as Error).message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Incoming Bookings</h2>
      
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
             <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.map(booking => (
                <tr key={booking.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{booking.serviceTitle}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.clientName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(booking.scheduled_time).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                     <StatusBadge status={booking.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                        {/* State Machine Transitions */}
                        {booking.status === BookingStatus.PENDING && (
                            <>
                                <button onClick={() => changeStatus(booking.id, BookingStatus.ACCEPTED)} className="text-green-600 hover:text-green-900" title="Accept">
                                    <CheckCircle className="w-5 h-5" />
                                </button>
                                <button onClick={() => changeStatus(booking.id, BookingStatus.CANCELLED)} className="text-red-600 hover:text-red-900" title="Reject">
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </>
                        )}
                         {booking.status === BookingStatus.ACCEPTED && (
                            <>
                                <button onClick={() => changeStatus(booking.id, BookingStatus.IN_PROGRESS)} className="text-blue-600 hover:text-blue-900" title="Start Job">
                                    <Play className="w-5 h-5" />
                                </button>
                                <button onClick={() => changeStatus(booking.id, BookingStatus.CANCELLED)} className="text-red-600 hover:text-red-900" title="Cancel">
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </>
                        )}
                        {booking.status === BookingStatus.IN_PROGRESS && (
                            <button onClick={() => changeStatus(booking.id, BookingStatus.COMPLETED)} className="text-green-600 hover:text-green-900" title="Complete Job">
                                <CheckSquare className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {bookings.length === 0 && <div className="p-8 text-center text-gray-500">No bookings received.</div>}
        </div>
      )}
    </div>
  );
};