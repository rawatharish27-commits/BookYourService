import { db } from './db'
import { logger } from './logger'
import { trustScoreManager } from './trust-score'

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  category: 'HELPER' | 'CLIENT' | 'COMMUNITY' | 'ACHIEVEMENT'
  requirement: number
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'
  points: number
}

export interface Achievement {
  id: string
  userId: string
  badgeId: string
  unlockedAt: Date
  progress: number
  isCompleted: boolean
  badge?: Badge
}

export interface LeaderboardEntry {
  userId: string
  phone: string
  name: string | null
  trustScore: number
  totalHelpsGiven: number
  totalHelpsTaken: number
  badgesEarned: number
  referralCount: number
  rank: number
  points: number
}

export interface ReferralReward {
  referrerReward: number
  refereeReward: number
  referrerBadge?: string
  refereeBadge?: string
}

class GamificationManager {
  // Badge definitions
  private badges: Badge[] = [
    // Helper badges
    {
      id: 'first_help',
      name: 'First Helper',
      description: 'Complete your first help request',
      icon: '🎯',
      category: 'HELPER',
      requirement: 1,
      rarity: 'COMMON',
      points: 10
    },
    {
      id: 'helpful_soul',
      name: 'Helpful Soul',
      description: 'Complete 10 help requests',
      icon: '❤️',
      category: 'HELPER',
      requirement: 10,
      rarity: 'COMMON',
      points: 50
    },
    {
      id: 'community_hero',
      name: 'Community Hero',
      description: 'Complete 50 help requests',
      icon: '🦸',
      category: 'HELPER',
      requirement: 50,
      rarity: 'RARE',
      points: 200
    },
    {
      id: 'legendary_helper',
      name: 'Legendary Helper',
      description: 'Complete 100 help requests',
      icon: '👑',
      category: 'HELPER',
      requirement: 100,
      rarity: 'EPIC',
      points: 500
    },

    // Client badges
    {
      id: 'first_request',
      name: 'First Request',
      description: 'Post your first help request',
      icon: '📝',
      category: 'CLIENT',
      requirement: 1,
      rarity: 'COMMON',
      points: 5
    },
    {
      id: 'regular_client',
      name: 'Regular Client',
      description: 'Post 10 help requests',
      icon: '📋',
      category: 'CLIENT',
      requirement: 10,
      rarity: 'COMMON',
      points: 25
    },

    // Community badges
    {
      id: 'referral_master',
      name: 'Referral Master',
      description: 'Refer 5 friends to join Help2Earn',
      icon: '👥',
      category: 'COMMUNITY',
      requirement: 5,
      rarity: 'RARE',
      points: 150
    },
    {
      id: 'trust_builder',
      name: 'Trust Builder',
      description: 'Maintain a trust score above 80',
      icon: '🤝',
      category: 'ACHIEVEMENT',
      requirement: 80,
      rarity: 'RARE',
      points: 100
    },
    {
      id: 'perfect_helper',
      name: 'Perfect Helper',
      description: 'Complete 25 requests with 5-star ratings',
      icon: '⭐',
      category: 'ACHIEVEMENT',
      requirement: 25,
      rarity: 'EPIC',
      points: 300
    }
  ]

  // Referral rewards configuration
  private referralRewards: Record<number, ReferralReward> = {
    1: { referrerReward: 50, refereeReward: 25 },
    5: { referrerReward: 100, refereeReward: 50, referrerBadge: 'referral_master' },
    10: { referrerReward: 200, refereeReward: 100 },
    25: { referrerReward: 500, refereeReward: 250 }
  }

  // Daily challenges
  private dailyChallenges = [
    { id: 'help_someone', description: 'Help someone today', points: 20, type: 'HELP_GIVEN' },
    { id: 'post_request', description: 'Post a help request', points: 10, type: 'REQUEST_POSTED' },
    { id: 'rate_helper', description: 'Rate a helper 5 stars', points: 15, type: 'FIVE_STAR_RATING' },
    { id: 'refer_friend', description: 'Refer a friend', points: 25, type: 'REFERRAL' }
  ]

  // Check and award badges for user
  async checkAndAwardBadges(userId: string): Promise<Badge[]> {
    try {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          trustScore: true,
          totalHelpsGiven: true,
          totalHelpsTaken: true,
          referralCount: true
        }
      })

      if (!user) return []

      // Get existing achievements
      const existingAchievements = await db.achievement.findMany({
        where: { userId },
        select: { badgeId: true }
      })

      const existingBadgeIds = new Set(existingAchievements.map(a => a.badgeId))
      const newBadges: Badge[] = []

      for (const badge of this.badges) {
        if (existingBadgeIds.has(badge.id)) continue

        let qualifies = false

        switch (badge.id) {
          case 'first_help':
          case 'helpful_soul':
          case 'community_hero':
          case 'legendary_helper':
            qualifies = user.totalHelpsGiven >= badge.requirement
            break

          case 'first_request':
          case 'regular_client':
            qualifies = user.totalHelpsTaken >= badge.requirement
            break

          case 'referral_master':
            qualifies = user.referralCount >= badge.requirement
            break

          case 'trust_builder':
            qualifies = user.trustScore >= badge.requirement
            break

          case 'perfect_helper':
            // Check for 5-star ratings count
            const fiveStarCount = await db.feedback.count({
              where: {
                helperId: userId,
                rating: 5
              }
            })
            qualifies = fiveStarCount >= badge.requirement
            break
        }

        if (qualifies) {
          // Award badge
          await db.achievement.create({
            data: {
              userId,
              badgeId: badge.id,
              unlockedAt: new Date(),
              progress: badge.requirement,
              isCompleted: true
            }
          })

          // Add points to user
          await db.user.update({
            where: { id: userId },
            data: {
              trustScore: {
                increment: badge.points
              }
            }
          })

          newBadges.push(badge)

          logger.info('Badge awarded', {
            userId,
            metadata: {
              badgeId: badge.id,
              badgeName: badge.name,
              points: badge.points
            }
          })
        }
      }

      return newBadges
    } catch (error) {
      logger.error('Error checking badges:', {
        userId,
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      })
      return []
    }
  }

  // Process referral signup
  async processReferralSignup(referrerCode: string, newUserId: string): Promise<boolean> {
    try {
      // Find referrer
      const referrer = await db.user.findFirst({
        where: { referralCode: referrerCode }
      })

      if (!referrer) return false

      // Update referral relationship
      await db.user.update({
        where: { id: newUserId },
        data: { referredBy: referrer.id }
      })

      // Update referrer's referral count
      await db.user.update({
        where: { id: referrer.id },
        data: { referralCount: { increment: 1 } }
      })

      // Award referral rewards
      const reward = this.getReferralReward(referrer.referralCount + 1)

      if (reward.referrerReward > 0) {
        await trustScoreManager.updateTrustScore(
          referrer.id,
          reward.referrerReward,
          `Referral reward for inviting friend #${referrer.referralCount + 1}`
        )
      }

      if (reward.refereeReward > 0) {
        await trustScoreManager.updateTrustScore(
          newUserId,
          reward.refereeReward,
          'Welcome bonus for joining via referral'
        )
      }

      // Check for referral badges
      await this.checkAndAwardBadges(referrer.id)

      logger.info('Referral processed', {
        metadata: {
          referrerId: referrer.id,
          newUserId,
          reward
        }
      })

      return true
    } catch (error) {
      logger.error('Error processing referral:', {
        metadata: {
          referrerCode,
          newUserId,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      })
      return false
    }
  }

  // Get referral reward based on referral count
  private getReferralReward(referralCount: number): ReferralReward {
    // Find the highest threshold that the count meets
    const thresholds = Object.keys(this.referralRewards)
      .map(Number)
      .sort((a, b) => b - a)

    for (const threshold of thresholds) {
      if (referralCount >= threshold) {
        return this.referralRewards[threshold]
      }
    }

    return { referrerReward: 0, refereeReward: 0 }
  }

  // Get leaderboard
  async getLeaderboard(limit: number = 50): Promise<LeaderboardEntry[]> {
    try {
      const users = await db.user.findMany({
        select: {
          id: true,
          phone: true,
          name: true,
          trustScore: true,
          totalHelpsGiven: true,
          totalHelpsTaken: true,
          referralCount: true,
          _count: {
            select: {
              achievements: true
            }
          }
        },
        orderBy: {
          trustScore: 'desc'
        },
        take: limit
      })

      return users.map((user, index) => ({
        userId: user.id,
        phone: user.phone.replace(/(\d{2})\d{6}(\d{2})/, '$1******$2'), // Mask phone
        name: user.name,
        trustScore: user.trustScore,
        totalHelpsGiven: user.totalHelpsGiven,
        totalHelpsTaken: user.totalHelpsTaken,
        badgesEarned: user._count.achievements,
        referralCount: user.referralCount,
        rank: index + 1,
        points: user.trustScore + (user.totalHelpsGiven * 5) + (user.referralCount * 10)
      }))
    } catch (error) {
      logger.error('Error getting leaderboard:', {
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      })
      return []
    }
  }

  // Get user achievements
  async getUserAchievements(userId: string): Promise<Achievement[]> {
    try {
      const achievements = await db.achievement.findMany({
        where: { userId },
        orderBy: {
          unlockedAt: 'desc'
        }
      })

      // Add badge details
      const achievementsWithBadges = await Promise.all(
        achievements.map(async (achievement) => {
          const badge = this.badges.find(b => b.id === achievement.badgeId)
          return {
            ...achievement,
            badge
          }
        })
      )

      return achievementsWithBadges
    } catch (error) {
      logger.error('Error getting user achievements:', {
        userId,
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      })
      return []
    }
  }

  // Get daily challenges for user
  async getDailyChallenges(userId: string): Promise<any[]> {
    try {
      const today = new Date().toISOString().split('T')[0]

      // Get user's progress for today
      const todayProgress = await db.dailyChallenge.findMany({
        where: {
          userId,
          date: today
        }
      })

      const progressMap = new Map(
        todayProgress.map(p => [p.challengeId, { completed: p.completed, progress: p.progress }])
      )

      return this.dailyChallenges.map(challenge => ({
        ...challenge,
        completed: progressMap.get(challenge.id)?.completed || false,
        progress: progressMap.get(challenge.id)?.progress || 0
      }))
    } catch (error) {
      logger.error('Error getting daily challenges:', {
        userId,
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      })
      return []
    }
  }

  // Update daily challenge progress
  async updateDailyChallenge(userId: string, challengeType: string, increment: number = 1): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0]

      const challenge = this.dailyChallenges.find(c => c.type === challengeType)
      if (!challenge) return

      const existing = await db.dailyChallenge.findUnique({
        where: {
          userId_challengeId_date: {
            userId,
            challengeId: challenge.id,
            date: today
          }
        }
      })

      if (existing) {
        const newProgress = existing.progress + increment
        const isCompleted = newProgress >= 1 // Most challenges are one-time

        await db.dailyChallenge.update({
          where: {
            userId_challengeId_date: {
              userId,
              challengeId: challenge.id,
              date: today
            }
          },
          data: {
            progress: newProgress,
            completed: isCompleted
          }
        })

        if (isCompleted && !existing.completed) {
          // Award points
          await trustScoreManager.updateTrustScore(
            userId,
            challenge.points,
            `Daily challenge completed: ${challenge.description}`
          )
        }
      } else {
        await db.dailyChallenge.create({
          data: {
            userId,
            challengeId: challenge.id,
            date: today,
            progress: increment,
            completed: increment >= 1
          }
        })

        if (increment >= 1) {
          await trustScoreManager.updateTrustScore(
            userId,
            challenge.points,
            `Daily challenge completed: ${challenge.description}`
          )
        }
      }
    } catch (error) {
      logger.error('Error updating daily challenge:', {
        metadata: {
          userId,
          challengeType,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      })
    }
  }

  // Get user stats for gamification
  async getUserStats(userId: string): Promise<any> {
    try {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: {
          trustScore: true,
          totalHelpsGiven: true,
          totalHelpsTaken: true,
          referralCount: true,
          _count: {
            select: {
              achievements: true
            }
          }
        }
      })

      if (!user) return null

      const achievements = await this.getUserAchievements(userId)
      const dailyChallenges = await this.getDailyChallenges(userId)
      const leaderboard = await this.getLeaderboard(100)
      const userRank = leaderboard.find(entry => entry.userId === userId)?.rank || 0

      return {
        trustScore: user.trustScore,
        totalHelpsGiven: user.totalHelpsGiven,
        totalHelpsTaken: user.totalHelpsTaken,
        referralCount: user.referralCount,
        badgesEarned: user._count.achievements,
        rank: userRank,
        achievements: achievements.map(a => ({
          badge: a.badge,
          unlockedAt: a.unlockedAt,
          progress: a.progress
        })),
        dailyChallenges,
        nextBadge: this.getNextBadge(user)
      }
    } catch (error) {
      logger.error('Error getting user stats:', {
        userId,
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      })
      return null
    }
  }

  // Get next achievable badge for user
  private getNextBadge(user: any): Badge | null {
    const userAchievements = new Set() // Would need to fetch actual achievements

    for (const badge of this.badges) {
      if (!userAchievements.has(badge.id)) {
        let qualifies = false

        switch (badge.id) {
          case 'first_help':
          case 'helpful_soul':
          case 'community_hero':
          case 'legendary_helper':
            qualifies = user.totalHelpsGiven < badge.requirement
            break
          // Add other badge checks...
        }

        if (qualifies) {
          return badge
        }
      }
    }

    return null
  }
}

// Export singleton instance
export const gamificationManager = new GamificationManager()
