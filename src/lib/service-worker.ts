// Service Worker Registration and Management
export class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null
  private updateAvailable = false
  private updateCallbacks: ((registration: ServiceWorkerRegistration) => void)[] = []

  constructor() {
    if (typeof window !== 'undefined') {
      this.init()
    }
  }

  private async init() {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        })

        console.log('[SW] Registered successfully')

        // Handle updates
        this.registration.addEventListener('updatefound', () => {
          const newWorker = this.registration!.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.updateAvailable = true
                this.notifyUpdateCallbacks(this.registration!)
              }
            })
          }
        })

        // Handle controller change (new SW activated)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (this.updateAvailable) {
            window.location.reload()
          }
        })

        // Handle messages from SW
        navigator.serviceWorker.addEventListener('message', (event) => {
          this.handleMessage(event.data)
        })

      } catch (error) {
        console.error('[SW] Registration failed:', error)
      }
    }
  }

  private handleMessage(data: any) {
    switch (data.type) {
      case 'CACHE_UPDATED':
        console.log('[SW] Cache updated')
        break
      case 'OFFLINE_READY':
        console.log('[SW] App ready for offline use')
        break
      default:
        console.log('[SW] Message received:', data)
    }
  }

  public onUpdate(callback: (registration: ServiceWorkerRegistration) => void) {
    this.updateCallbacks.push(callback)
  }

  private notifyUpdateCallbacks(registration: ServiceWorkerRegistration) {
    this.updateCallbacks.forEach(callback => callback(registration))
  }

  public async update() {
    if (this.registration) {
      await this.registration.update()
    }
  }

  public async skipWaiting() {
    if (this.registration && this.registration.waiting) {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' })
    }
  }

  public getRegistration(): ServiceWorkerRegistration | null {
    return this.registration
  }

  public isUpdateAvailable(): boolean {
    return this.updateAvailable
  }

  // Send message to service worker
  public postMessage(message: any) {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(message)
    }
  }

  // Request notification permission
  public async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported')
    }

    const permission = await Notification.requestPermission()
    return permission
  }

  // Send notification (for testing)
  public async showNotification(title: string, options?: NotificationOptions) {
    if (this.registration) {
      await this.registration.showNotification(title, {
        icon: '/logo.png',
        badge: '/logo.png',
        ...options
      })
    }
  }

  // Check if app is installed
  public isInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true
  }

  // Get cache storage info
  public async getCacheInfo() {
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      const cacheInfo = await Promise.all(
        cacheNames.map(async (name) => {
          const cache = await caches.open(name)
          const keys = await cache.keys()
          return {
            name,
            count: keys.length,
            size: keys.reduce((total, request) => total + (request.url.length * 2), 0) // Rough estimate
          }
        })
      )
      return cacheInfo
    }
    return []
  }

  // Clear all caches
  public async clearCaches() {
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames.map(name => caches.delete(name))
      )
      this.postMessage({ type: 'CLEANUP' })
    }
  }
}

// Create singleton instance
export const swManager = new ServiceWorkerManager()

// React hook for using service worker
export function useServiceWorker() {
  return swManager
}
