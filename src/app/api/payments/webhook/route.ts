import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { db } from '@/lib/db'
import crypto from 'crypto'

// Webhook for Razorpay payment events
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature')

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || '')
      .update(body)
      .digest('hex')

    if (!signature || signature !== expectedSignature) {
      logger.warn('Invalid webhook signature', {
        receivedSignature: signature?.substring(0, 10) + '...',
        expectedSignature: expectedSignature.substring(0, 10) + '...'
      })
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    const event = JSON.parse(body)

    logger.info('Payment webhook received', {
      eventType: event.event,
      paymentId: event.payload?.payment?.entity?.id,
      orderId: event.payload?.payment?.entity?.order_id
    })

    // Handle different webhook events
    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event.payload.payment.entity)
        break

      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment.entity)
        break

      case 'order.paid':
        await handleOrderPaid(event.payload.order.entity)
        break

      default:
        logger.info('Unhandled webhook event', { eventType: event.event })
    }

    return NextResponse.json({ status: 'ok' })

  } catch (error) {
    logger.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Handle successful payment capture
async function handlePaymentCaptured(payment: any) {
  try {
    const { id: paymentId, order_id, amount, notes } = payment

    // Find existing payment record
    const existingPayment = await db.payment.findFirst({
      where: { utiRef: paymentId }
    })

    if (existingPayment) {
      // Update existing payment
      await db.payment.update({
        where: { id: existingPayment.id },
        data: { status: 'APPROVED' }
      })

      // Update user subscription
      const activeTill = new Date()
      activeTill.setDate(activeTill.getDate() + 30)

      await db.user.update({
        where: { id: existingPayment.userId },
        data: {
          paymentActive: true,
          activeTill
        }
      })

      logger.info('Payment captured via webhook', {
        paymentId: existingPayment.id,
        userId: existingPayment.userId,
        amount: existingPayment.amount
      })

    } else {
      logger.warn('Payment not found for webhook', { paymentId })
    }

  } catch (error) {
    logger.error('Handle payment captured error:', error)
  }
}

// Handle payment failure
async function handlePaymentFailed(payment: any) {
  try {
    const { id: paymentId } = payment

    // Update payment status
    const existingPayment = await db.payment.findFirst({
      where: { utiRef: paymentId }
    })

    if (existingPayment) {
      await db.payment.update({
        where: { id: existingPayment.id },
        data: { status: 'REJECTED' }
      })

      logger.info('Payment failed via webhook', {
        paymentId: existingPayment.id,
        userId: existingPayment.userId
      })
    }

  } catch (error) {
    logger.error('Handle payment failed error:', error)
  }
}

// Handle order paid
async function handleOrderPaid(order: any) {
  try {
    const { id: orderId, amount_paid } = order

    logger.info('Order paid via webhook', {
      orderId,
      amountPaid: amount_paid
    })

  } catch (error) {
    logger.error('Handle order paid error:', error)
  }
}
