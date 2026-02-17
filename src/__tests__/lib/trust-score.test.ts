import { describe, it, expect, beforeEach, vi } from 'vitest'
import { TrustScoreManager, TrustAction } from '@/lib/trust-score'
import { db } from '@/lib/db'

// Mock the database
vi.mock('@/lib/db', () => ({
  db: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    activityLog: {
      create: vi.fn(),
    },
  },
}))

describe('TrustScoreManager', () => {
  let trustScoreManager: TrustScoreManager

  beforeEach(() => {
    trustScoreManager = TrustScoreManager.getInstance()
    vi.clearAllMocks()
  })

  describe('updateTrustScore', () => {
    it('should update trust score for HELP_COMPLETED action', async () => {
      const mockUser = { trustScore: 50 }
      const mockUpdateResult = { trustScore: 60 }

      vi.mocked(db.user.findUnique).mockResolvedValue(mockUser as any)
      vi.mocked(db.user.update).mockResolvedValue(mockUpdateResult as any)
      vi.mocked(db.activityLog.create).mockResolvedValue({} as any)

      const result = await trustScoreManager.updateTrustScore(
        'user-123',
        TrustAction.HELP_COMPLETED,
        'Completed help request'
      )

      expect(result).toEqual({
        newScore: 60,
        oldScore: 50,
        change: 10,
      })

      expect(db.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { trustScore: 60 },
      })
    })

    it('should set initial score for ACCOUNT_CREATED action', async () => {
      const mockUser = { trustScore: 0 }

      vi.mocked(db.user.findUnique).mockResolvedValue(mockUser as any)
      vi.mocked(db.user.update).mockResolvedValue({ trustScore: 50 } as any)
      vi.mocked(db.activityLog.create).mockResolvedValue({} as any)

      const result = await trustScoreManager.updateTrustScore(
        'user-123',
        TrustAction.ACCOUNT_CREATED,
        'Account created'
      )

      expect(result.newScore).toBe(50)
    })

    it('should not exceed maximum trust score', async () => {
      const mockUser = { trustScore: 95 }

      vi.mocked(db.user.findUnique).mockResolvedValue(mockUser as any)
      vi.mocked(db.user.update).mockResolvedValue({ trustScore: 100 } as any)
      vi.mocked(db.activityLog.create).mockResolvedValue({} as any)

      const result = await trustScoreManager.updateTrustScore(
        'user-123',
        TrustAction.HELP_COMPLETED,
        'Completed help request'
      )

      expect(result.newScore).toBe(100)
    })

    it('should not go below minimum trust score', async () => {
      const mockUser = { trustScore: 5 }

      vi.mocked(db.user.findUnique).mockResolvedValue(mockUser as any)
      vi.mocked(db.user.update).mockResolvedValue({ trustScore: 0 } as any)
      vi.mocked(db.activityLog.create).mockResolvedValue({} as any)

      const result = await trustScoreManager.updateTrustScore(
        'user-123',
        TrustAction.NO_SHOW,
        'No show penalty'
      )

      expect(result.newScore).toBe(0)
    })

    it('should throw error for non-existent user', async () => {
      vi.mocked(db.user.findUnique).mockResolvedValue(null)

      await expect(
        trustScoreManager.updateTrustScore(
          'non-existent-user',
          TrustAction.HELP_COMPLETED,
          'Test action'
        )
      ).rejects.toThrow('User not found')
    })
  })

  describe('getTrustBadge', () => {
    it('should return trusted badge for high scores', () => {
      const badge = trustScoreManager.getTrustBadge(85)

      expect(badge).toEqual({
        level: 'trusted',
        label: 'Trusted',
        color: 'text-green-600',
        icon: '🛡️',
      })
    })

    it('should return neutral badge for medium scores', () => {
      const badge = trustScoreManager.getTrustBadge(55)

      expect(badge).toEqual({
        level: 'neutral',
        label: 'Neutral',
        color: 'text-yellow-600',
        icon: '⚖️',
      })
    })

    it('should return restricted badge for low scores', () => {
      const badge = trustScoreManager.getTrustBadge(25)

      expect(badge).toEqual({
        level: 'restricted',
        label: 'Restricted',
        color: 'text-red-600',
        icon: '⚠️',
      })
    })
  })

  describe('canPerformAction', () => {
    it('should allow action for sufficient trust score', () => {
      const canPerform = trustScoreManager.canPerformAction(75, 70)
      expect(canPerform).toBe(true)
    })

    it('should deny action for insufficient trust score', () => {
      const canPerform = trustScoreManager.canPerformAction(60, 70)
      expect(canPerform).toBe(false)
    })
  })

  describe('getTrustScoreHistory', () => {
    it('should return formatted trust score history', async () => {
      const mockLogs = [
        {
          userId: 'user-123',
          action: 'TRUST_SCORE_HELP_COMPLETED',
          details: JSON.stringify({
            points: 10,
            reason: 'Help completed',
            timestamp: new Date(),
          }),
          createdAt: new Date(),
        },
      ]

      vi.mocked(db.activityLog.findMany).mockResolvedValue(mockLogs as any)

      const history = await trustScoreManager.getTrustScoreHistory('user-123')

      expect(history).toHaveLength(1)
      expect(history[0]).toMatchObject({
        userId: 'user-123',
        action: 'HELP_COMPLETED',
        points: 10,
        reason: 'Help completed',
      })
    })
  })
})
