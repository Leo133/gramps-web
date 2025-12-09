/**
 * Service Worker for Gramps Web PWA
 * 
 * Phase 10: UI/UX Overhaul - PWA Enhancement
 * 
 * This service worker provides:
 * - Offline support with caching strategies
 * - Background sync
 * - Push notifications (future)
 * - App updates with automatic refresh
 */

const CACHE_VERSION = 'gramps-web-v1.0.0'
const STATIC_CACHE = `${CACHE_VERSION}-static`
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`
const IMAGE_CACHE = `${CACHE_VERSION}-images`
const API_CACHE = `${CACHE_VERSION}-api`

// Files to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/global.css',
  '/tippy.css',
  '/maplibre-gl.css',
  '/src/gramps-js.js',
  '/src/GrampsJs.js',
  '/src/SharedStyles.js',
  '/src/design-tokens.js',
  '/src/accessibility.js',
  '/src/responsive.js',
  '/src/theme.js',
  '/src/api.js',
  '/src/appState.js',
  '/src/util.js',
  '/src/strings.js',
  '/images/icon192.png',
  '/images/icon512.png',
  '/images/favicon.ico',
  // Add fonts
  '/fonts/fonts.css',
]

// API endpoints to cache with network-first strategy
const API_ENDPOINTS = [
  '/api/metadata',
  '/api/trees/-',
]

// Maximum cache sizes
const MAX_DYNAMIC_CACHE_SIZE = 50
const MAX_IMAGE_CACHE_SIZE = 100
const MAX_API_CACHE_AGE = 5 * 60 * 1000 // 5 minutes

/**
 * Install event - cache static assets
 */
self.addEventListener('install', event => {
  console.log('[SW] Installing service worker...')
  
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then(cache => {
        console.log('[SW] Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .catch(err => {
        console.error('[SW] Error caching static assets:', err)
      })
  )
  
  // Activate immediately
  self.skipWaiting()
})

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', event => {
  console.log('[SW] Activating service worker...')
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => {
            // Remove old cache versions
            return (
              cacheName.startsWith('gramps-web-') &&
              !cacheName.startsWith(CACHE_VERSION)
            )
          })
          .map(cacheName => {
            console.log('[SW] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          })
      )
    })
  )
  
  // Take control immediately
  return self.clients.claim()
})

/**
 * Fetch event - handle requests with appropriate caching strategy
 */
self.addEventListener('fetch', event => {
  const {request} = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip chrome extensions and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return
  }

  // Choose caching strategy based on request type
  if (isStaticAsset(url)) {
    // Static assets: Cache-first
    event.respondWith(cacheFirst(request, STATIC_CACHE))
  } else if (isImage(url)) {
    // Images: Cache-first with size limit
    event.respondWith(cacheFirstWithLimit(request, IMAGE_CACHE, MAX_IMAGE_CACHE_SIZE))
  } else if (isAPIRequest(url)) {
    // API requests: Network-first with cache fallback
    event.respondWith(networkFirstWithCache(request, API_CACHE))
  } else {
    // Everything else: Network-first with dynamic cache
    event.respondWith(networkFirstWithCache(request, DYNAMIC_CACHE))
  }
})

/**
 * Cache-first strategy
 * Try cache first, fall back to network
 */
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  
  if (cached) {
    return cached
  }
  
  try {
    const response = await fetch(request)
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    console.error('[SW] Network request failed:', error)
    return new Response('Offline - resource not cached', {
      status: 503,
      statusText: 'Service Unavailable',
    })
  }
}

/**
 * Cache-first with size limit
 * Same as cache-first but enforces max cache size
 */
async function cacheFirstWithLimit(request, cacheName, maxSize) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  
  if (cached) {
    return cached
  }
  
  try {
    const response = await fetch(request)
    if (response.ok) {
      // Add to cache
      cache.put(request, response.clone())
      
      // Trim cache if needed
      trimCache(cacheName, maxSize)
    }
    return response
  } catch (error) {
    console.error('[SW] Network request failed:', error)
    return new Response('Offline - resource not cached', {
      status: 503,
      statusText: 'Service Unavailable',
    })
  }
}

/**
 * Network-first with cache fallback
 * Try network first, fall back to cache if offline
 */
async function networkFirstWithCache(request, cacheName) {
  const cache = await caches.open(cacheName)
  
  try {
    const response = await fetch(request)
    
    if (response.ok) {
      // Update cache with fresh response
      cache.put(request, response.clone())
    }
    
    return response
  } catch (error) {
    // Network failed, try cache
    const cached = await cache.match(request)
    
    if (cached) {
      console.log('[SW] Serving from cache (offline):', request.url)
      return cached
    }
    
    // No cache available
    console.error('[SW] Request failed and no cache available:', error)
    return new Response(
      JSON.stringify({
        error: 'Offline - resource not available',
        message: 'You are offline and this resource is not cached',
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }
}

/**
 * Trim cache to max size
 */
async function trimCache(cacheName, maxSize) {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()
  
  if (keys.length > maxSize) {
    // Delete oldest entries (first in array)
    const toDelete = keys.slice(0, keys.length - maxSize)
    await Promise.all(toDelete.map(key => cache.delete(key)))
    console.log(`[SW] Trimmed ${cacheName} cache from ${keys.length} to ${maxSize} items`)
  }
}

/**
 * Check if URL is a static asset
 */
function isStaticAsset(url) {
  return (
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.ttf') ||
    url.pathname === '/' ||
    url.pathname === '/index.html' ||
    url.pathname === '/manifest.json'
  )
}

/**
 * Check if URL is an image
 */
function isImage(url) {
  return (
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.gif') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico')
  )
}

/**
 * Check if URL is an API request
 */
function isAPIRequest(url) {
  return url.pathname.startsWith('/api/')
}

/**
 * Background sync event (for future use)
 */
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData())
  }
})

/**
 * Sync data in background
 */
async function syncData() {
  console.log('[SW] Background sync initiated')
  // Future: Sync offline changes to server
}

/**
 * Push notification event (for future use)
 */
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'New update available',
    icon: '/images/icon192.png',
    badge: '/images/icon192.png',
    vibrate: [200, 100, 200],
  }

  event.waitUntil(
    self.registration.showNotification('Gramps Web', options)
  )
})

/**
 * Notification click event
 */
self.addEventListener('notificationclick', event => {
  event.notification.close()
  
  event.waitUntil(
    clients.openWindow('/')
  )
})

/**
 * Message event - handle messages from clients
 */
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        )
      })
    )
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({version: CACHE_VERSION})
  }
})

console.log('[SW] Service worker loaded')
