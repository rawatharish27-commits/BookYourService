// Production-grade categories API
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/api/auth';
import { successResponse, badRequestResponse, unauthorizedResponse, forbiddenResponse, handleApiError } from '@/lib/api/response';
import { sanitizeInput } from '@/lib/api/validation';
import { generateSlug } from '@/lib/api/crypto';
import { CreateCategoryInput } from '@/lib/api/types';

// GET all categories
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const categories = await db.category.findMany({
      where: includeInactive ? undefined : { isActive: true },
      orderBy: { order: 'asc' },
      include: {
        subCategories: {
          where: includeInactive ? undefined : { isActive: true },
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            services: includeInactive ? undefined : {
              where: { status: 'ACTIVE' }
            },
          },
        },
      },
    });

    return successResponse(categories);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST create category (admin only)
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    const body: CreateCategoryInput = await request.json();

    // Validate input
    if (!body.name || body.name.trim().length < 2) {
      return badRequestResponse('Name must be at least 2 characters');
    }

    const slug = generateSlug(body.name);

    // Check if category with same slug exists
    const existingCategory = await db.category.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      return badRequestResponse('Category with similar name already exists');
    }

    const category = await db.category.create({
      data: {
        name: sanitizeInput(body.name),
        slug,
        description: body.description ? sanitizeInput(body.description) : null,
        icon: body.icon || null,
        image: body.image || null,
        isActive: true,
        order: body.order || 0,
      },
    });

    return successResponse(category);
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
