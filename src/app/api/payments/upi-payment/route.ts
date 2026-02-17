import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/middleware'
import { logger } from '@/lib/logger'
import { db } from '@/lib/db'
import { z } from 'zod'

// Input validation schema
const upiPaymentSchema = z.object({
  amount: z.number().min(1, 'Amount must be at least 1').max(100000, 'Amount too large'),
  upiId: z.string().regex(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/, 'Invalid UPI ID format'),
})

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { user, response } = await requireAuth(request)
    if (response) return response

    const body = await request.json()

    // Validate input
    const { amount, upiId } = upiPaymentSchema.parse(body)

    // Get Razorpay configuration
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET

    if (!razorpayKeyId || !razorpayKeySecret) {
      logger.error('Razorpay configuration missing')
      return NextResponse.json(
        { error: 'Payment service unavailable' },
        { status: 503 }
      )
    }

    // Create UPI payment link
    // In production, this would use Razorpay's UPI payment API
    const upiUrl = `upi://pay?pa=${upiId}&pn=Help2Earn&am=${amount}&cu=INR&tn=Subscription%20Payment`

    // Create payment record for tracking
    const payment = await db.payment.create({
      data: {
        userId: user.id,
        amount: amount / 100, // Convert from paisa to rupees for storage
        status: 'PENDING',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        utiRef: `upi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      }
    })

    logger.info('UPI payment initiated', {
      userId: user.id,
      paymentId: payment.id,
      amount: payment.amount,
      upiId: upiId.replace(/(.{3}).*@/, '$1***@') // Log masked UPI ID
    })

    return NextResponse.json({
      success: true,
      upiUrl,
      paymentId: payment.id,
      amount: payment.amount,
      upiId: upiId.replace(/(.{3}).*@/, '$1***@'), // Return masked UPI ID
      instructions: {
        step1: 'Click the UPI URL to open your UPI app',
        step2: 'Complete the payment in your UPI app',
        step3: 'Return to Help2Earn - your subscription will be activated automatically',
        note: 'Do not close this page until payment is complete'
      }
    })

  } catch (error) {
    logger.error('UPI payment initiation error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate UPI payment' },
      { status: 500 }
    )
  }
}
