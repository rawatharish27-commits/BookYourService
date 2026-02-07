// Production-grade booking detail API with state machine
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/api/auth';
import { successResponse, notFoundResponse, badRequestResponse, unauthorizedResponse, forbiddenResponse, handleApiError } from '@/lib/api/response';
import { sanitizeInput } from '@/lib/api/validation';
import { UpdateBookingInput } from '@/lib/api/types';

// Booking state transitions
const bookingStateTransitions: Record<string, string[]> = {
  PENDING: ['ACCEPTED', 'REJECTED', 'CANCELLED'],
  ACCEPTED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
  REJECTED: [],
  NO_SHOW: [],
};

// Validate state transition
function isValidStateTransition(currentStatus: string, newStatus: string): boolean {
  const allowedTransitions = bookingStateTransitions[currentStatus] || [];
  return allowedTransitions.includes(newStatus);
}

// GET booking by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth();

    const booking = await db.booking.findUnique({
      where: { id: params.id },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
            businessName: true,
            trustScore: true,
            city: true,
          },
        },
        service: {
          select: {
            id: true,
            title: true,
            description: true,
            basePrice: true,
            durationMinutes: true,
            images: true,
            category: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    if (!booking) {
      return notFoundResponse('Booking not found');
    }

    // Check access permission
    if (
      auth.user.role !== 'ADMIN' &&
      booking.clientUserId !== auth.user.id &&
      booking.providerUserId !== auth.user.id
    ) {
      return forbiddenResponse('You do not have permission to view this booking');
    }

    return successResponse(booking);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    return handleApiError(error);
  }
}

// PATCH update booking status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth();
    const body: UpdateBookingInput = await request.json();

    const booking = await db.booking.findUnique({
      where: { id: params.id },
      include: {
        service: true,
      },
    });

    if (!booking) {
      return notFoundResponse('Booking not found');
    }

    // Check access permission
    const isClient = booking.clientUserId === auth.user.id;
    const isProvider = booking.providerUserId === auth.user.id;
    const isAdmin = auth.user.role === 'ADMIN';

    if (!isClient && !isProvider && !isAdmin) {
      return forbiddenResponse('You do not have permission to update this booking');
    }

    // Handle status update
    if (body.status) {
      // Validate state transition
      if (!isValidStateTransition(booking.status, body.status)) {
        return badRequestResponse(
          `Cannot transition from ${booking.status} to ${body.status}`
        );
      }

      // Role-based status update permissions
      if (body.status === 'ACCEPTED' && !isProvider && !isAdmin) {
        return forbiddenResponse('Only provider can accept booking');
      }

      if (body.status === 'REJECTED' && !isProvider && !isAdmin) {
        return forbiddenResponse('Only provider can reject booking');
      }

      if (body.status === 'IN_PROGRESS' && !isProvider && !isAdmin) {
        return forbiddenResponse('Only provider can start booking');
      }

      if (body.status === 'COMPLETED' && !isProvider && !isAdmin) {
        return forbiddenResponse('Only provider can complete booking');
      }

      if (body.status === 'CANCELLED' && !isClient && !isProvider && !isAdmin) {
        return forbiddenResponse('Only involved parties can cancel booking');
      }
    }

    const updateData: any = {};

    if (body.status !== undefined) {
      updateData.status = body.status;

      // Set timestamps based on status
      if (body.status === 'CANCELLED') {
        updateData.cancelledAt = new Date();
        updateData.cancellationReason = body.cancellationReason || 'No reason provided';
        updateData.paymentStatus = 'REFUNDED';
      }

      if (body.status === 'COMPLETED') {
        updateData.completedAt = new Date();
        updateData.paymentStatus = 'PAID';

        // Update provider stats
        await db.user.update({
          where: { id: booking.providerUserId },
          data: {
            totalEarnings: { increment: booking.totalAmount - booking.platformFee },
          },
        });

        // Update service stats
        await db.service.update({
          where: { id: booking.serviceId },
          data: {
            totalBookings: { increment: 1 },
          },
        });
      }
    }

    if (body.providerNotes !== undefined && (isProvider || isAdmin)) {
      updateData.providerNotes = sanitizeInput(body.providerNotes);
    }

    if (body.adminNotes !== undefined && isAdmin) {
      updateData.adminNotes = sanitizeInput(body.adminNotes);
    }

    const updatedBooking = await db.booking.update({
      where: { id: params.id },
      data: updateData,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
            businessName: true,
          },
        },
        service: {
          select: {
            id: true,
            title: true,
            description: true,
            basePrice: true,
            durationMinutes: true,
          },
        },
      },
    });

    // Create notification for status change
    let notificationUserId: string;
    let notificationType: string;
    let notificationTitle: string;
    let notificationMessage: string;

    if (body.status) {
      if (isClient && booking.providerUserId) {
        notificationUserId = booking.providerUserId;
        notificationType = 'BOOKING_CANCELLED';
        notificationTitle = 'Booking Cancelled';
        notificationMessage = `Booking #${booking.bookingNumber} has been cancelled by the client`;
      } else if (isProvider) {
        notificationUserId = booking.clientUserId;
        notificationType = body.status === 'ACCEPTED' ? 'BOOKING_ACCEPTED' : 'BOOKING_' + body.status;
        notificationTitle = `Booking ${body.status}`;
        notificationMessage = `Your booking #${booking.bookingNumber} has been ${body.status.toLowerCase()}`;
      }

      if (notificationUserId) {
        await db.notification.create({
          data: {
            userId: notificationUserId,
            type: notificationType as any,
            title: notificationTitle,
            message: notificationMessage,
            link: `/bookings/${booking.id}`,
          },
        });
      }
    }

    return successResponse(updatedBooking);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    if (error.message === 'Forbidden') {
      return forbiddenResponse();
    }
    return handleApiError(error);
  }
}
