import { config } from './config'

// Feature flag system for safe deployment
export interface FeatureFlags {
  referralSystem: boolean
  ads: boolean
  newFeatures: boolean
  cityWiseFeatures: Record<string, boolean>
  experimentalFeatures: {
    websocket: boolean
    pushNotifications: boolean
    advancedGamification: boolean
  }
}

// Get current feature flags based on environment and configuration
export const getFeatureFlags = (): FeatureFlags => {
  return {
    referralSystem: config.features.referralSystem,
    ads: config.features.ads,
    newFeatures: config.features.newFeatures,
    cityWiseFeatures: config.features.cityWiseFeatures,
    experimentalFeatures: {
      websocket: true, // Always enabled as it's core functionality
      pushNotifications: !config.isDevelopment, // Disabled in dev to avoid spam
      advancedGamification: config.isStaging || config.isProduction
    }
  }
}

// Check if a feature is enabled
export const isFeatureEnabled = (feature: keyof FeatureFlags): boolean => {
  const flags = getFeatureFlags()
  return flags[feature] as boolean
}

// Check if experimental feature is enabled
export const isExperimentalFeatureEnabled = (feature: keyof FeatureFlags['experimentalFeatures']): boolean => {
  const flags = getFeatureFlags()
  return flags.experimentalFeatures[feature]
}

// Check if feature is enabled for a specific city
export const isFeatureEnabledForCity = (feature: keyof FeatureFlags, city: string): boolean => {
  const flags = getFeatureFlags()

  // Check global feature flag first
  if (!flags[feature]) return false

  // Check city-specific override
  if (feature === 'cityWiseFeatures') {
    return flags.cityWiseFeatures[city.toLowerCase()] || false
  }

  return true
}

// Gradual rollout by percentage (0-100)
export const isInRolloutGroup = (userId: string, percentage: number): boolean => {
  // Simple hash-based distribution
  const hash = userId.split('').reduce((acc, char) => {
    return ((acc << 5) - acc + char.charCodeAt(0)) | 0
  }, 0)

  const normalizedHash = Math.abs(hash) % 100
  return normalizedHash < percentage
}

// Feature flag overrides for A/B testing
export const getFeatureOverride = (userId: string, feature: string): boolean | null => {
  // In a real implementation, this would check a database or external service
  // For now, return null (no override)
  return null
}

// Admin override for specific users
export const getAdminOverride = (userId: string, feature: string): boolean | null => {
  // In a real implementation, this would check admin settings
  // For now, return null (no override)
  return null
}

// Combined feature check with overrides
export const isFeatureEnabledForUser = (
  userId: string,
  feature: keyof FeatureFlags,
  city?: string
): boolean => {
  // Check admin override first
  const adminOverride = getAdminOverride(userId, feature)
  if (adminOverride !== null) return adminOverride

  // Check feature override
  const featureOverride = getFeatureOverride(userId, feature)
  if (featureOverride !== null) return featureOverride

  // Check city-specific feature
  if (city) {
    return isFeatureEnabledForCity(feature, city)
  }

  // Check global feature flag
  return isFeatureEnabled(feature)
}

// Kill switch for emergency feature disabling
export const isFeatureKillSwitched = (feature: string): boolean => {
  // In a real implementation, this would check a kill switch service
  // For emergency situations where a feature needs to be disabled immediately
  const killSwitches: Record<string, boolean> = {
    // Example: 'ads': true would disable ads globally
  }

  return killSwitches[feature] || false
}

// Feature usage tracking
export const trackFeatureUsage = (userId: string, feature: string, action: string) => {
  // In a real implementation, this would send to analytics
  if (typeof window !== 'undefined') {
    console.log(`Feature usage: ${feature}.${action} by user ${userId}`)
  }
}

// Export current flags for easy access
export const featureFlags = getFeatureFlags()
