import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authRateLimit } from '@/lib/rate-limit'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { withLogging, withRateLimit, ApiResponse } from '@/lib/middleware'
import { generateToken } from '@/lib/auth'
import { gamificationManager } from '@/lib/gamification'

// Input validation schema
const verifyOtpSchema = z.object({
  phone: z.string()
    .regex(/^[6-9]\d{9}$/, 'Valid 10-digit Indian phone number required')
    .length(10, 'Phone number must be exactly 10 digits'),
  otp: z.string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only digits'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name too long').optional(),
  tempReferralCode: z.string().optional()
})

async function verifyOtp(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, otp, name, tempReferralCode } = verifyOtpSchema.parse(body)

    // Find the OTP record
    const otpRecord = await db.oTP.findFirst({
      where: {
        phone,
        code: otp,
        used: false,
        expiresAt: { gt: new Date() }
      }
    })

    if (!otpRecord) {
      return ApiResponse.error('Invalid or expired OTP', 400)
    }

    // Mark OTP as used
    await db.oTP.update({
      where: { id: otpRecord.id },
      data: { used: true }
    })

    // Find or create user
    let user = await db.user.findUnique({
      where: { phone }
    })

    const isNewUser = !user
    let referrerId: string | null = null

    if (!user) {
      // Handle referral if tempReferralCode provided
      if (tempReferralCode) {
        // Find referrer by temp code (TEMP-REF-XXXX format)
        const referrer = await db.user.findFirst({
          where: {
            referralCode: tempReferralCode
          }
        })

        if (referrer) {
          referrerId = referrer.id
        }
      }

      // Generate permanent referral code
      const permanentCode = `H2E-${name ? name.substring(0, 3).toUpperCase() : 'USER'}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

      // Create new user
      user = await db.user.create({
        data: {
          id: uuidv4(),
          phone,
          name: name || null,
          trustScore: 50, // Default trust score
          paymentActive: false,
          isFrozen: false,
          referralCode: permanentCode,
          referredBy: referrerId,
          referralCount: 0,
          totalHelpsGiven: 0,
          totalHelpsTaken: 0
        }
      })

      // Process referral if referrer found
      if (referrerId) {
        await gamificationManager.processReferralSignup(tempReferralCode, user.id)
      }
    } else if (name && !user.name) {
      // Update name if provided and not set
      user = await db.user.update({
        where: { id: user.id },
        data: { name }
      })
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      phone: user.phone,
      isAdmin: user.isAdmin
    })

    // Update last active
    await db.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() }
    })

    // Log successful login
    await db.activityLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        details: `OTP verification successful${isNewUser ? ' (new user)' : ''}${referrerId ? ' (via referral)' : ''}`
      }
    })

    return ApiResponse.success({
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        trustScore: user.trustScore,
        paymentActive: user.paymentActive,
        isAdmin: user.isAdmin,
        isFrozen: user.isFrozen,
        referralCode: user.referralCode
      },
      token,
      isNewUser
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return ApiResponse.validationError(error.flatten().fieldErrors)
    }

    throw error // Let middleware handle it
  }
}

// Export wrapped handler
export const POST = withRateLimit(
  withLogging(verifyOtp),
  authRateLimit
)
