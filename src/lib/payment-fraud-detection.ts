import { db } from './db'
import { logger } from './logger'
import { trustScoreManager, TrustAction } from './trust-score'

export interface PaymentFraudCheck {
  userId: string
  amount: number
  paymentMethod: 'RAZORPAY' | 'UPI' | 'BANK_TRANSFER'
  ipAddress?: string
  userAgent?: string
  deviceFingerprint?: string
}

export interface FraudAnalysisResult {
  isFraudulent: boolean
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  reasons: string[]
  recommendedAction: 'APPROVE' | 'REJECT' | 'MANUAL_REVIEW' | 'BLOCK_USER'
  confidence: number // 0-100
}

export class PaymentFraudDetector {
  private static instance: PaymentFraudDetector

  private constructor() {}

  static getInstance(): PaymentFraudDetector {
    if (!PaymentFraudDetector.instance) {
      PaymentFraudDetector.instance = new PaymentFraudDetector()
    }
    return PaymentFraudDetector.instance
  }

  // Analyze payment for fraud
  async analyzePayment(payment: PaymentFraudCheck): Promise<FraudAnalysisResult> {
    try {
      const reasons: string[] = []
      let riskScore = 0

      // Check user payment history
      const userHistory = await this.getUserPaymentHistory(payment.userId)
      const historyCheck = this.analyzePaymentHistory(userHistory, payment)
      reasons.push(...historyCheck.reasons)
      riskScore += historyCheck.riskScore

      // Check amount anomalies
      const amountCheck = this.checkAmountAnomalies(payment.amount, userHistory)
      reasons.push(...amountCheck.reasons)
      riskScore += amountCheck.riskScore

      // Check timing patterns
      const timingCheck = await this.checkTimingPatterns(payment.userId)
      reasons.push(...timingCheck.reasons)
      riskScore += timingCheck.riskScore

      // Check device and IP consistency
      if (payment.ipAddress || payment.deviceFingerprint) {
        const deviceCheck = await this.checkDeviceConsistency(payment)
        reasons.push(...deviceCheck.reasons)
        riskScore += deviceCheck.riskScore
      }

      // Check for suspicious patterns
      const patternCheck = await this.checkSuspiciousPatterns(payment)
      reasons.push(...patternCheck.reasons)
      riskScore += patternCheck.riskScore

      // Determine risk level and action
      const riskLevel = this.calculateRiskLevel(riskScore)
      const recommendedAction = this.determineAction(riskLevel, reasons)

      // Log fraud analysis
      logger.info('Payment fraud analysis completed', {
        userId: payment.userId,
        amount: payment.amount,
        riskLevel,
        riskScore,
        reasonsCount: reasons.length,
        recommendedAction
      })

      return {
        isFraudulent: riskLevel === 'HIGH',
        riskLevel,
        reasons,
        recommendedAction,
        confidence: Math.min(100, Math.max(0, riskScore))
      }

    } catch (error) {
      logger.error('Payment fraud analysis error:', {
        userId: payment.userId,
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      })

      // Default to manual review on error
      return {
        isFraudulent: false,
        riskLevel: 'MEDIUM',
        reasons: ['Analysis error - manual review required'],
        recommendedAction: 'MANUAL_REVIEW',
        confidence: 50
      }
    }
  }

  // Get user payment history for analysis
  private async getUserPaymentHistory(userId: string): Promise<any[]> {
    try {
      const payments = await db.payment.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          amount: true,
          status: true,
          createdAt: true,
          utiRef: true
        }
      })
      return payments
    } catch (error) {
      logger.error('Get payment history error:', {
        userId,
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      })
      return []
    }
  }

  // Analyze payment history patterns
  private analyzePaymentHistory(history: any[], currentPayment: PaymentFraudCheck): { reasons: string[], riskScore: number } {
    const reasons: string[] = []
    let riskScore = 0

    if (history.length === 0) {
      // First payment - slightly lower risk
      return { reasons: ['First payment'], riskScore: -5 }
    }

    // Check for failed/rejected payments
    const failedPayments = history.filter((p: any) => p.status === 'REJECTED')
    if (failedPayments.length > 0) {
      reasons.push(`${failedPayments.length} previous failed payments`)
      riskScore += failedPayments.length * 10
    }

    // Check payment frequency
    const recentPayments = history.filter((p: any) => {
      const paymentDate = new Date(p.createdAt)
      const daysSince = (Date.now() - paymentDate.getTime()) / (1000 * 60 * 60 * 24)
      return daysSince <= 30 // Last 30 days
    })

    if (recentPayments.length >= 3) {
      reasons.push('Multiple payments in short period')
      riskScore += 15
    }

    // Check for exact amount repetition (suspicious pattern)
    const sameAmountPayments = history.filter((p: any) => p.amount === currentPayment.amount)
    if (sameAmountPayments.length >= 2) {
      reasons.push('Repeated exact payment amounts')
      riskScore += 10
    }

    return { reasons, riskScore }
  }

  // Check for amount anomalies
  private checkAmountAnomalies(amount: number, history: any[]): { reasons: string[], riskScore: number } {
    const reasons: string[] = []
    let riskScore = 0

    // Check if amount is unusual
    if (amount !== 49) { // Standard subscription amount
      reasons.push(`Unusual amount: ₹${amount} (expected ₹49)`)
      riskScore += 20
    }

    // Check for round number patterns (often fraudulent)
    if (amount % 10 === 0 && amount > 100) {
      reasons.push('Round number amount pattern')
      riskScore += 5
    }

    return { reasons, riskScore }
  }

  // Check timing patterns for fraud
  private async checkTimingPatterns(userId: string): Promise<{ reasons: string[], riskScore: number }> {
    const reasons: string[] = []
    let riskScore = 0

    try {
      // Check recent payment attempts
      const recentAttempts = await db.activityLog.findMany({
        where: {
          userId,
          action: 'PAYMENT_ATTEMPT',
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      })

      if (recentAttempts.length > 3) {
        reasons.push('Multiple payment attempts in 24 hours')
        riskScore += 15
      }

      // Check for payments at unusual hours
      const now = new Date()
      const hour = now.getHours()
      if (hour < 6 || hour > 22) { // Outside 6 AM - 10 PM
        reasons.push('Payment attempted at unusual hour')
        riskScore += 5
      }

    } catch (error) {
      logger.error('Check timing patterns error:', {
        userId,
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      })
    }

    return { reasons, riskScore }
  }

  // Check device and IP consistency
  private async checkDeviceConsistency(payment: PaymentFraudCheck): Promise<{ reasons: string[], riskScore: number }> {
    const reasons: string[] = []
    let riskScore = 0

    try {
      // Get user's recent activity
      const recentActivity = await db.activityLog.findMany({
        where: {
          userId: payment.userId,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        },
        take: 20
      })

      // Check IP consistency
      if (payment.ipAddress) {
        const uniqueIPs = new Set(recentActivity.map((a: any) => a.ipAddress).filter(Boolean))
        if (uniqueIPs.size > 3) {
          reasons.push('Multiple IP addresses used recently')
          riskScore += 10
        }
      }

      // Check for VPN/proxy indicators (simplified check)
      if (payment.ipAddress && this.isLikelyVPN(payment.ipAddress)) {
        reasons.push('IP address suggests VPN usage')
        riskScore += 15
      }

    } catch (error) {
      logger.error('Check device consistency error:', {
        userId: payment.userId,
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      })
    }

    return { reasons, riskScore }
  }

  // Check for suspicious patterns
  private async checkSuspiciousPatterns(payment: PaymentFraudCheck): Promise<{ reasons: string[], riskScore: number }> {
    const reasons: string[] = []
    let riskScore = 0

    try {
      // Check if user has been flagged before
      const user = await db.user.findUnique({
        where: { id: payment.userId },
        select: { isFrozen: true, trustScore: true }
      })

      if (user?.isFrozen) {
        reasons.push('User account is frozen')
        riskScore += 50
      }

      if (user && user.trustScore < 30) {
        reasons.push('Low trust score user')
        riskScore += 20
      }

      // Check for bulk payment patterns (multiple users from same source)
      if (payment.ipAddress) {
        const recentPaymentsFromIP = await db.activityLog.count({
          where: {
            ipAddress: payment.ipAddress,
            action: 'PAYMENT_ATTEMPT',
            createdAt: {
              gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
            }
          }
        })

        if (recentPaymentsFromIP > 5) {
          reasons.push('High payment volume from same IP')
          riskScore += 25
        }
      }

    } catch (error) {
      logger.error('Check suspicious patterns error:', {
        userId: payment.userId,
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      })
    }

    return { reasons, riskScore }
  }

  // Calculate risk level from score
  private calculateRiskLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' {
    if (score >= 40) return 'HIGH'
    if (score >= 20) return 'MEDIUM'
    return 'LOW'
  }

  // Determine recommended action
  private determineAction(riskLevel: 'LOW' | 'MEDIUM' | 'HIGH', reasons: string[]): 'APPROVE' | 'REJECT' | 'MANUAL_REVIEW' | 'BLOCK_USER' {
    if (riskLevel === 'HIGH') {
      if (reasons.some(r => r.includes('frozen') || r.includes('suspicious'))) {
        return 'BLOCK_USER'
      }
      return 'REJECT'
    }

    if (riskLevel === 'MEDIUM') {
      return 'MANUAL_REVIEW'
    }

    return 'APPROVE'
  }

  // Check if IP is likely a VPN
  private isLikelyVPN(ip: string): boolean {
    // Simplified VPN detection - in production, use a proper VPN detection service
    // This is just a basic check for common VPN patterns
    const vpnPatterns = [
      /^10\./,      // Private IP ranges
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // More private ranges
      /^192\.168\./, // Private IP
      // Add more patterns as needed
    ]

    return vpnPatterns.some(pattern => pattern.test(ip))
  }

  // Process fraud detection result
  async processFraudResult(
    userId: string,
    result: FraudAnalysisResult,
    paymentId?: string
  ): Promise<void> {
    try {
      // Log the fraud analysis result
      await db.activityLog.create({
        data: {
          userId,
          action: 'FRAUD_ANALYSIS_COMPLETED',
          details: JSON.stringify({
            paymentId,
            riskLevel: result.riskLevel,
            isFraudulent: result.isFraudulent,
            recommendedAction: result.recommendedAction,
            confidence: result.confidence
          })
        }
      })

      // Take action based on result
      if (result.recommendedAction === 'BLOCK_USER') {
        await db.user.update({
          where: { id: userId },
          data: { isFrozen: true }
        })

        await trustScoreManager.updateTrustScore(
          userId,
          TrustAction.SUSPICIOUS_ACTIVITY,
          `Payment fraud detected: ${result.reasons.join(', ')}`
        )

        logger.warn('User blocked due to fraud detection', {
          userId,
          reasons: result.reasons
        })
      } else if (result.riskLevel === 'HIGH') {
        await trustScoreManager.updateTrustScore(
          userId,
          TrustAction.SUSPICIOUS_ACTIVITY,
          `Suspicious payment activity: ${result.reasons.join(', ')}`
        )
      }

    } catch (error) {
      logger.error('Process fraud result error:', {
        userId,
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      })
    }
  }
}

// Export singleton instance
export const paymentFraudDetector = PaymentFraudDetector.getInstance()
