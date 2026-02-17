import { db } from './db'
import { logger } from './logger'
import { trustScoreManager, TrustAction } from './trust-score'

export interface SecurityConfig {
  HELPER_VERIFICATION_FEE: number
  MIN_TRUST_FOR_HIGH_RISK: number
  NO_SHOW_PENALTY: number
  MAX_NO_SHOW_STRIKES: number
  MAX_POSTS_PER_DAY: number
  BANNED_KEYWORDS: string[]
}

export class SecurityManager {
  private static instance: SecurityManager

  private config: SecurityConfig = {
    HELPER_VERIFICATION_FEE: 49, // ₹49 for helper verification
    MIN_TRUST_FOR_HIGH_RISK: 70, // Minimum trust score for high-risk help
    NO_SHOW_PENALTY: -10, // Trust penalty for no-show
    MAX_NO_SHOW_STRIKES: 3, // Strikes before becoming invisible
    MAX_POSTS_PER_DAY: 3, // Maximum posts per day
    BANNED_KEYWORDS: [
      'drugs', 'weapons', 'illegal', 'crime', 'fraud', 'scam',
      'murder', 'rape', 'assault', 'terrorism', 'bomb', 'explosive',
      'porn', 'adult', 'sex', 'nude', 'gambling', 'betting'
    ]
  }

  private constructor() {}

  static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager()
    }
    return SecurityManager.instance
  }

  // Check if user can post problems (rate limiting)
  async canPostProblem(userId: string): Promise<{
    canPost: boolean
    reason?: string
    postsToday: number
  }> {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const postsToday = await db.problem.count({
        where: {
          userId,
          createdAt: {
            gte: today,
            lt: tomorrow
          }
        }
      })

      if (postsToday >= this.config.MAX_POSTS_PER_DAY) {
        return {
          canPost: false,
          reason: `Daily limit reached (${this.config.MAX_POSTS_PER_DAY} posts/day)`,
          postsToday
        }
      }

      return { canPost: true, postsToday }
    } catch (error) {
      logger.error('Can post problem check error:', {
        userId,
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      })
      return { canPost: false, reason: 'System error', postsToday: 0 }
    }
  }

  // Check if user is verified helper
  async isVerifiedHelper(userId: string): Promise<boolean> {
    try {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { isHelperVerified: true }
      })

      return user?.isHelperVerified || false
    } catch (error) {
      logger.error('Helper verification check error:', {
        userId,
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      })
      return false
    }
  }

  // Verify helper with payment
  async verifyHelper(userId: string, paymentId: string): Promise<boolean> {
    try {
      // In production, verify payment with Razorpay
      // For now, assume payment is valid if paymentId exists

      if (!paymentId) {
        return false
      }

      await db.user.update({
        where: { id: userId },
        data: {
          isHelperVerified: true,
          helperVerifiedAt: new Date()
        }
      })

      // Log verification
      await db.activityLog.create({
        data: {
          userId,
          action: 'HELPER_VERIFIED',
          details: JSON.stringify({
            paymentId,
            fee: this.config.HELPER_VERIFICATION_FEE,
            verifiedAt: new Date().toISOString()
          })
        }
      })

      logger.info('Helper verified successfully', {
        userId,
        metadata: { paymentId }
      })

      return true
    } catch (error) {
      logger.error('Helper verification error:', {
        userId,
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      })
      return false
    }
  }

  // Check if user can accept high-risk problems
  async canAcceptHighRisk(userId: string): Promise<{
    canAccept: boolean
    reason?: string
    trustScore: number
  }> {
    try {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { trustScore: true, isHelperVerified: true }
      })

      if (!user) {
        return { canAccept: false, reason: 'User not found', trustScore: 0 }
      }

      if (!user.isHelperVerified) {
        return {
          canAccept: false,
          reason: `Helper verification required (₹${this.config.HELPER_VERIFICATION_FEE})`,
          trustScore: user.trustScore
        }
      }

      if (user.trustScore < this.config.MIN_TRUST_FOR_HIGH_RISK) {
        return {
          canAccept: false,
          reason: `Trust score too low (${user.trustScore}/${this.config.MIN_TRUST_FOR_HIGH_RISK} required)`,
          trustScore: user.trustScore
        }
      }

      return { canAccept: true, trustScore: user.trustScore }
    } catch (error) {
      logger.error('High-risk acceptance check error:', {
        userId,
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      })
      return { canAccept: false, reason: 'System error', trustScore: 0 }
    }
  }

  // Record no-show incident
  async recordNoShow(userId: string, problemId: string): Promise<{
    strikes: number
    isBanned: boolean
  }> {
    try {
      // Record no-show
      await db.noShow.create({
        data: {
          userId,
          problemId,
          reason: 'Helper did not show up'
        }
      })

      // Count strikes in last 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const strikes = await db.noShow.count({
        where: {
          userId,
          createdAt: { gte: thirtyDaysAgo }
        }
      })

      const isBanned = strikes >= this.config.MAX_NO_SHOW_STRIKES

      // Apply trust penalty
      await trustScoreManager.updateTrustScore(
        userId,
        TrustAction.NO_SHOW,
        `No-show strike ${strikes}/${this.config.MAX_NO_SHOW_STRIKES}`
      )

      // If banned, make user invisible
      if (isBanned) {
        await db.user.update({
          where: { id: userId },
          data: { isFrozen: true }
        })

        await db.activityLog.create({
          data: {
            userId,
            action: 'USER_BANNED',
            details: JSON.stringify({
              reason: 'Too many no-shows',
              strikes,
              bannedAt: new Date().toISOString()
            })
          }
        })
      }

      logger.info('No-show recorded', {
        userId,
        metadata: { strikes, isBanned, problemId }
      })

      return { strikes, isBanned }
    } catch (error) {
      logger.error('Record no-show error:', {
        userId,
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      })
      return { strikes: 0, isBanned: false }
    }
  }

  // Check content for banned keywords
  checkContentForBannedWords(content: string): {
    isSafe: boolean
    bannedWords: string[]
  } {
    const lowerContent = content.toLowerCase()
    const foundBannedWords = this.config.BANNED_KEYWORDS.filter(word =>
      lowerContent.includes(word.toLowerCase())
    )

    return {
      isSafe: foundBannedWords.length === 0,
      bannedWords: foundBannedWords
    }
  }

  // Report user/problem
  async reportContent(
    reporterId: string,
    reportedId: string,
    problemId: string | null,
    reason: string,
    category: 'SPAM' | 'HARASSMENT' | 'FRAUD' | 'INAPPROPRIATE' | 'OTHER'
  ): Promise<boolean> {
    try {
      await db.report.create({
        data: {
          reporterId,
          reportedId,
          problemId,
          reason,
          category,
          status: 'PENDING'
        }
      })

      // Log report
      await db.activityLog.create({
        data: {
          userId: reporterId,
          action: 'REPORT_SUBMITTED',
          details: JSON.stringify({
            reportedId,
            problemId,
            category,
            reason: reason.substring(0, 100)
          })
        }
      })

      logger.info('Report submitted', {
        metadata: {
          reporterId,
          reportedId,
          problemId,
          category
        }
      })

      return true
    } catch (error) {
      logger.error('Report submission error:', {
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      })
      return false
    }
  }

  // Emergency SOS functionality
  async triggerSOS(
    userId: string,
    location: { lat: number; lng: number; text: string },
    emergencyType: 'POLICE' | 'AMBULANCE' | 'FIRE' | 'GENERAL'
  ): Promise<boolean> {
    try {
      // Log SOS trigger
      await db.activityLog.create({
        data: {
          userId,
          action: 'SOS_TRIGGERED',
          details: JSON.stringify({
            emergencyType,
            location,
            triggeredAt: new Date().toISOString()
          })
        }
      })

      // In production, integrate with emergency services
      // For now, just log and return success

      logger.warn('SOS triggered', {
        userId,
        metadata: {
          emergencyType,
          location: location.text
        }
      })

      return true
    } catch (error) {
      logger.error('SOS trigger error:', {
        userId,
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      })
      return false
    }
  }

  // Get user security status
  async getUserSecurityStatus(userId: string): Promise<{
    isVerifiedHelper: boolean
    trustScore: number
    noShowStrikes: number
    canPostToday: boolean
    postsToday: number
    isFrozen: boolean
  }> {
    try {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: {
          trustScore: true,
          isHelperVerified: true,
          isFrozen: true
        }
      })

      if (!user) {
        return {
          isVerifiedHelper: false,
          trustScore: 0,
          noShowStrikes: 0,
          canPostToday: false,
          postsToday: 0,
          isFrozen: true
        }
      }

      // Get no-show strikes
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const noShowStrikes = await db.noShow.count({
        where: {
          userId,
          createdAt: { gte: thirtyDaysAgo }
        }
      })

      // Check posting status
      const postStatus = await this.canPostProblem(userId)

      return {
        isVerifiedHelper: user.isHelperVerified || false,
        trustScore: user.trustScore,
        noShowStrikes,
        canPostToday: postStatus.canPost,
        postsToday: postStatus.postsToday,
        isFrozen: user.isFrozen
      }
    } catch (error) {
      logger.error('Get user security status error:', {
        userId,
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      })
      return {
        isVerifiedHelper: false,
        trustScore: 0,
        noShowStrikes: 0,
        canPostToday: false,
        postsToday: 0,
        isFrozen: true
      }
    }
  }

  // Get security configuration
  getConfig(): SecurityConfig {
    return { ...this.config }
  }
}

// Export singleton instance
export const securityManager = SecurityManager.getInstance()
