import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/middleware'
import { logger } from '@/lib/logger'
import { db } from '@/lib/db'

// Get subscription status
export async function GET(request: NextRequest) {
  try {
    const { user, response } = await requireAuth(request)
    if (response) return response

    // Get user subscription details
    const userData = await db.user.findUnique({
      where: { id: user.id },
      select: {
        paymentActive: true,
        activeTill: true,
        createdAt: true,
        _count: {
          select: {
            payments: {
              where: { status: 'APPROVED' }
            }
          }
        }
      }
    })

    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const now = new Date()
    const activeTill = userData.activeTill ? new Date(userData.activeTill) : null
    const isActive = userData.paymentActive && activeTill && activeTill > now

    const daysRemaining = isActive && activeTill
      ? Math.ceil((activeTill.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : 0

    // Get recent payments
    const recentPayments = await db.payment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        amount: true,
        status: true,
        month: true,
        year: true,
        createdAt: true,
        utiRef: true
      }
    })

    return NextResponse.json({
      success: true,
      subscription: {
        isActive,
        activeTill: activeTill?.toISOString(),
        daysRemaining,
        totalPayments: userData._count.payments,
        memberSince: userData.createdAt.toISOString()
      },
      recentPayments
    })

  } catch (error) {
    logger.error('Get subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to get subscription details' },
      { status: 500 }
    )
  }
}

// Cancel subscription
export async function DELETE(request: NextRequest) {
  try {
    const { user, response } = await requireAuth(request)
    if (response) return response

    // Update user subscription status
    await db.user.update({
      where: { id: user.id },
      data: {
        paymentActive: false,
        activeTill: null
      }
    })

    logger.info('Subscription cancelled', {
      userId: user.id
    })

    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled successfully',
      cancelledAt: new Date().toISOString()
    })

  } catch (error) {
    logger.error('Cancel subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}
