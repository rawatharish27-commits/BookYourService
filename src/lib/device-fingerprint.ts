import { db } from './db'
import { logger } from './logger'
import { trustScoreManager, TrustAction } from './trust-score'

export interface DeviceFingerprint {
  userId: string
  fingerprint: string
  userAgent: string
  ipAddress: string
  screenResolution: string
  timezone: string
  language: string
  platform: string
  cookiesEnabled: boolean
  doNotTrack: boolean
  touchSupport: boolean
  firstSeen: Date
  lastSeen: Date
  trustScore: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
}

export class DeviceFingerprintManager {
  private static instance: DeviceFingerprintManager

  // Risk thresholds
  private static readonly RISK_THRESHOLDS = {
    NEW_DEVICE_PENALTY: -5,
    SUSPICIOUS_DEVICE_PENALTY: -10,
    HIGH_RISK_DEVICE_PENALTY: -25,
    TRUSTED_DEVICE_BONUS: 2,
    MAX_DEVICES_PER_USER: 5
  }

  private constructor() {}

  static getInstance(): DeviceFingerprintManager {
    if (!DeviceFingerprintManager.instance) {
      DeviceFingerprintManager.instance = new DeviceFingerprintManager()
    }
    return DeviceFingerprintManager.instance
  }

  // Generate device fingerprint from browser data
  generateFingerprint(browserData: {
    userAgent: string
    screenResolution: string
    timezone: string
    language: string
    platform: string
    cookiesEnabled: boolean
    doNotTrack: boolean
    touchSupport: boolean
    canvasFingerprint?: string
    webglFingerprint?: string
    plugins?: string[]
  }): string {
    // Create a deterministic fingerprint from device characteristics
    const components = [
      browserData.userAgent,
      browserData.screenResolution,
      browserData.timezone,
      browserData.language,
      browserData.platform,
      browserData.cookiesEnabled.toString(),
      browserData.doNotTrack.toString(),
      browserData.touchSupport.toString(),
      browserData.canvasFingerprint || '',
      browserData.webglFingerprint || '',
      (browserData.plugins || []).sort().join(',')
    ]

    // Simple hash function for fingerprinting
    let hash = 0
    const str = components.join('|')
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }

    return Math.abs(hash).toString(36)
  }

  // Register or update device fingerprint
  async registerDevice(
    userId: string,
    fingerprint: string,
    deviceData: Partial<DeviceFingerprint>
  ): Promise<{ isNewDevice: boolean; riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' }> {
    try {
      // Check if device already exists for user
      const existingDevice = await db.activityLog.findFirst({
        where: {
          userId,
          action: 'DEVICE_REGISTERED',
          details: {
            contains: `"fingerprint":"${fingerprint}"`
          }
        }
      })

      const isNewDevice = !existingDevice
      let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW'

      if (isNewDevice) {
        // Check how many devices user has
        const userDevices = await this.getUserDevices(userId)

        if (userDevices.length >= DeviceFingerprintManager.RISK_THRESHOLDS.MAX_DEVICES_PER_USER) {
          riskLevel = 'HIGH'
          logger.warn('User exceeded maximum devices', {
            userId,
            metadata: {
              deviceCount: userDevices.length,
              fingerprint: fingerprint.substring(0, 8)
            }
          })
        } else if (userDevices.length >= 3) {
          riskLevel = 'MEDIUM'
        }

        // Register new device
        await db.activityLog.create({
          data: {
            userId,
            action: 'DEVICE_REGISTERED',
            details: JSON.stringify({
              fingerprint,
              userAgent: deviceData.userAgent,
              ipAddress: deviceData.ipAddress,
              screenResolution: deviceData.screenResolution,
              timezone: deviceData.timezone,
              language: deviceData.language,
              platform: deviceData.platform,
              cookiesEnabled: deviceData.cookiesEnabled,
              doNotTrack: deviceData.doNotTrack,
              touchSupport: deviceData.touchSupport,
              firstSeen: new Date().toISOString(),
              trustScore: 50, // Start with neutral score
              riskLevel
            })
          }
        })

        // Penalize trust score for new device
        const penalty = riskLevel === 'HIGH'
          ? DeviceFingerprintManager.RISK_THRESHOLDS.HIGH_RISK_DEVICE_PENALTY
          : riskLevel === 'MEDIUM'
          ? DeviceFingerprintManager.RISK_THRESHOLDS.SUSPICIOUS_DEVICE_PENALTY
          : DeviceFingerprintManager.RISK_THRESHOLDS.NEW_DEVICE_PENALTY

        await trustScoreManager.updateTrustScore(
          userId,
          TrustAction.SUSPICIOUS_ACTIVITY,
          `New device registered: ${fingerprint.substring(0, 8)}...`
        )

        logger.info('New device registered', {
          userId,
          metadata: {
            fingerprint: fingerprint.substring(0, 8),
            riskLevel,
            deviceCount: userDevices.length + 1
          }
        })

      } else {
        // Update last seen for existing device
        await db.activityLog.updateMany({
          where: {
            userId,
            action: 'DEVICE_REGISTERED',
            details: {
              contains: `"fingerprint":"${fingerprint}"`
            }
          },
          data: {
            details: JSON.stringify({
              ...JSON.parse(existingDevice.details || '{}'),
              lastSeen: new Date().toISOString()
            })
          }
        })

        // Small trust bonus for returning trusted device
        if (riskLevel === 'LOW') {
          await trustScoreManager.updateTrustScore(
            userId,
            TrustAction.LONG_TERM_MEMBER,
            'Returning trusted device'
          )
        }
      }

      return { isNewDevice, riskLevel }

    } catch (error) {
      logger.error('Device registration error:', {
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      })
      return { isNewDevice: false, riskLevel: 'LOW' }
    }
  }

  // Get all devices for a user
  async getUserDevices(userId: string): Promise<DeviceFingerprint[]> {
    try {
      const deviceLogs = await db.activityLog.findMany({
        where: {
          userId,
          action: 'DEVICE_REGISTERED'
        },
        orderBy: { createdAt: 'desc' }
      })

      return deviceLogs.map(log => {
        const details = JSON.parse(log.details || '{}')
        return {
          userId,
          fingerprint: details.fingerprint || '',
          userAgent: details.userAgent || '',
          ipAddress: details.ipAddress || '',
          screenResolution: details.screenResolution || '',
          timezone: details.timezone || '',
          language: details.language || '',
          platform: details.platform || '',
          cookiesEnabled: details.cookiesEnabled || false,
          doNotTrack: details.doNotTrack || false,
          touchSupport: details.touchSupport || false,
          firstSeen: new Date(details.firstSeen || log.createdAt),
          lastSeen: new Date(details.lastSeen || log.createdAt),
          trustScore: details.trustScore || 50,
          riskLevel: details.riskLevel || 'LOW'
        }
      })
    } catch (error) {
      logger.error('Get user devices error:', {
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      })
      return []
    }
  }

  // Check if device is suspicious
  async checkDeviceSuspicion(
    userId: string,
    fingerprint: string,
    currentData: Partial<DeviceFingerprint>
  ): Promise<{
    isSuspicious: boolean
    reasons: string[]
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  }> {
    const reasons: string[] = []
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW'

    try {
      const userDevices = await this.getUserDevices(userId)
      const device = userDevices.find(d => d.fingerprint === fingerprint)

      if (!device) {
        reasons.push('Unknown device')
        riskLevel = 'HIGH'
      } else {
        // Check for significant changes in device characteristics
        if (currentData.ipAddress && device.ipAddress !== currentData.ipAddress) {
          // Check if IP is from different country/region (simplified check)
          if (this.isSuspiciousIPChange(device.ipAddress, currentData.ipAddress)) {
            reasons.push('Suspicious IP address change')
            riskLevel = 'MEDIUM'
          }
        }

        if (currentData.timezone && device.timezone !== currentData.timezone) {
          reasons.push('Timezone changed')
          riskLevel = Math.max(riskLevel === 'LOW' ? 'MEDIUM' : riskLevel) as any
        }

        // Check time since last seen
        const daysSinceLastSeen = (Date.now() - device.lastSeen.getTime()) / (1000 * 60 * 60 * 24)
        if (daysSinceLastSeen > 90) {
          reasons.push('Device not seen for 90+ days')
          riskLevel = Math.max(riskLevel === 'LOW' ? 'MEDIUM' : riskLevel) as any
        }
      }

      // Check device count
      if (userDevices.length > DeviceFingerprintManager.RISK_THRESHOLDS.MAX_DEVICES_PER_USER) {
        reasons.push('Too many registered devices')
        riskLevel = 'HIGH'
      }

    } catch (error) {
      logger.error('Device suspicion check error:', {
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      })
    }

    return {
      isSuspicious: riskLevel !== 'LOW',
      reasons,
      riskLevel
    }
  }

  // Simplified IP change check (in production, use GeoIP database)
  private isSuspiciousIPChange(oldIP: string, newIP: string): boolean {
    // Very basic check - different first octet suggests different network
    const oldFirstOctet = oldIP.split('.')[0]
    const newFirstOctet = newIP.split('.')[0]

    return oldFirstOctet !== newFirstOctet
  }

  // Clean up old device records (keep only recent ones)
  async cleanupOldDevices(daysOld = 365): Promise<number> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysOld)

      const result = await db.activityLog.deleteMany({
        where: {
          action: 'DEVICE_REGISTERED',
          createdAt: { lt: cutoffDate },
          details: {
            contains: '"lastSeen":',
            not: {
              contains: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Keep if seen in last 30 days
            }
          }
        }
      })

      logger.info('Cleaned up old device records', {
        metadata: { deletedCount: result.count }
      })

      return result.count
    } catch (error) {
      logger.error('Cleanup old devices error:', {
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      })
      return 0
    }
  }
}

// Export singleton instance
export const deviceFingerprintManager = DeviceFingerprintManager.getInstance()
