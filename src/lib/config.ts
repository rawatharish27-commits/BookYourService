export type Environment = 'DEV' | 'STAGING' | 'PRODUCTION'

export interface AppConfig {
  environment: Environment
  isDevelopment: boolean
  isStaging: boolean
  isProduction: boolean
  firebase: {
    apiKey: string
    authDomain: string
    projectId: string
    storageBucket: string
    messagingSenderId: string
    appId: string
    measurementId?: string
  }
  api: {
    baseUrl: string
    timeout: number
  }
  features: {
    referralSystem: boolean
    ads: boolean
    newFeatures: boolean
    cityWiseFeatures: Record<string, boolean>
  }
  limits: {
    otpRetries: number
    postsPerDay: number
    maxTextLength: number
    radiusKm: number
  }
  test: {
    phoneNumbers: string[]
    enableTestTools: boolean
  }
}

// Environment detection
const getEnvironment = (): Environment => {
  const env = process.env.NODE_ENV || 'development'
  const appEnv = process.env.NEXT_PUBLIC_APP_ENV as Environment

  if (appEnv) return appEnv

  switch (env) {
    case 'production':
      return 'PRODUCTION'
    case 'development':
      return 'DEV'
    default:
      return 'STAGING'
  }
}

const environment = getEnvironment()

// Firebase configs for different environments
const firebaseConfigs = {
  DEV: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY_DEV || '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN_DEV || '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID_DEV || '',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET_DEV || '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID_DEV || '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID_DEV || '',
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID_DEV
  },
  STAGING: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY_STAGING || '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN_STAGING || '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID_STAGING || '',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET_STAGING || '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID_STAGING || '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID_STAGING || '',
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID_STAGING
  },
  PRODUCTION: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY_PROD || '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN_PROD || '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID_PROD || '',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET_PROD || '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID_PROD || '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID_PROD || '',
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID_PROD
  }
}

// Feature flags based on environment
const getFeatureFlags = () => {
  const baseFlags = {
    referralSystem: true,
    ads: false,
    newFeatures: environment === 'DEV',
    cityWiseFeatures: {
      'mumbai': true,
      'delhi': true,
      'bangalore': true,
      'chennai': true,
      'pune': true
    }
  }

  // Environment-specific overrides
  switch (environment) {
    case 'DEV':
      return {
        ...baseFlags,
        ads: false,
        newFeatures: true
      }
    case 'STAGING':
      return {
        ...baseFlags,
        ads: false,
        newFeatures: false
      }
    case 'PRODUCTION':
      return {
        ...baseFlags,
        ads: true,
        newFeatures: false
      }
    default:
      return baseFlags
  }
}

// App configuration
export const config: AppConfig = {
  environment,
  isDevelopment: environment === 'DEV',
  isStaging: environment === 'STAGING',
  isProduction: environment === 'PRODUCTION',
  firebase: firebaseConfigs[environment],
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || '',
    timeout: 30000
  },
  features: getFeatureFlags(),
  limits: {
    otpRetries: 3, // Max 3-5 retries as per checklist
    postsPerDay: 3,
    maxTextLength: 500,
    radiusKm: 20
  },
  test: {
    phoneNumbers: [
      '9999999999', // Test phone 1
      '8888888888', // Test phone 2
      '7777777777'  // Test phone 3
    ],
    enableTestTools: environment === 'DEV'
  }
}

// Environment-specific settings
export const isDebugMode = config.isDevelopment
export const enableLogging = !config.isProduction
export const enableCrashReporting = config.isProduction

// Helper functions
export const isTestPhoneNumber = (phone: string): boolean => {
  return config.test.phoneNumbers.includes(phone.replace(/^\+91/, ''))
}

export const shouldShowTestTools = (): boolean => {
  return config.test.enableTestTools
}

export const getFeatureFlag = (feature: keyof AppConfig['features']): boolean => {
  return config.features[feature] as boolean
}

export const isFeatureEnabledForCity = (city: string): boolean => {
  return config.features.cityWiseFeatures[city.toLowerCase()] || false
}
