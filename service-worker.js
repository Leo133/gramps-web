/**
 * Gramps Web Service Worker
 * 
 * Provides offline support and performance improvements for the PWA
 * Version: 1.0.0
 */

const CACHE_VERSION = 'gramps-web-v1.0.0'
const STATIC_CACHE = `${CACHE_VERSION}-static`
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`
const IMAGE_CACHE = `${CACHE_VERSION}-images`

// Files to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/global.css',
  '/tippy.css',
  '/fonts/fonts.css',
  '/images/icon192.png',
  '/images/icon512.png',
  '/images/favicon.ico',
]

// Maximum cache sizes
const MAX_DYNAMIC_CACHE_SIZE = 50
const MAX_IMAGE_CACHE_SIZE = 100

/**
 * Limit cache size by removing oldest entries
 */
async function limitCacheSize(cacheName, maxItems) {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()
  
  if (keys.length > maxItems) {
    // Delete oldest items
    const deletePromises = keys.slice(0, keys.length - maxItems).map(key => cache.delete(key))
    await Promise.all(deletePromises)
  }
}

/**
 * Service Worker Install Event
 * Pre-cache static assets
 */
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[Service Worker] Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => self.skipWaiting())
  )
})

/**
 * Service Worker Activate Event
 * Clean up old caches
 */
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...')
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name.startsWith('gramps-web-') && name !== STATIC_CACHE && name !== DYNAMIC_CACHE && name !== IMAGE_CACHE)
            .map(name => {
              console.log('[Service Worker] Deleting old cache:', name)
              return caches.delete(name)
            })
        )
      })
      .then(() => self.clients.claim())
  )
})

/**
 * Service Worker Fetch Event
 * Implement caching strategies
 */
self.addEventListener('fetch', event => {
  const {request} = event
  const url = new URL(request.url)
  
  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return
  }
  
  // API requests: Network-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE))
    return
  }
  
  // Image requests: Cache-first strategy
  if (request.destination === 'image') {
    event.respondWith(cacheFirst(request, IMAGE_CACHE))
    return
  }
  
  // Static assets: Cache-first with network fallback
  event.respondWith(cacheFirst(request, STATIC_CACHE))
})

/**
 * Cache-first strategy
 * Look in cache first, fall back to network
 */
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  
  if (cached) {
    return cached
  }
  
  try {
    const response = await fetch(request)
    
    // Cache successful responses
    if (response && response.status === 200) {
      cache.put(request, response.clone())
      
      // Limit cache size for images
      if (cacheName === IMAGE_CACHE) {
        limitCacheSize(IMAGE_CACHE, MAX_IMAGE_CACHE_SIZE)
      }
    }
    
    return response
  } catch (error) {
    console.error('[Service Worker] Fetch failed:', error)
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return cache.match('/index.html')
    }
    
    throw error
  }
}

/**
 * Network-first strategy
 * Try network first, fall back to cache
 */
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  
  try {
    const response = await fetch(request)
    
    // Cache successful responses
    if (response && response.status === 200) {
      cache.put(request, response.clone())
      
      // Limit cache size
      limitCacheSize(cacheName, MAX_DYNAMIC_CACHE_SIZE)
    }
    
    return response
  } catch (error) {
    console.error('[Service Worker] Network request failed, checking cache:', error)
    
    const cached = await cache.match(request)
    if (cached) {
      return cached
    }
    
    throw error
  }
}

/**
 * Message handler for cache management
 */
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        )
      })
    )
  }
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

/**
 * Background sync for offline actions (future enhancement)
 */
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData())
  }
})

async function syncData() {
  // Placeholder for future background sync implementation
  console.log('[Service Worker] Background sync triggered')
}

/**
 * Push notification handler (future enhancement)
 */
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {}
  const title = data.title || 'Gramps Web'
  const options = {
    body: data.body || 'New update available',
    icon: '/images/icon192.png',
    badge: '/images/icon192.png',
    ...data.options
  }
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

/**
 * Notification click handler
 */
self.addEventListener('notificationclick', event => {
  event.notification.close()
  
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  )
})
