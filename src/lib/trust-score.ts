import { db } from './db'
import { logger } from './logger'

export interface TrustScoreEvent {
  userId: string
  action: TrustAction
  points: number
  reason: string
  metadata?: Record<string, any>
  timestamp: Date
}

export enum TrustAction {
  // Positive actions
  HELP_COMPLETED = 'HELP_COMPLETED',
  HELP_RECEIVED = 'HELP_RECEIVED',
  POSITIVE_FEEDBACK = 'POSITIVE_FEEDBACK',
  REFERRAL_SUCCESS = 'REFERRAL_SUCCESS',
  LONG_TERM_MEMBER = 'LONG_TERM_MEMBER',

  // Negative actions
  NO_SHOW = 'NO_SHOW',
  NEGATIVE_FEEDBACK = 'NEGATIVE_FEEDBACK',
  REPORT_RECEIVED = 'REPORT_RECEIVED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',

  // Neutral/System actions
  ACCOUNT_CREATED = 'ACCOUNT_CREATED',
  PAYMENT_MADE = 'PAYMENT_MADE',
  PROFILE_UPDATED = 'PROFILE_UPDATED',
  LOCATION_UPDATED = 'LOCATION_UPDATED'
}

export class TrustScoreManager {
  private static instance: TrustScoreManager

  // Trust score point values
  private static readonly POINTS = {
    // Positive
    [TrustAction.HELP_COMPLETED]: 10,
    [TrustAction.HELP_RECEIVED]: 5,
    [TrustAction.POSITIVE_FEEDBACK]: 8,
    [TrustAction.REFERRAL_SUCCESS]: 15,
    [TrustAction.LONG_TERM_MEMBER]: 2,

    // Negative
    [TrustAction.NO_SHOW]: -15,
    [TrustAction.NEGATIVE_FEEDBACK]: -10,
    [TrustAction.REPORT_RECEIVED]: -20,
    [TrustAction.PAYMENT_FAILED]: -5,
    [TrustAction.SUSPICIOUS_ACTIVITY]: -25,

    // Neutral
    [TrustAction.ACCOUNT_CREATED]: 50, // Starting score
    [TrustAction.PAYMENT_MADE]: 0,
    [TrustAction.PROFILE_UPDATED]: 0,
    [TrustAction.LOCATION_UPDATED]: 0
  }

  // Trust score limits
  private static readonly LIMITS = {
    MIN: 0,
    MAX: 100,
    TRUSTED_MIN: 70,
    NEUTRAL_MIN: 40,
    RESTRICTED_MAX: 39
  }

  private constructor() {}

  static getInstance(): TrustScoreManager {
    if (!TrustScoreManager.instance) {
      TrustScoreManager.instance = new TrustScoreManager()
    }
    return TrustScoreManager.instance
  }

  // Calculate new trust score based on action
  async updateTrustScore(
    userId: string,
    action: TrustAction,
    reason: string,
    metadata?: Record<string, any>
  ): Promise<{ newScore: number; oldScore: number; change: number }> {
    try {
      // Get current user
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { trustScore: true }
      })

      if (!user) {
        throw new Error('User not found')
      }

      const oldScore = user.trustScore
      const points = TrustScoreManager.POINTS[action]
      let newScore = Math.max(
        TrustScoreManager.LIMITS.MIN,
        Math.min(TrustScoreManager.LIMITS.MAX, oldScore + points)
      )

      // Special handling for account creation
      if (action === TrustAction.ACCOUNT_CREATED) {
        newScore = TrustScoreManager.POINTS[action]
      }

      // Update user trust score
      await db.user.update({
        where: { id: userId },
        data: { trustScore: newScore }
      })

      // Log trust score event
      await this.logTrustEvent({
        userId,
        action,
        points,
        reason,
        metadata,
        timestamp: new Date()
      })

      const change = newScore - oldScore

      logger.info('Trust score updated', {
        userId,
        action,
        oldScore,
        newScore,
        change,
        reason
      })

      return { newScore, oldScore, change }

    } catch (error) {
      logger.error('Update trust score error:', error)
      throw error
    }
  }

  // Log trust score event
  private async logTrustEvent(event: TrustScoreEvent): Promise<void> {
    try {
      // In a real implementation, you'd create a TrustScoreHistory table
      // For now, we'll log to activity logs
      await db.activityLog.create({
        data: {
          userId: event.userId,
          action: `TRUST_SCORE_${event.action}`,
          details: JSON.stringify({
            points: event.points,
            reason: event.reason,
            metadata: event.metadata,
            timestamp: event.timestamp
          })
        }
      })
    } catch (error) {
      logger.error('Log trust event error:', error)
    }
  }

  // Get trust score history
  async getTrustScoreHistory(userId: string, limit = 50): Promise<TrustScoreEvent[]> {
    try {
      const logs = await db.activityLog.findMany({
        where: {
          userId,
          action: {
            startsWith: 'TRUST_SCORE_'
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      })

      return logs.map(log => {
        const details = JSON.parse(log.details || '{}')
        return {
          userId: log.userId!,
          action: details.action || log.action.replace('TRUST_SCORE_', ''),
          points: details.points || 0,
          reason: details.reason || '',
          metadata: details.metadata || {},
          timestamp: log.createdAt
        }
      })
    } catch (error) {
      logger.error('Get trust score history error:', error)
      return []
    }
  }

  // Get trust score badge
  getTrustBadge(score: number): {
    level: 'trusted' | 'neutral' | 'restricted'
    label: string
    color: string
    icon: string
  } {
    if (score >= TrustScoreManager.LIMITS.TRUSTED_MIN) {
      return {
        level: 'trusted',
        label: 'Trusted',
        color: 'text-green-600',
        icon: '🛡️'
      }
    } else if (score >= TrustScoreManager.LIMITS.NEUTRAL_MIN) {
      return {
        level: 'neutral',
        label: 'Neutral',
        color: 'text-yellow-600',
        icon: '⚖️'
      }
    } else {
      return {
        level: 'restricted',
        label: 'Restricted',
        color: 'text-red-600',
        icon: '⚠️'
      }
    }
  }

  // Check if user can perform action based on trust score
  canPerformAction(userTrustScore: number, requiredMinScore: number): boolean {
    return userTrustScore >= requiredMinScore
  }

  // Automated trust score adjustments
  async performAutomatedAdjustments(): Promise<void> {
    try {
      // Long-term member bonus (every 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const longTermUsers = await db.user.findMany({
        where: {
          createdAt: { lte: thirtyDaysAgo },
          paymentActive: true
        },
        select: { id: true, trustScore: true }
      })

      for (const user of longTermUsers) {
        await this.updateTrustScore(
          user.id,
          TrustAction.LONG_TERM_MEMBER,
          'Long-term active member bonus'
        )
      }

      logger.info('Automated trust score adjustments completed', {
        usersProcessed: longTermUsers.length
      })

    } catch (error) {
      logger.error('Automated trust score adjustments error:', error)
    }
  }
}

// Export singleton instance
export const trustScoreManager = TrustScoreManager.getInstance()
