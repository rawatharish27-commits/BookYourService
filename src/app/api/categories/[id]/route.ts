// Production-grade category detail API
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/api/auth';
import { successResponse, notFoundResponse, badRequestResponse, unauthorizedResponse, forbiddenResponse, handleApiError } from '@/lib/api/response';
import { sanitizeInput } from '@/lib/api/validation';
import { generateSlug } from '@/lib/api/crypto';
import { UpdateCategoryInput } from '@/lib/api/types';

// GET category by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const category = await db.category.findUnique({
      where: { id: params.id },
      include: {
        subCategories: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
        services: {
          where: { status: 'ACTIVE', isAvailable: true },
          include: {
            provider: {
              select: {
                id: true,
                name: true,
                avatar: true,
                trustScore: true,
              },
            },
          },
          take: 10,
        },
      },
    });

    if (!category) {
      return notFoundResponse('Category not found');
    }

    return successResponse(category);
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH update category (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdmin();
    const body: UpdateCategoryInput = await request.json();

    const category = await db.category.findUnique({
      where: { id: params.id },
    });

    if (!category) {
      return notFoundResponse('Category not found');
    }

    const updateData: any = {};

    if (body.name !== undefined) {
      updateData.name = sanitizeInput(body.name);
      updateData.slug = generateSlug(body.name);
    }
    if (body.description !== undefined) {
      updateData.description = body.description ? sanitizeInput(body.description) : null;
    }
    if (body.icon !== undefined) updateData.icon = body.icon || null;
    if (body.image !== undefined) updateData.image = body.image || null;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.order !== undefined) updateData.order = body.order;

    const updatedCategory = await db.category.update({
      where: { id: params.id },
      data: updateData,
    });

    return successResponse(updatedCategory);
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

// DELETE category (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdmin();

    const category = await db.category.findUnique({
      where: { id: params.id },
    });

    if (!category) {
      return notFoundResponse('Category not found');
    }

    // Soft delete by setting isActive to false
    await db.category.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    return successResponse({ message: 'Category deleted successfully' });
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
