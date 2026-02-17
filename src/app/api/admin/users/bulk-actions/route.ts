import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/middleware'
import { logger } from '@/lib/logger'
import { db } from '@/lib/db'
import { trustScoreManager } from '@/lib/trust-score'
import { z } from 'zod'

const bulkActionSchema = z.object({
  action: z.enum(['freeze', 'unfreeze', 'adjust_trust', 'delete', 'send_notification']),
  userIds: z.array(z.string()).min(1).max(100), // Max 100 users at once
  reason: z.string().min(1).max(500),
  trustAdjustment: z.number().min(-50).max(50).optional(), // For trust adjustments
  notificationMessage: z.string().optional() // For notifications
})

interface BulkActionResult {
  userId: string
  success: boolean
  result?: any
  error?: string
}

// POST - Execute bulk actions on users
export async function POST(request: NextRequest) {
  try {
    const { user: adminUser, response } = await requireAdmin(request)
    if (response) return response

    const body = await request.json()
    const { action, userIds, reason, trustAdjustment, notificationMessage } = bulkActionSchema.parse(body)

    // Validate users exist
    const existingUsers = await db.user.findMany({
      where: {
        id: {
          in: userIds
        }
      },
      select: {
        id: true,
        phone: true,
        name: true,
        trustScore: true,
        isFrozen: true
      }
    })

    if (existingUsers.length !== userIds.length) {
      const foundIds = existingUsers.map(u => u.id)
      const missingIds = userIds.filter(id => !foundIds.includes(id))
      return NextResponse.json(
        { error: `Users not found: ${missingIds.join(', ')}` },
        { status: 400 }
      )
    }

    const results: BulkActionResult[] = []
    const errors: BulkActionResult[] = []

    // Execute bulk action
    for (const targetUser of existingUsers) {
      try {
        let result: any = null

        switch (action) {
          case 'freeze':
            result = await handleFreezeUser(targetUser, reason, adminUser.id)
            break
          case 'unfreeze':
            result = await handleUnfreezeUser(targetUser, reason, adminUser.id)
            break
          case 'adjust_trust':
            if (trustAdjustment === undefined) {
              throw new Error('Trust adjustment value required')
            }
            result = await handleTrustAdjustment(targetUser, trustAdjustment, reason, adminUser.id)
            break
          case 'delete':
            result = await handleDeleteUser(targetUser, reason, adminUser.id)
            break
          case 'send_notification':
            if (!notificationMessage) {
              throw new Error('Notification message required')
            }
            result = await handleSendNotification(targetUser, notificationMessage, reason, adminUser.id)
            break
        }

        results.push({
          userId: targetUser.id,
          success: true,
          result
        })

      } catch (error) {
        logger.error('Bulk action failed for user', {
          userId: targetUser.id,
          action,
          error: error instanceof Error ? error.message : 'Unknown error'
        })

        errors.push({
          userId: targetUser.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Log bulk action
    await db.activityLog.create({
      data: {
        userId: adminUser.id,
        action: 'ADMIN_BULK_ACTION',
        details: JSON.stringify({
          action,
          userCount: userIds.length,
          successCount: results.length,
          errorCount: errors.length,
          reason
        })
      }
    })

    logger.info('Admin bulk action completed', {
      userId: adminUser.id,
      metadata: {
        action,
        userCount: userIds.length,
        successCount: results.length,
        errorCount: errors.length
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        action,
        totalUsers: userIds.length,
        successful: results.length,
        failed: errors.length,
        results,
        errors: errors.length > 0 ? errors : undefined
      }
    })

  } catch (error) {
    logger.error('Bulk action error:', {
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
    })
    return NextResponse.json(
      { error: 'Failed to execute bulk action' },
      { status: 500 }
    )
  }
}

// Helper functions for different actions
async function handleFreezeUser(targetUser: any, reason: string, adminId: string) {
  if (targetUser.isFrozen) {
    throw new Error('User is already frozen')
  }

  await db.user.update({
    where: { id: targetUser.id },
    data: { isFrozen: true }
  })

  await db.activityLog.create({
    data: {
      userId: targetUser.id,
      action: 'USER_FROZEN',
      details: JSON.stringify({
        reason,
        adminId,
        previousTrustScore: targetUser.trustScore
      })
    }
  })

  return { status: 'frozen', message: 'User account frozen' }
}

async function handleUnfreezeUser(targetUser: any, reason: string, adminId: string) {
  if (!targetUser.isFrozen) {
    throw new Error('User is not frozen')
  }

  await db.user.update({
    where: { id: targetUser.id },
    data: { isFrozen: false }
  })

  await db.activityLog.create({
    data: {
      userId: targetUser.id,
      action: 'USER_UNFROZEN',
      details: JSON.stringify({
        reason,
        adminId
      })
    }
  })

  return { status: 'unfrozen', message: 'User account unfrozen' }
}

async function handleTrustAdjustment(targetUser: any, adjustment: number, reason: string, adminId: string) {
  const newTrustScore = Math.max(0, Math.min(100, targetUser.trustScore + adjustment))

  await db.user.update({
    where: { id: targetUser.id },
    data: { trustScore: newTrustScore }
  })

  // Log trust score change manually since method doesn't exist
  await db.activityLog.create({
    data: {
      userId: targetUser.id,
      action: 'TRUST_SCORE_ADMIN_ADJUSTMENT',
      details: JSON.stringify({
        points: adjustment,
        reason: `Admin adjustment: ${reason}`,
        adminId,
        oldScore: targetUser.trustScore,
        newScore: newTrustScore
      })
    }
  })

  await db.activityLog.create({
    data: {
      userId: targetUser.id,
      action: 'ADMIN_TRUST_ADJUSTMENT',
      details: JSON.stringify({
        reason,
        adminId,
        oldScore: targetUser.trustScore,
        newScore: newTrustScore,
        adjustment
      })
    }
  })

  return {
    status: 'trust_adjusted',
    oldScore: targetUser.trustScore,
    newScore: newTrustScore,
    adjustment
  }
}

async function handleDeleteUser(targetUser: any, reason: string, adminId: string) {
  // Soft delete by marking as frozen and clearing sensitive data
  await db.user.update({
    where: { id: targetUser.id },
    data: {
      isFrozen: true,
      name: null,
      trustScore: 0,
      latitude: null,
      longitude: null,
      locationText: null
    }
  })

  await db.activityLog.create({
    data: {
      userId: targetUser.id,
      action: 'USER_DELETED',
      details: JSON.stringify({
        reason,
        adminId,
        deletedAt: new Date().toISOString()
      })
    }
  })

  return { status: 'deleted', message: 'User data cleared and account frozen' }
}

async function handleSendNotification(targetUser: any, message: string, reason: string, adminId: string) {
  await db.notification.create({
    data: {
      userId: targetUser.id,
      type: 'ADMIN_MESSAGE',
      title: 'Admin Message',
      message
    }
  })

  await db.activityLog.create({
    data: {
      userId: targetUser.id,
      action: 'ADMIN_NOTIFICATION_SENT',
      details: JSON.stringify({
        reason,
        adminId,
        message: message.substring(0, 100) + (message.length > 100 ? '...' : '')
      })
    }
  })

  return { status: 'notification_sent', message: 'Notification sent to user' }
}
