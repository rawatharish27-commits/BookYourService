import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/middleware'
import { logger } from '@/lib/logger'
import { z } from 'zod'

// Input validation schema
const createOrderSchema = z.object({
  amount: z.number().min(1, 'Amount must be at least 1').max(100000, 'Amount too large'),
  currency: z.string().default('INR'),
})

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { user, response } = await requireAuth(request)
    if (response) return response

    const body = await request.json()

    // Validate input
    const { amount, currency } = createOrderSchema.parse(body)

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

    // Create order with Razorpay
    const orderData = {
      amount: amount, // Amount in paisa
      currency,
      receipt: `rcpt_${Date.now()}_${user.id}`,
      notes: {
        userId: user.id,
        userPhone: user.phone,
      }
    }

    // In production, this would call Razorpay API
    // For now, we'll simulate the order creation
    const order = {
      id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      entity: 'order',
      amount: orderData.amount,
      amount_paid: 0,
      amount_due: orderData.amount,
      currency: orderData.currency,
      receipt: orderData.receipt,
      offer_id: null,
      status: 'created',
      attempts: 0,
      notes: orderData.notes,
      created_at: Math.floor(Date.now() / 1000)
    }

    logger.info('Payment order created', {
      orderId: order.id,
      userId: user.id,
      amount: order.amount
    })

    return NextResponse.json({
      success: true,
      order,
      key: razorpayKeyId
    })

  } catch (error) {
    logger.error('Create order error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment order' },
      { status: 500 }
    )
  }
}
