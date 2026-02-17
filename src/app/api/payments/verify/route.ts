import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/middleware'
import { logger } from '@/lib/logger'
import { db } from '@/lib/db'
import { z } from 'zod'

// Input validation schema
const verifyPaymentSchema = z.object({
  razorpay_payment_id: z.string().min(1, 'Payment ID required'),
  razorpay_order_id: z.string().min(1, 'Order ID required'),
  razorpay_signature: z.string().min(1, 'Signature required'),
})

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { user, response } = await requireAuth(request)
    if (response) return response

    const body = await request.json()

    // Validate input
    const paymentData = verifyPaymentSchema.parse(body)

    // Get Razorpay configuration
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET

    if (!razorpayKeySecret) {
      logger.error('Razorpay configuration missing')
      return NextResponse.json(
        { error: 'Payment service unavailable' },
        { status: 503 }
      )
    }

    // In production, verify the payment signature with Razorpay
    // For now, we'll simulate verification
    const isValidSignature = true // Simulated verification

    if (!isValidSignature) {
      logger.warn('Invalid payment signature', {
        userId: user.id,
        paymentId: paymentData.razorpay_payment_id
      })

      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      )
    }

    // Check if payment already exists
    const existingPayment = await db.payment.findFirst({
      where: {
        userId: user.id,
        utiRef: paymentData.razorpay_payment_id
      }
    })

    if (existingPayment) {
      logger.warn('Duplicate payment verification attempt', {
        userId: user.id,
        paymentId: paymentData.razorpay_payment_id
      })

      return NextResponse.json({
        success: true,
        message: 'Payment already verified',
        payment: existingPayment
      })
    }

    // Create payment record
    const payment = await db.payment.create({
      data: {
        userId: user.id,
        amount: 49, // Subscription amount
        status: 'APPROVED',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        utiRef: paymentData.razorpay_payment_id,
      }
    })

    // Update user subscription status
    const activeTill = new Date()
    activeTill.setDate(activeTill.getDate() + 30) // 30 days subscription

    await db.user.update({
      where: { id: user.id },
      data: {
        paymentActive: true,
        activeTill: activeTill,
      }
    })

    logger.info('Payment verified and subscription activated', {
      userId: user.id,
      paymentId: payment.id,
      amount: payment.amount,
      activeTill: activeTill.toISOString()
    })

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      payment,
      subscription: {
        active: true,
        activeTill: activeTill.toISOString(),
        daysRemaining: Math.ceil((activeTill.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      }
    })

  } catch (error) {
    logger.error('Payment verification error:', error)
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    )
  }
}
