// Production-grade services API
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, requireProviderOrAdmin } from '@/lib/api/auth';
import { successResponse, notFoundResponse, badRequestResponse, unauthorizedResponse, forbiddenResponse, handleApiError } from '@/lib/api/response';
import { sanitizeInput } from '@/lib/api/validation';
import { generateSlug } from '@/lib/api/crypto';
import { CreateServiceInput, ServiceFilters } from '@/lib/api/types';

// GET all services with filtering
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const filters: any = {
      status: 'ACTIVE',
      isAvailable: true,
    };

    const categoryId = searchParams.get('categoryId');
    const subCategoryId = searchParams.get('subCategoryId');
    const city = searchParams.get('city');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    if (categoryId) filters.categoryId = categoryId;
    if (subCategoryId) filters.subCategoryId = subCategoryId;
    if (city) filters.city = city;
    if (featured === 'true') filters.featured = true;
    if (minPrice) filters.basePrice = { ...filters.basePrice, gte: parseFloat(minPrice) };
    if (maxPrice) filters.basePrice = { ...filters.basePrice, lte: parseFloat(maxPrice) };
    if (search) {
      filters.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const skip = (page - 1) * limit;

    const [services, total] = await Promise.all([
      db.service.findMany({
        where: filters,
        include: {
          provider: {
            select: {
              id: true,
              name: true,
              avatar: true,
              businessName: true,
              trustScore: true,
              totalReviews: true,
              city: true,
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
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      db.service.count({ where: filters }),
    ]);

    return successResponse(services, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST create service (provider/admin only)
export async function POST(request: NextRequest) {
  try {
    const auth = await requireProviderOrAdmin();
    const body: CreateServiceInput = await request.json();

    // Validate input
    const validationErrors: Record<string, string> = {};

    if (!body.title || body.title.trim().length < 5) {
      validationErrors.title = 'Title must be at least 5 characters';
    }

    if (!body.description || body.description.trim().length < 20) {
      validationErrors.description = 'Description must be at least 20 characters';
    }

    if (!body.basePrice || body.basePrice < 0) {
      validationErrors.basePrice = 'Invalid price';
    }

    if (!body.durationMinutes || body.durationMinutes < 15 || body.durationMinutes > 480) {
      validationErrors.durationMinutes = 'Duration must be between 15 and 480 minutes';
    }

    if (!body.images || !Array.isArray(body.images) || body.images.length === 0) {
      validationErrors.images = 'At least one image is required';
    }

    if (!body.categoryId) {
      validationErrors.categoryId = 'Category is required';
    }

    if (Object.keys(validationErrors).length > 0) {
      return badRequestResponse(JSON.stringify(validationErrors));
    }

    const slug = generateSlug(body.title);

    // Check if provider exists
    const provider = await db.user.findUnique({
      where: { id: auth.user.id },
    });

    if (!provider || provider.status !== 'ACTIVE') {
      return badRequestResponse('Provider account is not active');
    }

    const providerId = auth.user.role === 'ADMIN' && body.providerId ? body.providerId : auth.user.id;

    // Create service
    const service = await db.service.create({
      data: {
        providerId,
        categoryId: body.categoryId,
        subCategoryId: body.subCategoryId || null,
        title: sanitizeInput(body.title),
        slug,
        description: sanitizeInput(body.description),
        basePrice: body.basePrice,
        durationMinutes: body.durationMinutes,
        location: body.location ? sanitizeInput(body.location) : null,
        city: body.city ? sanitizeInput(body.city) : provider.city,
        images: JSON.stringify(body.images),
        status: 'PENDING_APPROVAL',
        isAvailable: true,
        providerName: provider.name,
        providerAvatar: provider.avatar,
        providerRating: provider.trustScore,
        availabilitySlots: {
          create: body.availabilitySlots.map(slot => ({
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
          })),
        },
      },
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
        availabilitySlots: true,
      },
    });

    return successResponse(service);
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
