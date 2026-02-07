// Production-grade bookings API with state machine
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/api/auth';
import { successResponse, notFoundResponse, badRequestResponse, unauthorizedResponse, forbiddenResponse, handleApiError } from '@/lib/api/response';
import { sanitizeInput } from '@/lib/api/validation';
import { isValidDate, isValidTime, generateBookingNumber } from '@/lib/api/crypto';
import { CreateBookingInput, BookingFilters } from '@/lib/api/types';

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

// GET all bookings (filtered by user role)
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth();
    const searchParams = request.nextUrl.searchParams;

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    let filters: any = {};

    // Filter based on user role
    if (auth.user.role === 'CLIENT') {
      filters.clientUserId = auth.user.id;
    } else if (auth.user.role === 'PROVIDER') {
      filters.providerUserId = auth.user.id;
    }

    if (status) filters.status = status;

    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      db.booking.findMany({
        where: filters,
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
              images: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      db.booking.count({ where: filters }),
    ]);

    return successResponse(bookings, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    return handleApiError(error);
  }
}

// POST create booking (client only)
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();

    if (auth.user.role !== 'CLIENT') {
      return forbiddenResponse('Only clients can create bookings');
    }

    const body: CreateBookingInput = await request.json();

    // Validate input
    const validationErrors: Record<string, string> = {};

    if (!body.serviceId) {
      validationErrors.serviceId = 'Service ID is required';
    }

    if (!body.scheduledDate || !isValidDate(body.scheduledDate)) {
      validationErrors.scheduledDate = 'Invalid date (use YYYY-MM-DD format)';
    }

    if (!body.scheduledTime || !isValidTime(body.scheduledTime)) {
      validationErrors.scheduledTime = 'Invalid time (use HH:MM format)';
    }

    if (Object.keys(validationErrors).length > 0) {
      return badRequestResponse(JSON.stringify(validationErrors));
    }

    // Get service details
    const service = await db.service.findUnique({
      where: { id: body.serviceId },
      include: { provider: true },
    });

    if (!service) {
      return notFoundResponse('Service not found');
    }

    if (service.status !== 'ACTIVE' || !service.isAvailable) {
      return badRequestResponse('Service is not available for booking');
    }

    if (service.providerId === auth.user.id) {
      return badRequestResponse('Cannot book your own service');
    }

    // Calculate booking amount
    const platformFeePercent = 0.1; // 10% platform fee
    const platformFee = service.basePrice * platformFeePercent;
    const totalAmount = service.basePrice + platformFee;

    // Create booking
    const booking = await db.booking.create({
      data: {
        bookingNumber: generateBookingNumber(),
        clientUserId: auth.user.id,
        providerUserId: service.providerId,
        serviceId: body.serviceId,
        scheduledDate: body.scheduledDate,
        scheduledTime: body.scheduledTime,
        durationMinutes: service.durationMinutes,
        totalAmount,
        currency: service.currency,
        platformFee,
        address: body.address ? sanitizeInput(body.address) : service.location,
        city: body.city ? sanitizeInput(body.city) : service.city,
        clientNotes: body.clientNotes ? sanitizeInput(body.clientNotes) : null,
        status: 'PENDING',
        paymentStatus: 'PENDING',
      },
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

    // Create notification for provider
    await db.notification.create({
      data: {
        userId: service.providerId,
        type: 'BOOKING_CREATED',
        title: 'New Booking Request',
        message: `You have a new booking request for ${service.title}`,
        link: `/bookings/${booking.id}`,
      },
    });

    return successResponse(booking);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    return handleApiError(error);
  }
}
