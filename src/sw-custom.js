/**
 * Enhanced Service Worker for Gramps Web
 * Phase 11: Offline Mode Implementation
 * 
 * This service worker provides:
 * - Offline functionality for viewing cached data
 * - Background sync for queued operations
 * - Push notification support (future enhancement)
 */

// Import Workbox libraries
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js')

const {
  precacheAndRoute,
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
} = workbox.precaching
const {registerRoute, NavigationRoute} = workbox.routing
const {
  NetworkFirst,
  CacheFirst,
  StaleWhileRevalidate,
  NetworkOnly,
} = workbox.strategies
const {ExpirationPlugin} = workbox.expiration
const {CacheableResponsePlugin} = workbox.cacheableResponse

// Service Worker Version
const SW_VERSION = '1.0.0'
const CACHE_PREFIX = 'gramps-web'

// Precache static assets injected by Workbox during build
precacheAndRoute(self.__WB_MANIFEST || [])

// Clean up old caches
cleanupOutdatedCaches()

// App Shell - Network First with fallback
const appShellHandler = new NetworkFirst({
  cacheName: `${CACHE_PREFIX}-app-shell`,
  plugins: [
    new CacheableResponsePlugin({
      statuses: [0, 200],
    }),
    new ExpirationPlugin({
      maxEntries: 50,
      maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
    }),
  ],
})

// Register navigation route for app shell
const navigationRoute = new NavigationRoute(appShellHandler, {
  allowlist: [/^\/(?!api).*/], // Everything except /api routes
})
registerRoute(navigationRoute)

// API Requests - Network First with offline fallback
registerRoute(
  ({url}) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: `${CACHE_PREFIX}-api`,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 5 * 60, // 5 minutes
      }),
    ],
    networkTimeoutSeconds: 10,
  }),
)

// Images - Cache First
registerRoute(
  ({request}) => request.destination === 'image',
  new CacheFirst({
    cacheName: `${CACHE_PREFIX}-images`,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  }),
)

// Fonts - Cache First
registerRoute(
  ({request}) => request.destination === 'font',
  new CacheFirst({
    cacheName: `${CACHE_PREFIX}-fonts`,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
      }),
    ],
  }),
)

// Static Assets - Stale While Revalidate
registerRoute(
  ({request}) =>
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'worker',
  new StaleWhileRevalidate({
    cacheName: `${CACHE_PREFIX}-static`,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  }),
)

// Handle service worker updates
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({version: SW_VERSION})
  }
})

// Notify clients when service worker is activated
self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      // Claim all clients
      await self.clients.claim()
      
      // Notify all clients about the update
      const clients = await self.clients.matchAll({type: 'window'})
      clients.forEach(client => {
        client.postMessage({
          type: 'SW_ACTIVATED',
          version: SW_VERSION,
        })
      })
    })(),
  )
})

// Background Sync for offline operations (future enhancement)
self.addEventListener('sync', event => {
  if (event.tag === 'sync-offline-changes') {
    event.waitUntil(syncOfflineChanges())
  }
})

async function syncOfflineChanges() {
  // Placeholder for background sync logic
  console.log('Background sync triggered')
  // Future: Sync offline changes to server
}

// Log service worker installation
self.addEventListener('install', event => {
  console.log(`Service Worker ${SW_VERSION} installing...`)
  // Force waiting service worker to become active
  self.skipWaiting()
})

console.log(`Service Worker ${SW_VERSION} loaded`)
