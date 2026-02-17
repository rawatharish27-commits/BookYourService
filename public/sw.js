// Service Worker for Help2Earn PWA
const CACHE_NAME = 'help2earn-v1.0.0'
const STATIC_CACHE = 'help2earn-static-v1.0.0'
const DYNAMIC_CACHE = 'help2earn-dynamic-v1.0.0'

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/logo.png',
  '/logo.svg',
  '/robots.txt',
  '/favicon.ico'
]

// API endpoints that should be cached
const API_CACHE_PATTERNS = [
  /\/api\/v1\/problems/,
  /\/api\/v1\/users\/location/
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Install event')
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        return self.skipWaiting()
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => {
      return self.clients.claim()
    })
  )
})

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') return

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    // Cache certain API responses
    if (API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
      event.respondWith(
        caches.open(DYNAMIC_CACHE).then((cache) => {
          return fetch(request).then((response) => {
            // Cache successful responses
            if (response.status === 200) {
              cache.put(request, response.clone())
            }
            return response
          }).catch(() => {
            // Return cached version if available
            return cache.match(request)
          })
        })
      )
    }
    return
  }

  // Handle static assets and pages
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }

      return fetch(request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response
        }

        // Cache the response
        const responseToCache = response.clone()
        caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(request, responseToCache)
        })

        return response
      }).catch((error) => {
        console.log('[SW] Fetch failed:', error)

        // Return offline fallback for pages
        if (request.destination === 'document') {
          return caches.match('/').then((response) => {
            return response || new Response('Offline - Please check your connection', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: { 'Content-Type': 'text/plain' }
            })
          })
        }

        return new Response('Offline', {
          status: 503,
          statusText: 'Service Unavailable'
        })
      })
    })
  )
})

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag)

  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

// Push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event)

  if (!event.data) return

  const data = event.data.json()
  const options = {
    body: data.body,
    icon: '/logo.png',
    badge: '/logo.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    },
    actions: [
      {
        action: 'view',
        title: 'View'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click:', event)

  event.notification.close()

  if (event.action === 'dismiss') return

  const url = event.notification.data?.url || '/'

  event.waitUntil(
    clients.openWindow(url)
  )
})

// Background sync implementation
async function doBackgroundSync() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE)
    const keys = await cache.keys()

    // Process any queued requests
    for (const request of keys) {
      try {
        await fetch(request)
        await cache.delete(request)
      } catch (error) {
        console.log('[SW] Background sync failed for:', request.url)
      }
    }
  } catch (error) {
    console.log('[SW] Background sync error:', error)
  }
}

// Periodic cleanup
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEANUP') {
    cleanupOldCaches()
  }
})

async function cleanupOldCaches() {
  const cacheNames = await caches.keys()
  const validCaches = [STATIC_CACHE, DYNAMIC_CACHE]

  await Promise.all(
    cacheNames.map((cacheName) => {
      if (!validCaches.includes(cacheName)) {
        return caches.delete(cacheName)
      }
    })
  )
}
