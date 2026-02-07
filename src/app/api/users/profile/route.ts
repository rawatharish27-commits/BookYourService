// Production-grade user profile API
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/api/auth';
import { successResponse, notFoundResponse, unauthorizedResponse, handleApiError } from '@/lib/api/response';
import { sanitizeInput } from '@/lib/api/validation';
import { UpdateProfileInput } from '@/lib/api/types';

// GET current user profile
export async function GET() {
  try {
    const auth = await requireAuth();

    const user = await db.user.findUnique({
      where: { id: auth.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        role: true,
        status: true,
        emailVerified: true,
        phoneVerified: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        country: true,
        businessName: true,
        description: true,
        experienceYears: true,
        trustScore: true,
        totalReviews: true,
        totalBookings: true,
        totalEarnings: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      return notFoundResponse('User not found');
    }

    return successResponse(user);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    return handleApiError(error);
  }
}

// PATCH update user profile
export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAuth();
    const body: UpdateProfileInput = await request.json();

    // Build update data
    const updateData: any = {};

    if (body.name !== undefined) updateData.name = sanitizeInput(body.name);
    if (body.phone !== undefined) updateData.phone = sanitizeInput(body.phone);
    if (body.avatar !== undefined) updateData.avatar = body.avatar;
    if (body.address !== undefined) updateData.address = sanitizeInput(body.address);
    if (body.city !== undefined) updateData.city = sanitizeInput(body.city);
    if (body.state !== undefined) updateData.state = sanitizeInput(body.state);
    if (body.zipCode !== undefined) updateData.zipCode = sanitizeInput(body.zipCode);
    if (body.description !== undefined) updateData.description = sanitizeInput(body.description);
    if (body.experienceYears !== undefined) updateData.experienceYears = body.experienceYears;

    // Provider-specific fields
    if (auth.user.role === 'PROVIDER') {
      if (body.businessName !== undefined) updateData.businessName = sanitizeInput(body.businessName);
    }

    // Update user
    const user = await db.user.update({
      where: { id: auth.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        role: true,
        status: true,
        emailVerified: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        businessName: true,
        description: true,
        experienceYears: true,
        trustScore: true,
        totalReviews: true,
        totalBookings: true,
        totalEarnings: true,
        updatedAt: true,
      },
    });

    return successResponse(user);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    return handleApiError(error);
  }
}
