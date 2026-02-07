// Production-grade review detail API
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, requireAdmin } from '@/lib/api/auth';
import { successResponse, notFoundResponse, badRequestResponse, unauthorizedResponse, forbiddenResponse, handleApiError } from '@/lib/api/response';
import { sanitizeInput } from '@/lib/api/validation';

// GET review by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth();

    const review = await db.review.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            email: auth.user.role === 'ADMIN',
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
    });

    if (!review) {
      return notFoundResponse('Review not found');
    }

    // Non-admin users can only see approved reviews
    if (auth.user.role !== 'ADMIN' && !review.isApproved) {
      return forbiddenResponse('Review is not yet approved');
    }

    return successResponse(review);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    return handleApiError(error);
  }
}

// PATCH update review (admin only - approve/reject/flag)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdmin();

    const review = await db.review.findUnique({
      where: { id: params.id },
    });

    if (!review) {
      return notFoundResponse('Review not found');
    }

    const body = await request.json();

    const updateData: any = {};

    if (body.isApproved !== undefined) {
      updateData.isApproved = body.isApproved;

      // If approving, update service and provider ratings
      if (body.isApproved && !review.isApproved) {
        // Update service average rating
        const serviceReviews = await db.review.findMany({
          where: {
            serviceId: review.serviceId,
            isApproved: true,
          },
        });

        const totalRating = serviceReviews.reduce((sum, r) => sum + r.rating, 0) + review.rating;
        const avgRating = totalRating / (serviceReviews.length + 1);

        await db.service.update({
          where: { id: review.serviceId },
          data: {
            averageRating: Math.round(avgRating * 10) / 10,
          },
        });

        // Update provider rating
        const providerReviews = await db.review.findMany({
          where: {
            providerId: review.providerId,
            isApproved: true,
          },
        });

        const totalProviderRating = providerReviews.reduce((sum, r) => sum + r.rating, 0) + review.rating;
        const avgProviderRating = totalProviderRating / (providerReviews.length + 1);

        await db.user.update({
          where: { id: review.providerId },
          data: {
            totalReviews: { increment: 1 },
            trustScore: Math.round(avgProviderRating * 10) / 10,
          },
        });

        // Create notification for provider
        await db.notification.create({
          data: {
            userId: review.providerId,
            type: 'REVIEW_RECEIVED',
            title: 'New Review Received',
            message: `You received a ${review.rating}-star review`,
            link: `/services/${review.serviceId}`,
          },
        });
      }
    }

    if (body.flagged !== undefined) {
      updateData.flagged = body.flagged;
    }

    if (body.moderationNote !== undefined) {
      updateData.moderationNote = sanitizeInput(body.moderationNote);
    }

    const updatedReview = await db.review.update({
      where: { id: params.id },
      data: updateData,
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

    return successResponse(updatedReview);
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

// DELETE review (admin only or own review within 24 hours)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth();

    const review = await db.review.findUnique({
      where: { id: params.id },
    });

    if (!review) {
      return notFoundResponse('Review not found');
    }

    // Check permissions
    const isOwnReview = review.userId === auth.user.id;
    const isAdmin = auth.user.role === 'ADMIN';
    const isWithin24Hours = Date.now() - new Date(review.createdAt).getTime() < 24 * 60 * 60 * 1000;

    if (!isAdmin && !(isOwnReview && isWithin24Hours)) {
      return forbiddenResponse('You can only delete your own review within 24 hours');
    }

    await db.review.delete({
      where: { id: params.id },
    });

    return successResponse({ message: 'Review deleted successfully' });
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
