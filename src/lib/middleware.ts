import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from './auth'
import { logger } from './logger'
import { db } from './db'

// User context interface
export interface AuthenticatedUser {
  id: string
  phone: string
  isAdmin: boolean
  isFrozen: boolean
}

// Extended NextRequest with user context
export interface AuthenticatedRequest extends NextRequest {
  user?: AuthenticatedUser
}

// Authentication middleware
export async function authenticateRequest(request: NextRequest): Promise<{
  user: AuthenticatedUser | null
  response: NextResponse | null
}> {
  try {
    // Get token from httpOnly cookie
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return { user: null, response: null }
    }

    // Verify JWT token
    const payload = verifyToken(token)

    if (!payload || !payload.userId) {
      logger.warn('Invalid JWT token', {
        path: new URL(request.url).pathname,
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      })
      return { user: null, response: null }
    }

    // Get user from database to ensure they still exist and aren't frozen
    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        phone: true,
        isAdmin: true,
        isFrozen: true
      }
    })

    if (!user) {
      logger.warn('User not found for valid token', {
        userId: payload.userId,
        path: new URL(request.url).pathname
      })
      return { user: null, response: null }
    }

    if (user.isFrozen) {
      logger.warn('Frozen user attempted access', {
        userId: user.id,
        path: new URL(request.url).pathname
      })

      const response = NextResponse.json(
        { error: 'Account is frozen. Please contact support.' },
        { status: 403 }
      )

      // Clear the cookie
      response.cookies.set('auth-token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0
      })

      return { user: null, response }
    }

    return {
      user: {
        id: user.id,
        phone: user.phone,
        isAdmin: user.isAdmin,
        isFrozen: user.isFrozen
      },
      response: null
    }

  } catch (error) {
    logger.error('Authentication middleware error', {
      path: new URL(request.url).pathname,
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : {
        name: 'UnknownError',
        message: 'Unknown error occurred'
      }
    })

    return { user: null, response: null }
  }
}

// Require authentication middleware
export async function requireAuth(request: NextRequest): Promise<{
  user: AuthenticatedUser
  response: NextResponse | null
}> {
  const { user, response } = await authenticateRequest(request)

  if (response) {
    return { user: null as any, response }
  }

  if (!user) {
    return {
      user: null as any,
      response: NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
  }

  return { user, response: null }
}

// Require admin middleware
export async function requireAdmin(request: NextRequest): Promise<{
  user: AuthenticatedUser
  response: NextResponse | null
}> {
  const { user, response } = await requireAuth(request)

  if (response) {
    return { user: null as any, response }
  }

  if (!user.isAdmin) {
    logger.warn('Non-admin user attempted admin access', {
      userId: user.id,
      path: new URL(request.url).pathname
    })

    return {
      user: null as any,
      response: NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }
  }

  return { user, response: null }
}

// API response helpers
export class ApiResponse {
  static success(data: any, status = 200) {
    return NextResponse.json(
      {
        success: true,
        data,
        timestamp: new Date().toISOString()
      },
      { status }
    )
  }

  static error(message: string, status = 400, code?: string) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message,
          code,
          timestamp: new Date().toISOString()
        }
      },
      { status }
    )
  }

  static unauthorized(message = 'Authentication required') {
    return this.error(message, 401, 'UNAUTHORIZED')
  }

  static forbidden(message = 'Access denied') {
    return this.error(message, 403, 'FORBIDDEN')
  }

  static notFound(message = 'Resource not found') {
    return this.error(message, 404, 'NOT_FOUND')
  }

  static validationError(errors: Record<string, string[]>) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: errors,
          timestamp: new Date().toISOString()
        }
      },
      { status: 422 }
    )
  }
}

// Request logging middleware wrapper
export function withLogging(handler: (request: NextRequest, context?: any) => Promise<NextResponse>) {
  return async (request: NextRequest, context?: any) => {
    const startTime = Date.now()
    const url = new URL(request.url)

    try {
      logger.info('API Request Started', {
        path: url.pathname,
        method: request.method,
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      })

      const result = await handler(request, context)
      const duration = Date.now() - startTime

      // Log successful response
      const statusCode = result?.status || 200
      logger.info('API Request Completed', {
        path: url.pathname,
        method: request.method,
        statusCode,
        duration,
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      })

      return result

    } catch (error) {
      const duration = Date.now() - startTime

      logger.error('API Request Failed', {
        path: url.pathname,
        method: request.method,
        duration,
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : {
          name: 'UnknownError',
          message: 'Unknown error occurred'
        }
      })

      // Return generic error response
      return ApiResponse.error('Internal server error', 500)
    }
  }
}

// Rate limiting wrapper
export function withRateLimit(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>,
  rateLimitFn: (request: NextRequest) => NextResponse | null
) {
  return async (request: NextRequest, context?: any) => {
    const rateLimitResponse = rateLimitFn(request)
    if (rateLimitResponse) {
      logger.warn('Rate limit exceeded', {
        path: new URL(request.url).pathname,
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      })
      return rateLimitResponse
    }

    return handler(request, context)
  }
}
