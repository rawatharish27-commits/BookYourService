import { db } from './db'
import { logger } from './logger'
import { trustScoreManager, TrustAction } from './trust-score'
import { locationValidator } from './location-validator'

export interface LocationPrivacySettings {
  userId: string
  locationEnabled: boolean
  foregroundOnly: boolean
  shareWithHelpers: boolean
  shareWithClients: boolean
  lastLocationUpdate: Date | null
  locationAccuracy: number
  mockLocationDetected: boolean
}

export interface LocationUpdate {
  userId: string
  latitude: number
  longitude: number
  accuracy: number
  isForeground: boolean
  timestamp: Date
  mockLocationFlag?: boolean
}

export class LocationPrivacyManager {
  private static instance: LocationPrivacyManager

  private constructor() {}

  static getInstance(): LocationPrivacyManager {
    if (!LocationPrivacyManager.instance) {
      LocationPrivacyManager.instance = new LocationPrivacyManager()
    }
    return LocationPrivacyManager.instance
  }

  // Initialize user location privacy settings
  async initializeUserSettings(userId: string): Promise<LocationPrivacySettings> {
    try {
      // Check if settings already exist in activity log
      const existingSettings = await db.activityLog.findFirst({
        where: {
          userId,
          action: 'LOCATION_SETTINGS_UPDATED'
        },
        orderBy: { createdAt: 'desc' }
      })

      if (existingSettings) {
        const settings = JSON.parse(existingSettings.details || '{}')
        return {
          userId,
          locationEnabled: settings.locationEnabled ?? true,
          foregroundOnly: settings.foregroundOnly ?? true,
          shareWithHelpers: settings.shareWithHelpers ?? true,
          shareWithClients: settings.shareWithClients ?? false,
          lastLocationUpdate: settings.lastLocationUpdate ? new Date(settings.lastLocationUpdate) : null,
          locationAccuracy: settings.locationAccuracy ?? 100,
          mockLocationDetected: settings.mockLocationDetected ?? false
        }
      }

      // Create default settings
      const defaultSettings: LocationPrivacySettings = {
        userId,
        locationEnabled: true,
        foregroundOnly: true,
        shareWithHelpers: true,
        shareWithClients: false,
        lastLocationUpdate: null,
        locationAccuracy: 100,
        mockLocationDetected: false
      }

      await db.activityLog.create({
        data: {
          userId,
          action: 'LOCATION_SETTINGS_UPDATED',
          details: JSON.stringify(defaultSettings)
        }
      })

      return defaultSettings
    } catch (error) {
      logger.error('Initialize location settings error:', {
        userId,
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      })
      return {
        userId,
        locationEnabled: true,
        foregroundOnly: true,
        shareWithHelpers: true,
        shareWithClients: false,
        lastLocationUpdate: null,
        locationAccuracy: 100,
        mockLocationDetected: false
      }
    }
  }

  // Update user location privacy settings
  async updateSettings(
    userId: string,
    settings: Partial<LocationPrivacySettings>
  ): Promise<LocationPrivacySettings> {
    try {
      const currentSettings = await this.initializeUserSettings(userId)
      const updatedSettings = { ...currentSettings, ...settings }

      await db.activityLog.create({
        data: {
          userId,
          action: 'LOCATION_SETTINGS_UPDATED',
          details: JSON.stringify(updatedSettings)
        }
      })

      logger.info('Location privacy settings updated', {
        userId,
        metadata: {
          locationEnabled: updatedSettings.locationEnabled,
          foregroundOnly: updatedSettings.foregroundOnly,
          shareWithHelpers: updatedSettings.shareWithHelpers,
          shareWithClients: updatedSettings.shareWithClients
        }
      })

      return updatedSettings
    } catch (error) {
      logger.error('Update location settings error:', {
        userId,
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      })
      throw error
    }
  }

  // Process location update with privacy and spoofing checks
  async processLocationUpdate(update: LocationUpdate): Promise<{
    allowed: boolean
    privacyLevel: 'PUBLIC' | 'HELPERS_ONLY' | 'PRIVATE'
    spoofingRisk: 'LOW' | 'MEDIUM' | 'HIGH'
    reasons: string[]
  }> {
    try {
      const settings = await this.initializeUserSettings(update.userId)
      const reasons: string[] = []

      // Check if location is enabled
      if (!settings.locationEnabled) {
        return {
          allowed: false,
          privacyLevel: 'PRIVATE',
          spoofingRisk: 'LOW',
          reasons: ['Location sharing disabled by user']
        }
      }

      // Check foreground-only policy
      if (!update.isForeground && settings.foregroundOnly) {
        reasons.push('Background location not allowed per privacy settings')
        await trustScoreManager.updateTrustScore(
          update.userId,
          TrustAction.SUSPICIOUS_ACTIVITY,
          'Attempted background location tracking'
        )
        return {
          allowed: false,
          privacyLevel: 'PRIVATE',
          spoofingRisk: 'LOW',
          reasons
        }
      }

      // GPS spoofing detection
      const spoofingCheck = await this.detectGpsSpoofing(update)
      if (spoofingCheck.isSpoofed) {
        reasons.push(...spoofingCheck.reasons)

        // Update settings to mark mock location detected
        await this.updateSettings(update.userId, { mockLocationDetected: true })

        // Penalize trust score
        await trustScoreManager.updateTrustScore(
          update.userId,
          TrustAction.SUSPICIOUS_ACTIVITY,
          `GPS spoofing detected: ${spoofingCheck.reasons.join(', ')}`
        )

        // Make user invisible if high risk
        if (spoofingCheck.riskLevel === 'HIGH') {
          await db.user.update({
            where: { id: update.userId },
            data: { isFrozen: true }
          })

          await db.activityLog.create({
            data: {
              userId: update.userId,
              action: 'USER_FROZEN',
              details: JSON.stringify({
                reason: 'GPS spoofing detected',
                riskLevel: spoofingCheck.riskLevel
              })
            }
          })
        }
      }

      // Validate location using existing validator
      const validation = await locationValidator.validateLocationUpdate({
        userId: update.userId,
        latitude: update.latitude,
        longitude: update.longitude,
        accuracy: update.accuracy,
        timestamp: update.timestamp
      })

      if (!validation.isValid) {
        reasons.push(...validation.reasons)
      }

      // Determine privacy level
      let privacyLevel: 'PUBLIC' | 'HELPERS_ONLY' | 'PRIVATE' = 'PRIVATE'
      if (settings.shareWithClients) {
        privacyLevel = 'PUBLIC'
      } else if (settings.shareWithHelpers) {
        privacyLevel = 'HELPERS_ONLY'
      }

      // Update last location timestamp
      await this.updateSettings(update.userId, {
        lastLocationUpdate: update.timestamp,
        locationAccuracy: update.accuracy
      })

      // Store location if allowed
      if (validation.isValid && spoofingCheck.riskLevel !== 'HIGH') {
        await db.user.update({
          where: { id: update.userId },
          data: {
            latitude: update.latitude,
            longitude: update.longitude,
            lastActiveAt: new Date()
          }
        })
      }

      return {
        allowed: validation.isValid && spoofingCheck.riskLevel !== 'HIGH',
        privacyLevel,
        spoofingRisk: spoofingCheck.riskLevel,
        reasons
      }

    } catch (error) {
      logger.error('Process location update error:', {
        userId: update.userId,
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      })
      return {
        allowed: false,
        privacyLevel: 'PRIVATE',
        spoofingRisk: 'LOW',
        reasons: ['System error']
      }
    }
  }

  // GPS spoofing detection
  private async detectGpsSpoofing(update: LocationUpdate): Promise<{
    isSpoofed: boolean
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
    reasons: string[]
  }> {
    const reasons: string[] = []

    // Check for mock location flag (if available from device)
    if (update.mockLocationFlag) {
      reasons.push('Mock location flag detected')
    }

    // Check for suspicious coordinates (impossible locations)
    if (this.isImpossibleLocation(update.latitude, update.longitude)) {
      reasons.push('Impossible coordinates detected')
    }

    // Check for exact coordinate repetition (spoofing pattern)
    const recentLocations = await this.getRecentLocations(update.userId)
    const exactMatches = recentLocations.filter(loc =>
      loc.latitude === update.latitude && loc.longitude === update.longitude
    )

    if (exactMatches.length > 2) {
      reasons.push('Suspicious exact coordinate repetition')
    }

    // Check for sudden jumps without time progression
    if (recentLocations.length > 0) {
      const lastLocation = recentLocations[0]
      const timeDiff = update.timestamp.getTime() - lastLocation.timestamp.getTime()
      const distance = this.calculateDistance(
        lastLocation.latitude, lastLocation.longitude,
        update.latitude, update.longitude
      )

      // Instant teleportation check
      if (timeDiff < 1000 && distance > 0.1) { // 100m in less than 1 second
        reasons.push('Instant location jump detected')
      }

      // Impossible speed check
      const speedKmh = timeDiff > 0 ? (distance / (timeDiff / 3600000)) : 0
      if (speedKmh > 1000) { // Faster than commercial jet
        reasons.push(`Impossible speed: ${speedKmh.toFixed(1)} km/h`)
      }
    }

    // Check accuracy (very high accuracy might indicate spoofing)
    if (update.accuracy < 1) {
      reasons.push('Unrealistically high GPS accuracy')
    }

    // Determine risk level
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW'
    if (reasons.length > 2) {
      riskLevel = 'HIGH'
    } else if (reasons.length > 0) {
      riskLevel = 'MEDIUM'
    }

    return {
      isSpoofed: reasons.length > 0,
      riskLevel,
      reasons
    }
  }

  // Check if coordinates are impossible
  private isImpossibleLocation(lat: number, lng: number): boolean {
    // Basic bounds check
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return true
    }

    // Check for known impossible locations (oceans, restricted areas)
    // This is a simplified check - in production, use a more comprehensive database
    return false
  }

  // Get recent locations for spoofing analysis
  private async getRecentLocations(userId: string): Promise<LocationUpdate[]> {
    try {
      const logs = await db.activityLog.findMany({
        where: {
          userId,
          action: 'LOCATION_UPDATED',
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 20
      })

      return logs.map(log => {
        const details = JSON.parse(log.details || '{}')
        return {
          userId,
          latitude: details.latitude || 0,
          longitude: details.longitude || 0,
          accuracy: details.accuracy || 100,
          isForeground: details.isForeground ?? true,
          timestamp: log.createdAt
        }
      })
    } catch (error) {
      logger.error('Get recent locations error:', {
        userId,
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      })
      return []
    }
  }

  // Calculate distance between coordinates
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1)
    const dLon = this.toRadians(lon2 - lon1)

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180)
  }

  // Get user's current privacy settings
  async getPrivacySettings(userId: string): Promise<LocationPrivacySettings> {
    return await this.initializeUserSettings(userId)
  }

  // Clear location data for privacy compliance
  async clearLocationData(userId: string): Promise<boolean> {
    try {
      // Remove location from user profile
      await db.user.update({
        where: { id: userId },
        data: {
          latitude: null,
          longitude: null,
          locationText: null
        }
      })

      // Log privacy action
      await db.activityLog.create({
        data: {
          userId,
          action: 'LOCATION_DATA_CLEARED',
          details: JSON.stringify({
            reason: 'User privacy request',
            clearedAt: new Date().toISOString()
          })
        }
      })

      logger.info('Location data cleared for privacy', { userId })
      return true
    } catch (error) {
      logger.error('Clear location data error:', {
        userId,
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      })
      return false
    }
  }
}

// Export singleton instance
export const locationPrivacyManager = LocationPrivacyManager.getInstance()
