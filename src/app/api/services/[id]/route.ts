// Production-grade service detail API
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, requireProviderOrAdmin } from '@/lib/api/auth';
import { successResponse, notFoundResponse, badRequestResponse, unauthorizedResponse, forbiddenResponse, handleApiError } from '@/lib/api/response';
import { sanitizeInput } from '@/lib/api/validation';
import { generateSlug } from '@/lib/api/crypto';
import { UpdateServiceInput } from '@/lib/api/types';

// GET service by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const service = await db.service.findUnique({
      where: { id: params.id },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
            businessName: true,
            description: true,
            experienceYears: true,
            trustScore: true,
            totalReviews: true,
            totalBookings: true,
            city: true,
            createdAt: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
          },
        },
        subCategory: {
          select: {
            id: true,
            name: true,
          },
        },
        availabilitySlots: {
          where: { isActive: true },
        },
        reviews: {
          where: { isApproved: true },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!service) {
      return notFoundResponse('Service not found');
    }

    return successResponse(service);
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH update service (provider/admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireProviderOrAdmin();
    const body: UpdateServiceInput = await request.json();

    const service = await db.service.findUnique({
      where: { id: params.id },
    });

    if (!service) {
      return notFoundResponse('Service not found');
    }

    // Check ownership
    if (auth.user.role !== 'ADMIN' && service.providerId !== auth.user.id) {
      return forbiddenResponse('You do not have permission to update this service');
    }

    const updateData: any = {};

    if (body.title !== undefined) {
      updateData.title = sanitizeInput(body.title);
      updateData.slug = generateSlug(body.title);
    }
    if (body.description !== undefined) updateData.description = sanitizeInput(body.description);
    if (body.basePrice !== undefined) updateData.basePrice = body.basePrice;
    if (body.durationMinutes !== undefined) updateData.durationMinutes = body.durationMinutes;
    if (body.location !== undefined) updateData.location = body.location ? sanitizeInput(body.location) : null;
    if (body.city !== undefined) updateData.city = body.city ? sanitizeInput(body.city) : null;
    if (body.images !== undefined) updateData.images = JSON.stringify(body.images);
    if (body.isAvailable !== undefined) updateData.isAvailable = body.isAvailable;

    const updatedService = await db.service.update({
      where: { id: params.id },
      data: updateData,
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            avatar: true,
            businessName: true,
            trustScore: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return successResponse(updatedService);
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

// DELETE service (provider/admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireProviderOrAdmin();

    const service = await db.service.findUnique({
      where: { id: params.id },
    });

    if (!service) {
      return notFoundResponse('Service not found');
    }

    // Check ownership
    if (auth.user.role !== 'ADMIN' && service.providerId !== auth.user.id) {
      return forbiddenResponse('You do not have permission to delete this service');
    }

    // Check if service has active bookings
    const activeBookings = await db.booking.count({
      where: {
        serviceId: params.id,
        status: { in: ['PENDING', 'ACCEPTED', 'IN_PROGRESS'] },
      },
    });

    if (activeBookings > 0) {
      return badRequestResponse('Cannot delete service with active bookings');
    }

    // Soft delete by setting status to INACTIVE
    await db.service.update({
      where: { id: params.id },
      data: { 
        status: 'INACTIVE',
        isAvailable: false,
      },
    });

    return successResponse({ message: 'Service deleted successfully' });
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
