import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/middleware'
import { logger } from '@/lib/logger'
import { db } from '@/lib/db'
import { trustScoreManager } from '@/lib/trust-score'

interface TrustScoreChange {
  date: string
  positive: number
  negative: number
  total: number
}

// Get trust scores analytics for admin
export async function GET(request: NextRequest) {
  try {
    const { user, response } = await requireAdmin(request)
    if (response) return response

    const url = new URL(request.url)
    const timeframe = url.searchParams.get('timeframe') || '30d'

    // Calculate date range
    const now = new Date()
    const startDate = new Date()

    switch (timeframe) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }

    // Get trust score distribution
    const trustScoreStats = await db.user.groupBy({
      by: ['trustScore'],
      _count: {
        trustScore: true
      },
      where: {
        trustScore: {
          not: null
        }
      },
      orderBy: {
        trustScore: 'asc'
      }
    })

    // Get trust score changes over time
    const trustScoreChanges = await db.activityLog.findMany({
      where: {
        action: {
          startsWith: 'TRUST_SCORE_'
        },
        createdAt: {
          gte: startDate
        }
      },
      orderBy: {
        createdAt: 'asc'
      },
      take: 1000
    })

    // Get top trusted users
    const topTrustedUsers = await db.user.findMany({
      select: {
        id: true,
        phone: true,
        name: true,
        trustScore: true,
        totalHelpsGiven: true,
        totalHelpsTaken: true,
        createdAt: true
      },
      where: {
        trustScore: {
          gte: 70
        }
      },
      orderBy: {
        trustScore: 'desc'
      },
      take: 10
    })

    // Get users with low trust scores
    const lowTrustUsers = await db.user.findMany({
      select: {
        id: true,
        phone: true,
        name: true,
        trustScore: true,
        isFrozen: true,
        totalHelpsGiven: true,
        totalHelpsTaken: true,
        createdAt: true
      },
      where: {
        trustScore: {
          lt: 40
        }
      },
      orderBy: {
        trustScore: 'asc'
      },
      take: 10
    })

    // Calculate trust score averages
    const totalUsers = await db.user.count()
    const avgTrustScore = await db.user.aggregate({
      _avg: {
        trustScore: true
      }
    })

    // Process trust score changes for chart data
    const chartData: TrustScoreChange[] = []
    const dailyChanges = new Map<string, { positive: number; negative: number; total: number }>()

    trustScoreChanges.forEach(log => {
      const date = log.createdAt.toISOString().split('T')[0]
      const details = JSON.parse(log.details || '{}')
      const change = details.points || 0

      if (!dailyChanges.has(date)) {
        dailyChanges.set(date, { positive: 0, negative: 0, total: 0 })
      }

      const dayData = dailyChanges.get(date)!
      if (change > 0) {
        dayData.positive += 1
      } else if (change < 0) {
        dayData.negative += 1
      }
      dayData.total += 1
    })

    // Convert to array format for charts
    for (const [date, data] of dailyChanges.entries()) {
      chartData.push({
        date,
        positive: data.positive,
        negative: data.negative,
        total: data.total
      })
    }

    chartData.sort((a, b) => a.date.localeCompare(b.date))

    logger.info('Admin trust scores analytics retrieved', {
      userId: user.id,
      metadata: {
        timeframe,
        totalUsers,
        avgTrustScore: avgTrustScore._avg.trustScore
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        timeframe,
        summary: {
          totalUsers,
          averageTrustScore: Math.round(avgTrustScore._avg.trustScore || 0),
          trustedUsers: topTrustedUsers.length,
          lowTrustUsers: lowTrustUsers.length
        },
        distribution: trustScoreStats.map(stat => ({
          score: stat.trustScore,
          count: stat._count.trustScore
        })),
        changesOverTime: chartData,
        topTrustedUsers: topTrustedUsers.map(user => ({
          ...user,
          phone: user.phone.replace(/(\d{2})\d{6}(\d{2})/, '$1******$2') // Mask phone
        })),
        lowTrustUsers: lowTrustUsers.map(user => ({
          ...user,
          phone: user.phone.replace(/(\d{2})\d{6}(\d{2})/, '$1******$2') // Mask phone
        }))
      }
    })

  } catch (error) {
    logger.error('Get admin trust scores error:', {
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
    })
    return NextResponse.json(
      { error: 'Failed to get trust scores analytics' },
      { status: 500 }
    )
  }
}
