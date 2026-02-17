import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const deletionRequestSchema = z.object({
  reason: z.string().min(10, 'Please provide a detailed reason for deletion (minimum 10 characters)'),
  confirmDeletion: z.boolean().refine(val => val === true, 'You must confirm the deletion'),
  deletePaymentData: z.boolean().optional().default(false),
})

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const auth = await authenticateRequest(request)
    if (!auth?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = auth.user.id
    const body = await request.json()

    // Validate request
    const { reason, confirmDeletion, deletePaymentData } = deletionRequestSchema.parse(body)

    // Get user details for logging
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        phone: true,
        name: true,
        isAdmin: true,
        trustScore: true,
        totalHelpsGiven: true,
        totalHelpsTaken: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Prevent admin account deletion
    if (user.isAdmin) {
      return NextResponse.json(
        { error: 'Admin accounts cannot be deleted through this endpoint' },
        { status: 403 }
      )
    }

    // Check for active problems or ongoing transactions
    const activeProblems = await db.problem.count({
      where: {
        OR: [
          { userId, status: { in: ['OPEN', 'IN_PROGRESS'] } },
          { feedbacks: { some: { helperId: userId, problem: { status: 'IN_PROGRESS' } } } }
        ]
      }
    })

    if (activeProblems > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete account with active problems. Please resolve all active requests first.',
          activeProblemsCount: activeProblems
        },
        { status: 400 }
      )
    }

    // Log the deletion request
    await db.activityLog.create({
      data: {
        userId,
        action: 'ACCOUNT_DELETION_REQUESTED',
        details: JSON.stringify({
          reason,
          deletePaymentData,
          userStats: {
            trustScore: user.trustScore,
            totalHelpsGiven: user.totalHelpsGiven,
            totalHelpsTaken: user.totalHelpsTaken,
          },
          requestedAt: new Date().toISOString(),
        }),
      },
    })

    // Schedule account deletion (GDPR requires processing within 30 days)
    const deletionScheduledAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

    // Mark user for deletion (soft delete approach)
    await db.user.update({
      where: { id: userId },
      data: {
        isFrozen: true,
        name: '[DELETED]',
        phone: `DELETED_${userId.slice(-8)}`,
        latitude: null,
        longitude: null,
        locationText: null,
        referralCode: null,
        notifyNewRequests: false,
        notifyPayments: false,
        notifyReports: false,
        lastActiveAt: new Date(),
      },
    })

    // Anonymize or delete related data based on user preference
    if (deletePaymentData) {
      // Delete payment data
      await db.payment.deleteMany({
        where: { userId },
      })
    } else {
      // Anonymize payment data
      await db.payment.updateMany({
        where: { userId },
        data: {
          utiRef: null,
        },
      })
    }

    // Anonymize feedback
    await db.feedback.updateMany({
      where: { helperId: userId },
      data: {
        comment: '[Deleted by user]',
      },
    })

    await db.feedback.updateMany({
      where: { clientId: userId },
      data: {
        comment: '[Deleted by user]',
      },
    })

    // Delete notifications
    await db.notification.deleteMany({
      where: { userId },
    })

    // Anonymize reports
    await db.report.updateMany({
      where: { reporterId: userId },
      data: {
        reason: '[Deleted by user]',
      },
    })

    // Delete achievements and challenges
    await db.achievement.deleteMany({
      where: { userId },
    })

    await db.dailyChallenge.deleteMany({
      where: { userId },
    })

    // Schedule complete deletion after 30 days
    // In production, this would be handled by a background job
    await db.activityLog.create({
      data: {
        userId,
        action: 'ACCOUNT_DELETION_SCHEDULED',
        details: JSON.stringify({
          deletionScheduledAt: deletionScheduledAt.toISOString(),
          dataRetention: deletePaymentData ? 'none' : 'anonymized_payments',
        }),
      },
    })

    logger.info('User account deletion initiated', {
      userId,
      metadata: {
        reason: reason.substring(0, 100), // Truncate for logging
        deletePaymentData,
        deletionScheduledAt,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Account deletion initiated successfully',
      details: {
        deletionScheduledAt,
        dataRetention: deletePaymentData ? 'All data will be permanently deleted' : 'Payment data will be anonymized',
        supportContact: 'If you need immediate assistance, contact support@help2earn.com',
      },
    })

  } catch (error) {
    logger.error('Data deletion error', {
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : {
        name: 'UnknownError',
        message: 'Unknown error occurred',
      },
      metadata: { userId: 'unknown' },
    })

    return NextResponse.json(
      { error: 'Failed to process deletion request' },
      { status: 500 }
    )
  }
}

// GET endpoint to check deletion status
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = auth.user.id

    // Check if user is marked for deletion
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        isFrozen: true,
        lastActiveAt: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check recent deletion logs
    const deletionLogs = await db.activityLog.findMany({
      where: {
        userId,
        action: { in: ['ACCOUNT_DELETION_REQUESTED', 'ACCOUNT_DELETION_SCHEDULED'] },
      },
      orderBy: { createdAt: 'desc' },
      take: 1,
    })

    const isMarkedForDeletion = user.isFrozen && deletionLogs.length > 0

    return NextResponse.json({
      isMarkedForDeletion,
      deletionRequestedAt: deletionLogs[0]?.createdAt || null,
      accountFrozen: user.isFrozen,
    })

  } catch (error) {
    logger.error('Deletion status check error', {
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
      } : {
        name: 'UnknownError',
        message: 'Unknown error occurred',
      },
    })

    return NextResponse.json(
      { error: 'Failed to check deletion status' },
      { status: 500 }
    )
  }
}
