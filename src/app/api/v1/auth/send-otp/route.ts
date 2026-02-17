import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { authRateLimit } from '@/lib/rate-limit'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { withLogging, withRateLimit, ApiResponse } from '@/lib/middleware'

// Input validation schema
const sendOtpSchema = z.object({
  phone: z.string()
    .regex(/^[6-9]\d{9}$/, 'Valid 10-digit Indian phone number required')
    .length(10, 'Phone number must be exactly 10 digits')
})

async function sendOtp(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone } = sendOtpSchema.parse(body)

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

    // Delete any existing OTPs for this phone
    await db.oTP.deleteMany({
      where: { phone }
    })

    // Create new OTP
    await db.oTP.create({
      data: {
        id: uuidv4(),
        phone,
        code,
        expiresAt
      }
    })

    // TODO: Send OTP via SMS service (Twilio, MSG91, etc.)
    // For now, we'll log it (in production, remove this log)
    console.log(`OTP for ${phone}: ${code}`)

    return ApiResponse.success({
      message: 'OTP sent successfully',
      expiresIn: 300 // 5 minutes
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
  withLogging(sendOtp),
  authRateLimit
)
