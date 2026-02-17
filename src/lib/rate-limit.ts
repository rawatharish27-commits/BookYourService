import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory rate limiting store
// In production, use Redis or similar
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

const WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const MAX_REQUESTS = 100 // requests per window

export function rateLimit(request: NextRequest): NextResponse | null {
  const ip = request.headers.get('x-forwarded-for') ||
             request.headers.get('x-real-ip') ||
             'unknown'

  const key = `${ip}-${request.nextUrl.pathname}`
  const now = Date.now()
  const windowStart = now - WINDOW_MS

  // Clean up old entries
  for (const [k, v] of rateLimitStore.entries()) {
    if (v.resetTime < windowStart) {
      rateLimitStore.delete(k)
    }
  }

  const current = rateLimitStore.get(key)

  if (!current || current.resetTime < windowStart) {
    // First request or window expired
    rateLimitStore.set(key, { count: 1, resetTime: now + WINDOW_MS })
    return null
  }

  if (current.count >= MAX_REQUESTS) {
    // Rate limit exceeded
    const resetTime = Math.ceil((current.resetTime - now) / 1000)
    return NextResponse.json(
      {
        error: 'Too many requests',
        retryAfter: resetTime
      },
      {
        status: 429,
        headers: {
          'Retry-After': resetTime.toString(),
          'X-RateLimit-Limit': MAX_REQUESTS.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': current.resetTime.toString()
        }
      }
    )
  }

  // Increment counter
  current.count++
  rateLimitStore.set(key, current)

  return null
}

// Stricter rate limiting for auth endpoints
export function authRateLimit(request: NextRequest): NextResponse | null {
  const ip = request.headers.get('x-forwarded-for') ||
             request.headers.get('x-real-ip') ||
             'unknown'

  const key = `auth-${ip}`
  const now = Date.now()
  const windowStart = now - (5 * 60 * 1000) // 5 minutes
  const MAX_AUTH_REQUESTS = 5 // requests per 5 minutes

  const current = rateLimitStore.get(key)

  if (!current || current.resetTime < windowStart) {
    rateLimitStore.set(key, { count: 1, resetTime: now + (5 * 60 * 1000) })
    return null
  }

  if (current.count >= MAX_AUTH_REQUESTS) {
    const resetTime = Math.ceil((current.resetTime - now) / 1000)
    return NextResponse.json(
      {
        error: 'Too many authentication attempts',
        retryAfter: resetTime
      },
      {
        status: 429,
        headers: {
          'Retry-After': resetTime.toString()
        }
      }
    )
  }

  current.count++
  rateLimitStore.set(key, current)

  return null
}
