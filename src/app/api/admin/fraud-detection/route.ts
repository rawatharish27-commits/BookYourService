import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/middleware'
import { logger } from '@/lib/logger'
import { db } from '@/lib/db'
import { locationValidator } from '@/lib/location-validator'
import { deviceFingerprintManager } from '@/lib/device-fingerprint'

// Helper methods for fraud pattern detection
async function getRapidLocationChanges(startDate: Date): Promise<number> {
  try {
    const rapidChanges = await db.activityLog.count({
      where: {
        action: 'LOCATION_UPDATE_SUSPICIOUS',
        details: {
          contains: '"Large distance jump"'
        },
        createdAt: {
          gte: startDate
        }
      }
    })
    return rapidChanges
  } catch {
    return 0
  }
}

async function getMultipleDeviceUsage(startDate: Date): Promise<number> {
  try {
    const usersWithMultipleDevices = await db.activityLog.groupBy({
      by: ['userId'],
      where: {
        action: 'DEVICE_REGISTERED',
        createdAt: {
          gte: startDate
        }
      },
      having: {
        id: {
          _count: {
            gte: 2
          }
        }
      }
    })
    return usersWithMultipleDevices.length
  } catch {
    return 0
  }
}

async function getUnusualPaymentPatterns(startDate: Date): Promise<number> {
  try {
    // Count failed payments that might indicate fraud attempts
    const failedPayments = await db.payment.count({
      where: {
        status: 'REJECTED',
        createdAt: {
          gte: startDate
        }
      }
    })
    return failedPayments
  } catch {
    return 0
  }
}

// Get fraud detection analytics for admin
export async function GET(request: NextRequest) {
  try {
    const { user, response } = await requireAdmin(request)
    if (response) return response

    const url = new URL(request.url)
    const timeframe = url.searchParams.get('timeframe') || '7d'

    // Calculate date range
    const now = new Date()
    const startDate = new Date()

    switch (timeframe) {
      case '1d':
        startDate.setDate(now.getDate() - 1)
        break
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      default:
        startDate.setDate(now.getDate() - 7)
    }

    // Get suspicious activities from logs
    const suspiciousActivities = await db.activityLog.findMany({
      where: {
        action: {
          in: ['LOCATION_UPDATE_SUSPICIOUS', 'DEVICE_SUSPICIOUS', 'PAYMENT_SUSPICIOUS']
        },
        createdAt: {
          gte: startDate
        }
      },
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
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 100
    })

    // Get location violation statistics
    const locationViolations = await db.activityLog.count({
      where: {
        action: 'LOCATION_UPDATE_SUSPICIOUS',
        createdAt: {
          gte: startDate
        }
      }
    })

    // Get device fingerprint violations
    const deviceViolations = await db.activityLog.count({
      where: {
        action: 'DEVICE_SUSPICIOUS',
        createdAt: {
          gte: startDate
        }
      }
    })

    // Get users with multiple suspicious activities
    const suspiciousUsers = await db.activityLog.groupBy({
      by: ['userId'],
      _count: {
        id: true
      },
      where: {
        action: {
          in: ['LOCATION_UPDATE_SUSPICIOUS', 'DEVICE_SUSPICIOUS', 'PAYMENT_SUSPICIOUS']
        },
        createdAt: {
          gte: startDate
        }
      },
      having: {
        id: {
          _count: {
            gte: 3 // Users with 3+ suspicious activities
          }
        }
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 20
    })

    // Get detailed user info for suspicious users
    const suspiciousUserDetails = await Promise.all(
      suspiciousUsers.map(async (userGroup) => {
        const user = await db.user.findUnique({
          where: { id: userGroup.userId! },
          select: {
            id: true,
            phone: true,
            name: true,
            trustScore: true,
            isFrozen: true,
            totalHelpsGiven: true,
            totalHelpsTaken: true,
            createdAt: true,
            lastActiveAt: true
          }
        })

        const recentActivities = await db.activityLog.findMany({
          where: {
            userId: userGroup.userId,
            action: {
              in: ['LOCATION_UPDATE_SUSPICIOUS', 'DEVICE_SUSPICIOUS', 'PAYMENT_SUSPICIOUS']
            },
            createdAt: {
              gte: startDate
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 5
        })

        return {
          user: user ? {
            ...user,
            phone: user.phone.replace(/(\d{2})\d{6}(\d{2})/, '$1******$2') // Mask phone
          } : null,
          suspiciousActivityCount: userGroup._count.id,
          recentActivities: recentActivities.map(activity => ({
            action: activity.action,
            timestamp: activity.createdAt,
            details: JSON.parse(activity.details || '{}')
          }))
        }
      })
    )

    // Get fraud patterns
    const fraudPatterns = {
      locationSpoofing: locationViolations,
      deviceTampering: deviceViolations,
      rapidLocationChanges: await getRapidLocationChanges(startDate),
      multipleDeviceUsage: await getMultipleDeviceUsage(startDate),
      unusualPaymentPatterns: await getUnusualPaymentPatterns(startDate)
    }

    logger.info('Admin fraud detection analytics retrieved', {
      userId: user.id,
      metadata: {
        timeframe,
        suspiciousActivities: suspiciousActivities.length,
        suspiciousUsers: suspiciousUsers.length
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        timeframe,
        summary: {
          totalSuspiciousActivities: suspiciousActivities.length,
          suspiciousUsers: suspiciousUsers.length,
          locationViolations,
          deviceViolations,
          patterns: fraudPatterns
        },
        recentSuspiciousActivities: suspiciousActivities.slice(0, 20).map(activity => ({
          id: activity.id,
          userId: activity.userId,
          user: activity.user ? {
            ...activity.user,
            phone: activity.user.phone.replace(/(\d{2})\d{6}(\d{2})/, '$1******$2')
          } : null,
          action: activity.action,
          timestamp: activity.createdAt,
          details: JSON.parse(activity.details || '{}')
        })),
        highRiskUsers: suspiciousUserDetails.filter(item => item.user !== null)
      }
    })

  } catch (error) {
    logger.error('Get admin fraud detection error:', {
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
    })
    return NextResponse.json(
      { error: 'Failed to get fraud detection analytics' },
      { status: 500 }
    )
  }
}
