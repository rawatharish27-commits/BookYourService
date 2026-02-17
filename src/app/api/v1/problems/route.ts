import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'
import { withLogging, withRateLimit, requireAuth, ApiResponse, AuthenticatedUser } from '@/lib/middleware'
import { authRateLimit } from '@/lib/rate-limit'

// Input validation schemas
const getProblemsSchema = z.object({
  userId: z.string().optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'CLOSED', 'EXPIRED', 'CANCELLED']).optional(),
  type: z.enum(['EMERGENCY', 'TIME_ACCESS', 'RESOURCE_RENT']).optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0)
})

const createProblemSchema = z.object({
  type: z.enum(['EMERGENCY', 'TIME_ACCESS', 'RESOURCE_RENT']),
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description too long'),
  offerPrice: z.number().min(0).max(10000).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  locationText: z.string().max(200).optional()
})

// GET - Get all problems (with filters)
async function getProblems(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Validate query parameters
    const queryParams = {
      userId: searchParams.get('userId'),
      status: searchParams.get('status'),
      type: searchParams.get('type'),
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset')
    }

    const validatedQuery = getProblemsSchema.parse(queryParams)

    const where: Record<string, unknown> = {}

    if (validatedQuery.userId) {
      where.userId = validatedQuery.userId
    }

    if (validatedQuery.status) {
      where.status = validatedQuery.status
    }

    if (validatedQuery.type) {
      where.type = validatedQuery.type
    }

    // Only show non-expired problems by default
    where.expiresAt = { gt: new Date() }
    where.status = 'OPEN'

    const problems = await db.problem.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            phone: true,
            name: true,
            trustScore: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: validatedQuery.limit,
      skip: validatedQuery.offset
    })

    const formattedProblems = problems.map(p => ({
      id: p.id,
      userId: p.userId,
      type: p.type,
      riskLevel: p.riskLevel,
      category: p.category,
      title: p.title,
      description: p.description,
      offerPrice: p.offerPrice,
      latitude: p.latitude,
      longitude: p.longitude,
      locationText: p.locationText,
      minTrustRequired: p.minTrustRequired,
      status: p.status,
      viewCount: p.viewCount,
      callCount: p.callCount,
      createdAt: p.createdAt.toISOString(),
      expiresAt: p.expiresAt?.toISOString() || null,
      user: {
        id: p.user.id,
        phone: p.user.phone,
        name: p.user.name,
        trustScore: p.user.trustScore
      }
    }))

    return ApiResponse.success({
      problems: formattedProblems,
      pagination: {
        limit: validatedQuery.limit,
        offset: validatedQuery.offset,
        hasMore: problems.length === validatedQuery.limit
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return ApiResponse.validationError(error.flatten().fieldErrors)
    }

    throw error // Let middleware handle it
  }
}

// POST - Create new problem
async function createProblem(request: NextRequest) {
  try {
    // Require authentication
    const { user, response } = await requireAuth(request)
    if (response) return response

    const body = await request.json()
    const validatedData = createProblemSchema.parse(body)

    // Check user payment status
    const dbUser = await db.user.findUnique({
      where: { id: user.id }
    })

    if (!dbUser || !dbUser.paymentActive) {
      return ApiResponse.forbidden('Active subscription required to post problems')
    }

    // Determine risk level based on type
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW'
    let minTrustRequired = 40

    if (validatedData.type === 'TIME_ACCESS') {
      riskLevel = 'MEDIUM'
      minTrustRequired = 50
    } else if (validatedData.type === 'RESOURCE_RENT') {
      riskLevel = 'HIGH'
      minTrustRequired = 70
    }

    // Check daily post limit
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayPosts = await db.problem.count({
      where: {
        userId: user.id,
        createdAt: { gte: today }
      }
    })

    if (todayPosts >= 3) {
      return ApiResponse.error('Daily post limit (3) reached', 429)
    }

    // Set expiry to 24 hours from now
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    const problem = await db.problem.create({
      data: {
        id: uuidv4(),
        userId: user.id,
        type: validatedData.type,
        riskLevel,
        title: validatedData.title,
        description: validatedData.description,
        offerPrice: validatedData.offerPrice || null,
        latitude: validatedData.latitude || dbUser.latitude,
        longitude: validatedData.longitude || dbUser.longitude,
        locationText: validatedData.locationText,
        minTrustRequired,
        expiresAt
      }
    })

    return ApiResponse.success({
      problem: {
        id: problem.id,
        type: problem.type,
        riskLevel: problem.riskLevel,
        title: problem.title,
        description: problem.description,
        offerPrice: problem.offerPrice,
        latitude: problem.latitude,
        longitude: problem.longitude,
        locationText: problem.locationText,
        minTrustRequired: problem.minTrustRequired,
        status: problem.status,
        createdAt: problem.createdAt.toISOString(),
        expiresAt: problem.expiresAt?.toISOString() || null
      }
    }, 201)

  } catch (error) {
    if (error instanceof z.ZodError) {
      return ApiResponse.validationError(error.flatten().fieldErrors)
    }

    throw error // Let middleware handle it
  }
}

// Export wrapped handlers
export const GET = withRateLimit(
  withLogging(getProblems),
  authRateLimit
)

export const POST = withRateLimit(
  withLogging(createProblem),
  authRateLimit
)
