import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { withLogging, requireAdmin, ApiResponse } from '@/lib/middleware'

// Get API analytics data
async function getAnalytics(request: NextRequest) {
  try {
    // Require admin access
    const { user, response } = await requireAdmin(request)
    if (response) return response

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '7d' // 1d, 7d, 30d
    const endpoint = searchParams.get('endpoint')

    // Calculate date range
    const now = new Date()
    let startDate: Date

    switch (period) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '7d':
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
    }

    // Get activity logs with analytics
    const activities = await db.activityLog.findMany({
      where: {
        createdAt: { gte: startDate },
        ...(endpoint && { details: { contains: endpoint } })
      },
      orderBy: { createdAt: 'desc' },
      take: 1000
    })

    // Aggregate analytics data
    const analytics = {
      period,
      totalRequests: activities.length,
      uniqueUsers: new Set(activities.map(a => a.userId).filter(Boolean)).size,
      endpointStats: {} as Record<string, { count: number; avgResponseTime?: number }>,
      hourlyStats: [] as Array<{ hour: string; count: number }>,
      errorRate: 0,
      topEndpoints: [] as Array<{ endpoint: string; count: number }>
    }

    // Process activities
    const endpointCounts: Record<string, number> = {}
    const hourlyCounts: Record<string, number> = {}
    let errorCount = 0

    activities.forEach(activity => {
      // Count endpoints
      const action = activity.action
      endpointCounts[action] = (endpointCounts[action] || 0) + 1

      // Count by hour
      const hour = activity.createdAt.toISOString().slice(0, 13) // YYYY-MM-DDTHH
      hourlyCounts[hour] = (hourlyCounts[hour] || 0) + 1

      // Count errors
      if (activity.action.includes('ERROR') || activity.action.includes('FAILED')) {
        errorCount++
      }
    })

    // Convert to arrays for response
    analytics.endpointStats = Object.entries(endpointCounts).reduce((acc, [endpoint, count]) => {
      acc[endpoint] = { count }
      return acc
    }, {} as Record<string, { count: number }>)

    analytics.hourlyStats = Object.entries(hourlyCounts)
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => a.hour.localeCompare(b.hour))

    analytics.errorRate = activities.length > 0 ? (errorCount / activities.length) * 100 : 0

    analytics.topEndpoints = Object.entries(endpointCounts)
      .map(([endpoint, count]) => ({ endpoint, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    return ApiResponse.success(analytics)

  } catch (error) {
    throw error // Let middleware handle it
  }
}

// Export wrapped handler
export const GET = withLogging(requireAdmin(getAnalytics))
