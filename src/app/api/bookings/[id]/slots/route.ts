// Production-grade availability checking API
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/api/auth';
import { successResponse, badRequestResponse, notFoundResponse, unauthorizedResponse, handleApiError } from '@/lib/api/response';
import { isValidDate } from '@/lib/api/validation';

// GET available slots for a service on a specific date
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date || !isValidDate(date)) {
      return badRequestResponse('Valid date is required (YYYY-MM-DD format)');
    }

    // Get service details
    const service = await db.service.findUnique({
      where: { id: params.id },
      include: {
        availabilitySlots: true,
        bookings: {
          where: {
            status: {
              in: ['PENDING', 'ACCEPTED', 'IN_PROGRESS'],
            },
          },
        },
      },
    });

    if (!service) {
      return notFoundResponse('Service not found');
    }

    if (!service.isAvailable) {
      return badRequestResponse('Service is not available for booking');
    }

    // Get day of week for the requested date
    const requestedDate = new Date(date);
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const dayOfWeek = days[requestedDate.getDay()];

    // Get availability for the day
    const dayAvailability = service.availabilitySlots.find(
      slot => slot.dayOfWeek === dayOfWeek && slot.isActive
    );

    if (!dayAvailability) {
      return successResponse({ availableSlots: [] });
    }

    // Get existing bookings for this date
    const existingBookings = service.bookings.filter(
      booking => booking.scheduledDate === date
    );

    // Generate time slots (30-minute intervals)
    const availableSlots: any[] = [];
    const startHour = parseInt(dayAvailability.startTime.split(':')[0]);
    const endHour = parseInt(dayAvailability.endTime.split(':')[0]);
    const startMinute = parseInt(dayAvailability.startTime.split(':')[1]);
    const endMinute = parseInt(dayAvailability.endTime.split(':')[1]);

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = hour === startHour ? startMinute : 0; minute < 60; minute += 30) {
        if (minute + 30 > 60) break;

        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

        // Check if this slot is already booked
        const slotStartHour = hour;
        const slotStartMinute = minute;
        const slotEndHour = minute + 30 >= 60 ? hour + 1 : hour;
        const slotEndMinute = (minute + 30) % 60;

        // Check if this slot conflicts with any existing booking
        const isBooked = existingBookings.some(booking => {
          const bookingHour = parseInt(booking.scheduledTime.split(':')[0]);
          const bookingMinute = parseInt(booking.scheduledTime.split(':')[1]);
          const bookingDuration = booking.durationMinutes;

          const bookingEndHour = bookingMinute + bookingDuration >= 60 
            ? bookingHour + Math.floor((bookingMinute + bookingDuration) / 60)
            : bookingHour;
          const bookingEndMinute = (bookingMinute + bookingDuration) % 60;

          // Check overlap
          return (
            (slotStartHour < bookingEndHour || (slotStartHour === bookingEndHour && slotStartMinute < bookingEndMinute)) &&
            (slotEndHour > bookingHour || (slotEndHour === bookingHour && slotEndMinute > bookingMinute))
          );
        });

        if (!isBooked) {
          availableSlots.push({
            time: timeString,
            available: true,
          });
        } else {
          availableSlots.push({
            time: timeString,
            available: false,
          });
        }

        // Skip next slot if this one would go beyond end time
        if (minute + 30 > endMinute) break;
      }
    }

    // Check if service is available on this specific date
    const unavailableDate = await db.unavailableDate.findUnique({
      where: {
        serviceId_date: {
          serviceId: params.id,
          date: date,
        },
      },
    });

    return successResponse({
      date,
      dayOfWeek,
      available: !unavailableDate,
      availableSlots,
      service: {
        id: service.id,
        title: service.title,
        durationMinutes: service.durationMinutes,
        basePrice: service.basePrice,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
