// Production-grade reviews API
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, requireAdmin } from '@/lib/api/auth';
import { successResponse, notFoundResponse, badRequestResponse, unauthorizedResponse, forbiddenResponse, handleApiError } from '@/lib/api/response';
import { sanitizeInput, isValidRating } from '@/lib/api/validation';
import { CreateReviewInput, ReviewFilters } from '@/lib/api/types';

// GET all reviews with filtering
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const serviceId = searchParams.get('serviceId');
    const providerId = searchParams.get('providerId');
    const userId = searchParams.get('userId');
    const rating = searchParams.get('rating');
    const isApproved = searchParams.get('isApproved');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const filters: any = {
      isApproved: true, // Only show approved reviews by default
    };

    if (serviceId) filters.serviceId = serviceId;
    if (providerId) filters.providerId = providerId;
    if (userId) filters.userId = userId;
    if (rating) filters.rating = parseInt(rating);
    if (isApproved !== null) filters.isApproved = isApproved === 'true';

    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      db.review.findMany({
        where: filters,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          service: {
            select: {
              id: true,
              title: true,
            },
          },
          booking: {
            select: {
              id: true,
              bookingNumber: true,
              scheduledDate: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.review.count({ where: filters }),
    ]);

    return successResponse(reviews, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST create review (client only, after completed booking)
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();

    if (auth.user.role !== 'CLIENT') {
      return forbiddenResponse('Only clients can create reviews');
    }

    const body: CreateReviewInput = await request.json();

    // Validate input
    const validationErrors: Record<string, string> = {};

    if (!body.bookingId) {
      validationErrors.bookingId = 'Booking ID is required';
    }

    if (!body.serviceId) {
      validationErrors.serviceId = 'Service ID is required';
    }

    if (!body.providerId) {
      validationErrors.providerId = 'Provider ID is required';
    }

    if (!body.rating || !isValidRating(body.rating)) {
      validationErrors.rating = 'Rating must be between 1 and 5';
    }

    if (body.title && body.title.trim().length > 100) {
      validationErrors.title = 'Title must not exceed 100 characters';
    }

    if (body.comment && body.comment.trim().length > 1000) {
      validationErrors.comment = 'Comment must not exceed 1000 characters';
    }

    if (Object.keys(validationErrors).length > 0) {
      return badRequestResponse(JSON.stringify(validationErrors));
    }

    // Check if booking exists and is completed
    const booking = await db.booking.findUnique({
      where: { id: body.bookingId },
      include: { service: true },
    });

    if (!booking) {
      return notFoundResponse('Booking not found');
    }

    if (booking.status !== 'COMPLETED') {
      return badRequestResponse('Can only review completed bookings');
    }

    if (booking.clientUserId !== auth.user.id) {
      return forbiddenResponse('You can only review your own bookings');
    }

    // Check if review already exists
    const existingReview = await db.review.findUnique({
      where: { bookingId: body.bookingId },
    });

    if (existingReview) {
      return badRequestResponse('Review already exists for this booking');
    }

    // Create review
    const review = await db.review.create({
      data: {
        bookingId: body.bookingId,
        serviceId: body.serviceId,
        userId: auth.user.id,
        providerId: body.providerId,
        rating: body.rating,
        title: body.title ? sanitizeInput(body.title) : null,
        comment: body.comment ? sanitizeInput(body.comment) : null,
        isApproved: false, // Requires admin approval
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        service: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Update service rating (after approval, will be updated)
    // For now, we'll update the stats
    await db.service.update({
      where: { id: body.serviceId },
      data: {
        totalReviews: { increment: 1 },
      },
    });

    return successResponse(review);
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
