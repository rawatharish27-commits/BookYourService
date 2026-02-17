import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/auth/send-otp/route'
import { db } from '@/lib/db'

// Mock the database
vi.mock('@/lib/db', () => ({
  db: {
    oTP: {
      deleteMany: vi.fn(),
      create: vi.fn(),
    },
  },
}))

// Mock the rate limit
vi.mock('@/lib/rate-limit', () => ({
  authRateLimit: vi.fn().mockReturnValue(null),
}))

describe('/api/auth/send-otp', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should send OTP successfully for valid phone number', async () => {
    const mockRequest = new NextRequest('http://localhost:3000/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone: '9876543210' }),
      headers: {
        'content-type': 'application/json',
      },
    })

    vi.mocked(db.oTP.deleteMany).mockResolvedValue({ count: 1 })
    vi.mocked(db.oTP.create).mockResolvedValue({
      id: 'otp-123',
      phone: '9876543210',
      code: '123456',
      expiresAt: new Date(),
      used: false,
      createdAt: new Date(),
    })

    const response = await POST(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({
      success: true,
      message: 'OTP sent successfully',
    })

    expect(db.oTP.deleteMany).toHaveBeenCalledWith({
      where: { phone: '9876543210' },
    })

    expect(db.oTP.create).toHaveBeenCalledWith({
      data: {
        id: expect.any(String),
        phone: '9876543210',
        code: expect.stringMatching(/^\d{6}$/),
        expiresAt: expect.any(Date),
      },
    })
  })

  it('should validate phone number format', async () => {
    const testCases = [
      { phone: '12345', description: 'too short' },
      { phone: '12345678901', description: 'too long' },
      { phone: 'abcdefghij', description: 'non-numeric' },
      { phone: '1234567890', description: 'starts with 1' },
    ]

    for (const { phone, description } of testCases) {
      const mockRequest = new NextRequest('http://localhost:3000/api/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ phone }),
        headers: {
          'content-type': 'application/json',
        },
      })

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status, `Failed for ${description}`).toBe(400)
      expect(data.error, `Failed for ${description}`).toContain('Valid 10-digit Indian phone number required')
    }
  })

  it('should handle missing phone field', async () => {
    const mockRequest = new NextRequest('http://localhost:3000/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: {
        'content-type': 'application/json',
      },
    })

    const response = await POST(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Valid 10-digit Indian phone number required')
  })

  it('should handle invalid JSON', async () => {
    const mockRequest = new NextRequest('http://localhost:3000/api/auth/send-otp', {
      method: 'POST',
      body: 'invalid json',
      headers: {
        'content-type': 'application/json',
      },
    })

    const response = await POST(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Valid 10-digit Indian phone number required')
  })

  it('should handle database errors', async () => {
    const mockRequest = new NextRequest('http://localhost:3000/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone: '9876543210' }),
      headers: {
        'content-type': 'application/json',
      },
    })

    vi.mocked(db.oTP.deleteMany).mockRejectedValue(new Error('Database connection failed'))

    const response = await POST(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to send OTP')
  })

  it('should apply rate limiting', async () => {
    const { authRateLimit } = await import('@/lib/rate-limit')
    const mockRateLimitResponse = new Response('Rate limited', { status: 429 })

    vi.mocked(authRateLimit).mockReturnValue(mockRateLimitResponse)

    const mockRequest = new NextRequest('http://localhost:3000/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone: '9876543210' }),
      headers: {
        'content-type': 'application/json',
      },
    })

    const response = await POST(mockRequest)

    expect(response.status).toBe(429)
    expect(authRateLimit).toHaveBeenCalledWith(mockRequest)
  })

  it('should generate 6-digit OTP', async () => {
    const mockRequest = new NextRequest('http://localhost:3000/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone: '9876543210' }),
      headers: {
        'content-type': 'application/json',
      },
    })

    vi.mocked(db.oTP.deleteMany).mockResolvedValue({ count: 0 })
    vi.mocked(db.oTP.create).mockImplementation(async (args) => {
      const code = args.data.code
      expect(code).toMatch(/^\d{6}$/)
      expect(code.length).toBe(6)
      return {
        id: 'otp-123',
        phone: '9876543210',
        code,
        expiresAt: new Date(),
        used: false,
        createdAt: new Date(),
      }
    })

    await POST(mockRequest)

    expect(db.oTP.create).toHaveBeenCalled()
  })

  it('should set OTP expiry to 5 minutes from now', async () => {
    const beforeTime = new Date()
    const mockRequest = new NextRequest('http://localhost:3000/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone: '9876543210' }),
      headers: {
        'content-type': 'application/json',
      },
    })

    vi.mocked(db.oTP.deleteMany).mockResolvedValue({ count: 0 })
    vi.mocked(db.oTP.create).mockImplementation(async (args) => {
      const expiresAt = args.data.expiresAt
      const now = new Date()
      const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000)

      // Should be approximately 5 minutes from now
      expect(expiresAt.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime())
      expect(expiresAt.getTime()).toBeLessThanOrEqual(fiveMinutesFromNow.getTime() + 1000) // Allow 1 second tolerance

      return {
        id: 'otp-123',
        phone: '9876543210',
        code: '123456',
        expiresAt,
        used: false,
        createdAt: new Date(),
      }
    })

    await POST(mockRequest)

    expect(db.oTP.create).toHaveBeenCalled()
  })
})
