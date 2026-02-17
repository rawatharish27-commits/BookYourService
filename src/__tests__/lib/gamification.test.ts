import { describe, it, expect, beforeEach, vi } from 'vitest'
import { gamificationManager } from '@/lib/gamification'
import { db } from '@/lib/db'

// Mock the database
vi.mock('@/lib/db', () => ({
  db: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
    },
    achievement: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    activityLog: {
      create: vi.fn(),
    },
    dailyChallenge: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    feedback: {
      count: vi.fn(),
    },
  },
}))

describe('GamificationManager', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('checkAndAwardBadges', () => {
    it('should award first_help badge for user with 1 help given', async () => {
      const mockUser = {
        id: 'user-123',
        trustScore: 50,
        totalHelpsGiven: 1,
        totalHelpsTaken: 0,
        referralCount: 0,
      }

      vi.mocked(db.user.findUnique).mockResolvedValue(mockUser as any)
      vi.mocked(db.achievement.findMany).mockResolvedValue([])
      vi.mocked(db.achievement.create).mockResolvedValue({} as any)
      vi.mocked(db.user.update).mockResolvedValue({} as any)

      const badges = await gamificationManager.checkAndAwardBadges('user-123')

      expect(badges).toHaveLength(1)
      expect(badges[0].id).toBe('first_help')
      expect(db.achievement.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-123',
          badgeId: 'first_help',
          unlockedAt: expect.any(Date),
          progress: 1,
          isCompleted: true,
        },
      })
    })

    it('should not award duplicate badges', async () => {
      const mockUser = {
        id: 'user-123',
        trustScore: 50,
        totalHelpsGiven: 1,
        totalHelpsTaken: 0,
        referralCount: 0,
      }

      const existingAchievements = [{ badgeId: 'first_help' }]

      vi.mocked(db.user.findUnique).mockResolvedValue(mockUser as any)
      vi.mocked(db.achievement.findMany).mockResolvedValue(existingAchievements as any)
      vi.mocked(db.achievement.create).mockResolvedValue({} as any)
      vi.mocked(db.user.update).mockResolvedValue({} as any)

      const badges = await gamificationManager.checkAndAwardBadges('user-123')

      expect(badges).toHaveLength(0)
      expect(db.achievement.create).not.toHaveBeenCalled()
    })

    it('should award trust_builder badge for high trust score', async () => {
      const mockUser = {
        id: 'user-123',
        trustScore: 85,
        totalHelpsGiven: 0,
        totalHelpsTaken: 0,
        referralCount: 0,
      }

      vi.mocked(db.user.findUnique).mockResolvedValue(mockUser as any)
      vi.mocked(db.achievement.findMany).mockResolvedValue([])
      vi.mocked(db.achievement.create).mockResolvedValue({} as any)
      vi.mocked(db.user.update).mockResolvedValue({} as any)

      const badges = await gamificationManager.checkAndAwardBadges('user-123')

      expect(badges).toHaveLength(1)
      expect(badges[0].id).toBe('trust_builder')
    })
  })

  describe('processReferralSignup', () => {
    it('should process referral and award points', async () => {
      const mockReferrer = {
        id: 'referrer-123',
        referralCount: 0,
      }

      vi.mocked(db.user.findFirst).mockResolvedValue(mockReferrer as any)
      vi.mocked(db.user.update).mockResolvedValue({} as any)
      vi.mocked(db.activityLog.create).mockResolvedValue({} as any)

      const result = await gamificationManager.processReferralSignup('REF123', 'new-user-123')

      expect(result).toBe(true)
      expect(db.user.update).toHaveBeenCalledTimes(2) // Update referrer count and award points
    })

    it('should return false for invalid referral code', async () => {
      vi.mocked(db.user.findFirst).mockResolvedValue(null)

      const result = await gamificationManager.processReferralSignup('INVALID', 'new-user-123')

      expect(result).toBe(false)
    })
  })

  describe('getLeaderboard', () => {
    it('should return formatted leaderboard', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          phone: '1234567890',
          name: 'John Doe',
          trustScore: 85,
          totalHelpsGiven: 10,
          totalHelpsTaken: 5,
          referralCount: 3,
          _count: { achievements: 5 },
        },
      ]

      vi.mocked(db.user.findMany).mockResolvedValue(mockUsers as any)

      const leaderboard = await gamificationManager.getLeaderboard(10)

      expect(leaderboard).toHaveLength(1)
      expect(leaderboard[0]).toMatchObject({
        userId: 'user-1',
        phone: '12******90', // Masked phone
        name: 'John Doe',
        trustScore: 85,
        totalHelpsGiven: 10,
        totalHelpsTaken: 5,
        referralCount: 3,
        badgesEarned: 5,
        rank: 1,
        points: 85 + (10 * 5) + (3 * 10), // 85 + 50 + 30 = 165
      })
    })
  })

  describe('getUserAchievements', () => {
    it('should return user achievements with badge details', async () => {
      const mockAchievements = [
        {
          id: 'ach-1',
          userId: 'user-123',
          badgeId: 'first_help',
          unlockedAt: new Date(),
          progress: 1,
          isCompleted: true,
        },
      ]

      vi.mocked(db.achievement.findMany).mockResolvedValue(mockAchievements as any)

      const achievements = await gamificationManager.getUserAchievements('user-123')

      expect(achievements).toHaveLength(1)
      expect(achievements[0]).toMatchObject({
        id: 'ach-1',
        userId: 'user-123',
        badgeId: 'first_help',
        unlockedAt: expect.any(Date),
        progress: 1,
        isCompleted: true,
        badge: expect.objectContaining({
          id: 'first_help',
          name: 'First Helper',
        }),
      })
    })
  })

  describe('getDailyChallenges', () => {
    it('should return daily challenges with progress', async () => {
      const today = new Date().toISOString().split('T')[0]
      const mockProgress = [
        {
          challengeId: 'help_someone',
          completed: true,
          progress: 1,
        },
      ]

      vi.mocked(db.dailyChallenge.findMany).mockResolvedValue(mockProgress as any)

      const challenges = await gamificationManager.getDailyChallenges('user-123')

      expect(challenges).toHaveLength(4) // 4 challenge types
      const helpChallenge = challenges.find(c => c.id === 'help_someone')
      expect(helpChallenge).toMatchObject({
        id: 'help_someone',
        description: 'Help someone today',
        points: 20,
        type: 'HELP_GIVEN',
        completed: true,
        progress: 1,
      })
    })
  })

  describe('updateDailyChallenge', () => {
    it('should create new daily challenge progress', async () => {
      const today = new Date().toISOString().split('T')[0]

      vi.mocked(db.dailyChallenge.findUnique).mockResolvedValue(null)
      vi.mocked(db.dailyChallenge.create).mockResolvedValue({} as any)
      vi.mocked(db.user.update).mockResolvedValue({} as any)
      vi.mocked(db.activityLog.create).mockResolvedValue({} as any)

      await gamificationManager.updateDailyChallenge('user-123', 'HELP_GIVEN', 1)

      expect(db.dailyChallenge.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-123',
          challengeId: 'help_someone',
          date: today,
          progress: 1,
          completed: true,
        },
      })
    })

    it('should update existing daily challenge progress', async () => {
      const mockExisting = {
        progress: 0,
        completed: false,
      }

      vi.mocked(db.dailyChallenge.findUnique).mockResolvedValue(mockExisting as any)
      vi.mocked(db.dailyChallenge.update).mockResolvedValue({} as any)
      vi.mocked(db.user.update).mockResolvedValue({} as any)
      vi.mocked(db.activityLog.create).mockResolvedValue({} as any)

      await gamificationManager.updateDailyChallenge('user-123', 'HELP_GIVEN', 1)

      expect(db.dailyChallenge.update).toHaveBeenCalledWith({
        where: {
          userId_challengeId_date: {
            userId: 'user-123',
            challengeId: 'help_someone',
            date: expect.any(String),
          },
        },
        data: {
          progress: 1,
          completed: true,
        },
      })
    })
  })

  describe('getUserStats', () => {
    it('should return comprehensive user stats', async () => {
      const mockUser = {
        trustScore: 75,
        totalHelpsGiven: 5,
        totalHelpsTaken: 3,
        referralCount: 2,
        _count: { achievements: 3 },
      }

      const mockAchievements = [
        {
          id: 'ach-1',
          badgeId: 'first_help',
          unlockedAt: new Date(),
          progress: 1,
          badge: { id: 'first_help', name: 'First Helper' },
        },
      ]

      vi.mocked(db.user.findUnique).mockResolvedValue(mockUser as any)
      vi.mocked(db.achievement.findMany).mockResolvedValue(mockAchievements as any)
      vi.mocked(db.dailyChallenge.findMany).mockResolvedValue([])
      vi.mocked(db.user.findMany).mockResolvedValue([])

      const stats = await gamificationManager.getUserStats('user-123')

      expect(stats).toMatchObject({
        trustScore: 75,
        totalHelpsGiven: 5,
        totalHelpsTaken: 3,
        referralCount: 2,
        badgesEarned: 3,
        rank: 0,
        achievements: expect.any(Array),
        dailyChallenges: expect.any(Array),
      })
    })
  })
})
