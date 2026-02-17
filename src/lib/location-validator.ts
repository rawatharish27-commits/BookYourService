import { db } from './db'
import { logger } from './logger'
import { trustScoreManager, TrustAction } from './trust-score'

export interface LocationUpdate {
  userId: string
  latitude: number
  longitude: number
  accuracy?: number
  timestamp: Date
  ipAddress?: string
  userAgent?: string
}

export interface LocationValidationResult {
  isValid: boolean
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  reasons: string[]
  suggestedAction?: 'ALLOW' | 'WARN' | 'BLOCK' | 'REVIEW'
}

export class LocationValidator {
  private static instance: LocationValidator

  // Risk thresholds
  private static readonly THRESHOLDS = {
    MAX_SPEED_KMH: 200, // Max reasonable speed (car/plane)
    SUSPICIOUS_DISTANCE_KM: 500, // Very large jump
    TIME_WINDOW_MINUTES: 60, // Check last hour
    MIN_ACCURACY_METERS: 1000, // GPS accuracy threshold
  }

  private constructor() {}

  static getInstance(): LocationValidator {
    if (!LocationValidator.instance) {
      LocationValidator.instance = new LocationValidator()
    }
    return LocationValidator.instance
  }

  // Validate location update
  async validateLocationUpdate(update: LocationUpdate): Promise<LocationValidationResult> {
    try {
      const reasons: string[] = []

      // Get user's recent location history
      const recentLocations = await this.getRecentLocations(update.userId)

      if (recentLocations.length === 0) {
        // First location update - allow
        await this.storeLocation(update)
        return {
          isValid: true,
          riskLevel: 'LOW',
          reasons: ['First location update'],
          suggestedAction: 'ALLOW'
        }
      }

      const lastLocation = recentLocations[0]
      const distance = this.calculateDistance(
        lastLocation.latitude,
        lastLocation.longitude,
        update.latitude,
        update.longitude
      )

      const timeDiff = (update.timestamp.getTime() - lastLocation.timestamp.getTime()) / (1000 * 60) // minutes
      const speedKmh = timeDiff > 0 ? (distance / timeDiff) * 60 : 0

      // Check GPS accuracy
      if (update.accuracy && update.accuracy > LocationValidator.THRESHOLDS.MIN_ACCURACY_METERS) {
        reasons.push(`Low GPS accuracy: ${update.accuracy}m`)
      }

      // Check for impossible speed
      if (speedKmh > LocationValidator.THRESHOLDS.MAX_SPEED_KMH) {
        reasons.push(`Impossible speed: ${speedKmh.toFixed(1)} km/h over ${timeDiff.toFixed(1)} minutes`)
      }

      // Check for suspicious distance jumps
      if (distance > LocationValidator.THRESHOLDS.SUSPICIOUS_DISTANCE_KM) {
        reasons.push(`Large distance jump: ${distance.toFixed(1)} km in ${timeDiff.toFixed(1)} minutes`)
      }

      // Check for location consistency patterns
      const consistencyCheck = await this.checkLocationConsistency(update, recentLocations)
      if (!consistencyCheck.isConsistent) {
        reasons.push(...consistencyCheck.reasons)
      }

      // Determine risk level and action
      let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW'
      let suggestedAction: 'ALLOW' | 'WARN' | 'BLOCK' | 'REVIEW' = 'ALLOW'

      if (reasons.length > 0) {
        if (speedKmh > LocationValidator.THRESHOLDS.MAX_SPEED_KMH * 2 || distance > 2000) {
          riskLevel = 'HIGH'
          suggestedAction = 'BLOCK'
        } else if (reasons.length > 1 || speedKmh > LocationValidator.THRESHOLDS.MAX_SPEED_KMH) {
          riskLevel = 'MEDIUM'
          suggestedAction = 'WARN'
        } else {
          riskLevel = 'LOW'
          suggestedAction = 'ALLOW'
        }
      }

      // Store the location update
      await this.storeLocation(update)

      // Log suspicious activity
      if (riskLevel !== 'LOW') {
        logger.warn('Suspicious location update detected', {
          userId: update.userId,
          metadata: {
            riskLevel,
            reasons,
            distance: distance.toFixed(1),
            speed: speedKmh.toFixed(1),
            timeDiff: timeDiff.toFixed(1),
            lastLocation: {
              lat: lastLocation.latitude,
              lng: lastLocation.longitude,
              timestamp: lastLocation.timestamp
            },
            newLocation: {
              lat: update.latitude,
              lng: update.longitude,
              accuracy: update.accuracy
            }
          }
        })

        // Penalize trust score for suspicious activity
        if (riskLevel === 'HIGH') {
          await trustScoreManager.updateTrustScore(
            update.userId,
            TrustAction.SUSPICIOUS_ACTIVITY,
            `Suspicious location activity: ${reasons.join(', ')}`
          )
        }
      }

      return {
        isValid: riskLevel !== 'HIGH',
        riskLevel,
        reasons,
        suggestedAction
      }

    } catch (error) {
      logger.error('Location validation error:', {
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      })
      // Allow update on error to avoid blocking legitimate users
      return {
        isValid: true,
        riskLevel: 'LOW',
        reasons: ['Validation error - allowed'],
        suggestedAction: 'ALLOW'
      }
    }
  }

  // Get recent locations for user
  private async getRecentLocations(userId: string): Promise<LocationUpdate[]> {
    try {
      // Get recent activity logs with location data
      const logs = await db.activityLog.findMany({
        where: {
          userId,
          action: 'LOCATION_UPDATED',
          createdAt: {
            gte: new Date(Date.now() - LocationValidator.THRESHOLDS.TIME_WINDOW_MINUTES * 60 * 1000)
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      })

      return logs.map(log => {
        const details = JSON.parse(log.details || '{}')
        return {
          userId,
          latitude: details.latitude || 0,
          longitude: details.longitude || 0,
          accuracy: details.accuracy,
          timestamp: log.createdAt,
          ipAddress: details.ipAddress,
          userAgent: details.userAgent
        }
      })
    } catch (error) {
      logger.error('Get recent locations error:', {
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      })
      return []
    }
  }

  // Store location update
  private async storeLocation(update: LocationUpdate): Promise<void> {
    try {
      await db.activityLog.create({
        data: {
          userId: update.userId,
          action: 'LOCATION_UPDATED',
          details: JSON.stringify({
            latitude: update.latitude,
            longitude: update.longitude,
            accuracy: update.accuracy,
            ipAddress: update.ipAddress,
            userAgent: update.userAgent
          })
        }
      })
    } catch (error) {
      logger.error('Store location error:', {
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      })
    }
  }

  // Check location consistency patterns
  private async checkLocationConsistency(
    update: LocationUpdate,
    recentLocations: LocationUpdate[]
  ): Promise<{ isConsistent: boolean; reasons: string[] }> {
    const reasons: string[] = []

    // Check for location jumping between cities too quickly
    const significantMoves = recentLocations.filter(loc => {
      const distance = this.calculateDistance(
        loc.latitude, loc.longitude,
        update.latitude, update.longitude
      )
      return distance > 50 // 50km threshold
    })

    if (significantMoves.length > 2) {
      reasons.push('Multiple large location jumps detected')
    }

    // Check for GPS spoofing patterns (exact coordinates repeating)
    const exactMatches = recentLocations.filter(loc =>
      loc.latitude === update.latitude && loc.longitude === update.longitude
    )

    if (exactMatches.length > 3) {
      reasons.push('Suspicious exact coordinate repetition')
    }

    return {
      isConsistent: reasons.length === 0,
      reasons
    }
  }

  // Calculate distance between two coordinates (Haversine formula)
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
}

// Export singleton instance
export const locationValidator = LocationValidator.getInstance()
