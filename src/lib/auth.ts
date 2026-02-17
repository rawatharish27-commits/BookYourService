import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { db } from '@/lib/db'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = '7d'

export interface JWTPayload {
  userId: string
  phone: string
  isAdmin: boolean
}

// Generate JWT token
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

// JWT-based authentication
export async function authenticateRequest(request: NextRequest): Promise<{ user: any } | null> {
  try {
    // Get token from Authorization header or cookie
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('auth-token')?.value

    if (!token) {
      return null
    }

    const payload = verifyToken(token)
    if (!payload) {
      return null
    }

    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        phone: true,
        name: true,
        ageVerified: true,
        paymentActive: true,
        activeTill: true,
        trustScore: true,
        latitude: true,
        longitude: true,
        locationText: true,
        isAdmin: true,
        isFrozen: true,
        referralCode: true,
        referralCount: true,
        totalHelpsGiven: true,
        totalHelpsTaken: true,
        notifyNewRequests: true,
        notifyPayments: true,
        notifyReports: true,
        createdAt: true,
        lastActiveAt: true
      }
    })

    if (!user || user.isFrozen) {
      return null
    }

    return { user }
  } catch (error) {
    console.error('Auth error:', error)
    return null
  }
}

export function requireAuth(handler: Function) {
  return async (request: NextRequest, context?: any) => {
    const auth = await authenticateRequest(request)

    if (!auth) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Add user to request for use in handlers
    (request as any).user = auth.user

    return handler(request, context)
  }
}

export function requireAdmin(handler: Function) {
  return async (request: NextRequest, context?: any) => {
    const auth = await authenticateRequest(request)

    if (!auth || !auth.user.isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    (request as any).user = auth.user

    return handler(request, context)
  }
}
