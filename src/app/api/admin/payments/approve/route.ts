import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/middleware'
import { logger } from '@/lib/logger'
import { db } from '@/lib/db'
import { z } from 'zod'

// Input validation schema
const approvePaymentSchema = z.object({
  paymentId: z.string().min(1, 'Payment ID required'),
  action: z.enum(['APPROVE', 'REJECT'], {
    errorMap: () => ({ message: 'Action must be APPROVE or REJECT' })
  }),
  notes: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const { user, response } = await requireAdmin(request)
    if (response) return response

    const body = await request.json()

    // Validate input
    const approvalData = approvePaymentSchema.parse(body)

    // Get payment details
    const payment = await db.payment.findUnique({
      where: { id: approvalData.paymentId },
      include: {
        user: {
          select: {
            id: true,
            phone: true,
            name: true,
            trustScore: true,
            isFrozen: true
          }
        }
      }
    })

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    if (payment.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Payment is not in pending status' },
        { status: 400 }
      )
    }

    // Check SLA (max 4 hours for approval)
    const paymentAge = Date.now() - payment.createdAt.getTime()
    const maxAge = 4 * 60 * 60 * 1000 // 4 hours in milliseconds

    if (paymentAge > maxAge) {
      logger.warn('Payment approval SLA breached', {
        paymentId: payment.id,
        age: paymentAge,
        maxAge,
        adminId: user.id
      })
    }

    let newStatus: 'APPROVED' | 'REJECTED' = 'REJECTED'
    let subscriptionActivated = false

    if (approvalData.action === 'APPROVE') {
      newStatus = 'APPROVED'

      // Activate subscription for approved payments
      const activeTill = new Date()
      activeTill.setDate(activeTill.getDate() + 30) // 30 days subscription

      await db.user.update({
        where: { id: payment.userId },
        data: {
          paymentActive: true,
          activeTill: activeTill,
        }
      })

      subscriptionActivated = true

      logger.info('Payment approved and subscription activated', {
        paymentId: payment.id,
        userId: payment.userId,
        adminId: user.id,
        activeTill: activeTill.toISOString(),
        notes: approvalData.notes
      })
    } else {
      logger.info('Payment rejected', {
        paymentId: payment.id,
        userId: payment.userId,
        adminId: user.id,
        notes: approvalData.notes
      })
    }

    // Update payment status
    const updatedPayment = await db.payment.update({
      where: { id: payment.id },
      data: {
        status: newStatus,
        updatedAt: new Date()
      }
    })

    // Log admin action
    await db.activityLog.create({
      data: {
        userId: payment.userId,
        action: 'PAYMENT_STATUS_CHANGED',
        details: JSON.stringify({
          paymentId: payment.id,
          oldStatus: 'PENDING',
          newStatus,
          adminId: user.id,
          adminNotes: approvalData.notes,
          subscriptionActivated,
          slaBreached: paymentAge > maxAge,
          processingTime: paymentAge
        })
      }
    })

    return NextResponse.json({
      success: true,
      message: `Payment ${newStatus.toLowerCase()} successfully`,
      payment: updatedPayment,
      subscriptionActivated,
      processingTime: paymentAge,
      slaBreached: paymentAge > maxAge
    })

  } catch (error) {
    logger.error('Payment approval error:', error)
    return NextResponse.json(
      { error: 'Payment approval failed' },
      { status: 500 }
    )
  }
}

// Get pending payments for admin review
export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    const { user, response } = await requireAdmin(request)
    if (response) return response

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Get pending payments with user details
    const [payments, total] = await Promise.all([
      db.payment.findMany({
        where: { status: 'PENDING' },
        include: {
          user: {
            select: {
              id: true,
              phone: true,
              name: true,
              trustScore: true,
              isFrozen: true,
              createdAt: true
            }
          }
        },
        orderBy: { createdAt: 'asc' }, // Oldest first for SLA compliance
        skip: offset,
        take: limit
      }),
      db.payment.count({
        where: { status: 'PENDING' }
      })
    ])

    // Calculate SLA status for each payment
    const paymentsWithSLA = payments.map(payment => {
      const age = Date.now() - payment.createdAt.getTime()
      const maxAge = 4 * 60 * 60 * 1000 // 4 hours
      const urgent = age > 2 * 60 * 60 * 1000 // Urgent after 2 hours
      const breached = age > maxAge

      return {
        ...payment,
        slaStatus: breached ? 'BREACHED' : urgent ? 'URGENT' : 'NORMAL',
        ageMinutes: Math.floor(age / (1000 * 60)),
        maxAgeMinutes: Math.floor(maxAge / (1000 * 60))
      }
    })

    return NextResponse.json({
      success: true,
      payments: paymentsWithSLA,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      summary: {
        totalPending: total,
        urgentCount: paymentsWithSLA.filter(p => p.slaStatus === 'URGENT').length,
        breachedCount: paymentsWithSLA.filter(p => p.slaStatus === 'BREACHED').length
      }
    })

  } catch (error) {
    logger.error('Get pending payments error:', error)
    return NextResponse.json(
      { error: 'Failed to get pending payments' },
      { status: 500 }
    )
  }
}
