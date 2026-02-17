import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const exportRequestSchema = z.object({
  includeSensitiveData: z.boolean().optional().default(false),
  dateRange: z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  }).optional(),
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
    const { includeSensitiveData, dateRange } = exportRequestSchema.parse(body)

    // Get user data
    const user = await db.user.findUnique({
      where: { id: userId },
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
        referredBy: true,
        referralCount: true,
        notifyNewRequests: true,
        notifyPayments: true,
        notifyReports: true,
        totalHelpsGiven: true,
        totalHelpsTaken: true,
        createdAt: true,
        updatedAt: true,
        lastActiveAt: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Build date filter for related data
    const dateFilter = dateRange ? {
      createdAt: {
        gte: new Date(dateRange.start),
        lte: new Date(dateRange.end),
      },
    } : {}

    // Get related data
    const [payments, problems, feedbacks, reports, notifications, activityLogs] = await Promise.all([
      // Payment history
      db.payment.findMany({
        where: { userId, ...dateFilter },
        select: {
          id: true,
          amount: true,
          status: true,
          month: true,
          year: true,
          utiRef: includeSensitiveData ? true : false,
          createdAt: true,
          updatedAt: true,
        },
      }),

      // Problems posted/helped with
      db.problem.findMany({
        where: {
          OR: [
            { userId },
            {
              feedbacks: {
                some: { helperId: userId }
              }
            }
          ],
          ...dateFilter,
        },
        select: {
          id: true,
          type: true,
          riskLevel: true,
          category: true,
          title: true,
          description: true,
          offerPrice: true,
          latitude: true,
          longitude: true,
          locationText: true,
          minTrustRequired: true,
          status: true,
          viewCount: true,
          callCount: true,
          createdAt: true,
          expiresAt: true,
        },
      }),

      // Feedback given/received
      db.feedback.findMany({
        where: {
          OR: [
            { helperId: userId },
            { clientId: userId }
          ],
          ...dateFilter,
        },
        select: {
          id: true,
          problemId: true,
          rating: true,
          comment: true,
          helperReached: true,
          createdAt: true,
        },
      }),

      // Reports made/against user
      db.report.findMany({
        where: {
          OR: [
            { reporterId: userId },
            { reportedId: userId }
          ],
          ...dateFilter,
        },
        select: {
          id: true,
          category: true,
          reason: true,
          status: true,
          createdAt: true,
          resolvedAt: true,
        },
      }),

      // Notifications
      db.notification.findMany({
        where: { userId, ...dateFilter },
        select: {
          id: true,
          type: true,
          title: true,
          message: true,
          read: true,
          createdAt: true,
        },
      }),

      // Activity logs (anonymized)
      db.activityLog.findMany({
        where: { userId, ...dateFilter },
        select: {
          id: true,
          action: true,
          createdAt: true,
          // Exclude IP addresses and sensitive details
        },
      }),
    ])

    // Get achievements/badges
    const achievements = await db.achievement.findMany({
      where: { userId },
      include: {
        badge: true,
      },
    })

    // Get daily challenges
    const dailyChallenges = await db.dailyChallenge.findMany({
      where: { userId, ...dateFilter },
      select: {
        challengeId: true,
        progress: true,
        completed: true,
        date: true,
      },
    })

    // Compile export data
    const exportData = {
      exportMetadata: {
        userId,
        exportDate: new Date().toISOString(),
        dateRange: dateRange || null,
        includeSensitiveData,
        version: '1.0',
      },
      userProfile: {
        ...user,
        // Mask sensitive data if not requested
        phone: includeSensitiveData ? user.phone : `${user.phone.slice(0, 2)}******${user.phone.slice(-2)}`,
      },
      paymentHistory: payments,
      problems: problems,
      feedbacks: feedbacks,
      reports: reports,
      notifications: notifications,
      activityLogs: activityLogs,
      achievements: achievements,
      dailyChallenges: dailyChallenges,
    }

    // Log data export
    await db.activityLog.create({
      data: {
        userId,
        action: 'DATA_EXPORT_REQUESTED',
        details: JSON.stringify({
          includeSensitiveData,
          dateRange,
          recordCount: {
            payments: payments.length,
            problems: problems.length,
            feedbacks: feedbacks.length,
            reports: reports.length,
            notifications: notifications.length,
            achievements: achievements.length,
          },
        }),
      },
    })

    logger.info('User data export completed', {
      userId,
      metadata: {
        includeSensitiveData,
        recordCount: Object.keys(exportData).length,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Data export prepared successfully',
      data: exportData,
      downloadUrl: `/api/user/data-export/download?token=${generateExportToken(userId)}`,
    })

  } catch (error) {
    logger.error('Data export error', {
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
      { error: 'Failed to export data' },
      { status: 500 }
    )
  }
}

// Generate a temporary token for secure download
function generateExportToken(userId: string): string {
  // In production, use JWT or secure token generation
  return Buffer.from(`${userId}:${Date.now()}`).toString('base64')
}
