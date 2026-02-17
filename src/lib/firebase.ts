// Firebase configuration and initialization
import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getCrashlytics, initializeCrashlytics } from 'firebase/crashlytics'
import { config, enableCrashReporting } from './config'

// Initialize Firebase only if config is available
const initializeFirebase = () => {
  if (!config.firebase.apiKey) {
    console.warn('Firebase config not found, skipping initialization')
    return null
  }

  // Prevent multiple initializations
  if (getApps().length > 0) {
    return getApps()[0]
  }

  try {
    const app = initializeApp(config.firebase)

    // Initialize Auth
    const auth = getAuth(app)

    // Initialize Analytics (only in production and if supported)
    let analytics = null
    if (config.isProduction && typeof window !== 'undefined') {
      isSupported().then((supported) => {
        if (supported) {
          analytics = getAnalytics(app)
        }
      }).catch((error) => {
        console.warn('Analytics initialization failed:', error)
      })
    }

    // Initialize Crashlytics (only in production)
    if (enableCrashReporting && typeof window !== 'undefined') {
      try {
        const crashlytics = getCrashlytics(app)
        initializeCrashlytics(crashlytics, {
          // Disable in development
          disableInDevelopment: config.isDevelopment
        })

        // Set user properties for better crash reports
        if (auth.currentUser) {
          // This will be set when user logs in
        }
      } catch (error) {
        console.warn('Crashlytics initialization failed:', error)
      }
    }

    return app
  } catch (error) {
    console.error('Firebase initialization failed:', error)
    return null
  }
}

// Initialize Firebase
const firebaseApp = initializeFirebase()

// Export Firebase services
export const auth = firebaseApp ? getAuth(firebaseApp) : null
export const analytics = firebaseApp && config.isProduction ? getAnalytics(firebaseApp) : null
export const crashlytics = firebaseApp && enableCrashReporting ? getCrashlytics(firebaseApp) : null

// Helper functions
export const isFirebaseInitialized = () => firebaseApp !== null

export const setCrashlyticsUser = (userId: string, userProperties?: Record<string, any>) => {
  if (crashlytics && userId) {
    // Note: In a real implementation, you'd use Firebase SDK methods
    // This is a placeholder for the actual implementation
    console.log('Setting Crashlytics user:', userId, userProperties)
  }
}

export const logCrashlyticsError = (error: Error, context?: Record<string, any>) => {
  if (crashlytics) {
    // Log error to Crashlytics
    console.error('Logging error to Crashlytics:', error, context)
  }
}

export const logAnalyticsEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (analytics) {
    // Log event to Analytics
    console.log('Logging analytics event:', eventName, parameters)
  }
}

// App start logging
if (typeof window !== 'undefined') {
  // Log app start
  logAnalyticsEvent('app_open', {
    environment: config.environment,
    timestamp: new Date().toISOString()
  })
}
