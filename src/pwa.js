/**
 * PWA Utilities for Gramps Web
 * 
 * Phase 10: UI/UX Overhaul - PWA Enhancement
 * 
 * This module provides utilities for Progressive Web App features:
 * - Service worker registration and updates
 * - Install prompt handling
 * - Online/offline detection
 * - App update notifications
 */

/**
 * Register service worker
 * @returns {Promise<ServiceWorkerRegistration|null>}
 */
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service workers are not supported in this browser')
    return null
  }

  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js', {
      scope: '/',
    })

    console.log('Service worker registered:', registration.scope)

    // Check for updates periodically
    setInterval(() => {
      registration.update()
    }, 60 * 60 * 1000) // Check every hour

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New service worker available
          notifyAppUpdate()
        }
      })
    })

    return registration
  } catch (error) {
    console.error('Service worker registration failed:', error)
    return null
  }
}

/**
 * Unregister service worker
 */
export async function unregisterServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    return false
  }

  const registration = await navigator.serviceWorker.getRegistration()
  if (registration) {
    const unregistered = await registration.unregister()
    console.log('Service worker unregistered:', unregistered)
    return unregistered
  }

  return false
}

/**
 * Notify user about app update
 */
function notifyAppUpdate() {
  // Dispatch custom event for app to handle
  const event = new CustomEvent('app-update-available', {
    detail: {
      message: 'A new version of Gramps Web is available',
    },
  })
  window.dispatchEvent(event)
}

/**
 * Update service worker
 * Call this when user accepts the update prompt
 */
export function updateServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    return
  }

  navigator.serviceWorker.getRegistration().then(registration => {
    if (registration && registration.waiting) {
      // Tell the waiting service worker to activate
      registration.waiting.postMessage({type: 'SKIP_WAITING'})

      // Reload the page when the new service worker is activated
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload()
      })
    }
  })
}

/**
 * Clear all caches
 */
export async function clearAllCaches() {
  if (!('caches' in window)) {
    return
  }

  const cacheNames = await caches.keys()
  await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)))
  console.log('All caches cleared')
}

/**
 * Get service worker version
 * @returns {Promise<string>}
 */
export async function getServiceWorkerVersion() {
  if (!('serviceWorker' in navigator)) {
    return 'Not supported'
  }

  const registration = await navigator.serviceWorker.getRegistration()
  if (!registration) {
    return 'Not registered'
  }

  return new Promise(resolve => {
    const messageChannel = new MessageChannel()
    messageChannel.port1.onmessage = event => {
      resolve(event.data.version || 'Unknown')
    }

    if (registration.active) {
      registration.active.postMessage({type: 'GET_VERSION'}, [messageChannel.port2])
    } else {
      resolve('No active worker')
    }
  })
}

/**
 * Install prompt handling
 */
let deferredInstallPrompt = null

/**
 * Initialize install prompt listener
 */
export function initInstallPrompt() {
  window.addEventListener('beforeinstallprompt', e => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault()
    
    // Save the event for later use
    deferredInstallPrompt = e
    
    // Dispatch custom event to show install button
    const event = new CustomEvent('app-installable', {
      detail: {
        platform: e.platforms,
      },
    })
    window.dispatchEvent(event)
  })

  // Track if app was installed
  window.addEventListener('appinstalled', () => {
    console.log('App installed successfully')
    deferredInstallPrompt = null
    
    // Dispatch custom event
    const event = new CustomEvent('app-installed')
    window.dispatchEvent(event)
  })
}

/**
 * Show install prompt
 * @returns {Promise<boolean>} True if user accepted
 */
export async function showInstallPrompt() {
  if (!deferredInstallPrompt) {
    console.warn('Install prompt not available')
    return false
  }

  // Show the install prompt
  deferredInstallPrompt.prompt()

  // Wait for user response
  const {outcome} = await deferredInstallPrompt.userChoice
  console.log(`User ${outcome} the install prompt`)

  // Clear the saved prompt
  deferredInstallPrompt = null

  return outcome === 'accepted'
}

/**
 * Check if app can be installed
 * @returns {boolean}
 */
export function canInstallApp() {
  return deferredInstallPrompt !== null
}

/**
 * Check if app is installed (running as PWA)
 * @returns {boolean}
 */
export function isAppInstalled() {
  // Check if running in standalone mode (installed PWA)
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true ||
    document.referrer.includes('android-app://')
  )
}

/**
 * Online/Offline detection
 */
let isOnline = navigator.onLine

/**
 * Initialize online/offline detection
 */
export function initOnlineDetection() {
  // Set initial state
  isOnline = navigator.onLine
  updateOnlineStatus(isOnline)

  // Listen for changes
  window.addEventListener('online', () => {
    isOnline = true
    updateOnlineStatus(true)
  })

  window.addEventListener('offline', () => {
    isOnline = false
    updateOnlineStatus(false)
  })
}

/**
 * Update online status
 */
function updateOnlineStatus(online) {
  console.log(`App is now ${online ? 'online' : 'offline'}`)
  
  // Dispatch custom event
  const event = new CustomEvent('online-status-changed', {
    detail: {online},
  })
  window.dispatchEvent(event)

  // Update UI
  document.documentElement.setAttribute('data-online', online ? 'true' : 'false')
}

/**
 * Check if currently online
 * @returns {boolean}
 */
export function isOnlineStatus() {
  return isOnline
}

/**
 * Wait for online connection
 * @param {number} timeout - Timeout in ms (default: no timeout)
 * @returns {Promise<boolean>}
 */
export function waitForOnline(timeout = 0) {
  if (isOnline) {
    return Promise.resolve(true)
  }

  return new Promise((resolve, reject) => {
    const onlineHandler = () => {
      cleanup()
      resolve(true)
    }

    let timeoutId = null
    if (timeout > 0) {
      timeoutId = setTimeout(() => {
        cleanup()
        reject(new Error('Timeout waiting for online connection'))
      }, timeout)
    }

    const cleanup = () => {
      window.removeEventListener('online', onlineHandler)
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }

    window.addEventListener('online', onlineHandler)
  })
}

/**
 * Network quality detection
 */
export function getNetworkQuality() {
  if (!('connection' in navigator)) {
    return {
      effectiveType: 'unknown',
      downlink: null,
      rtt: null,
      saveData: false,
    }
  }

  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
  
  return {
    effectiveType: connection.effectiveType, // '4g', '3g', '2g', 'slow-2g'
    downlink: connection.downlink, // Mbps
    rtt: connection.rtt, // ms
    saveData: connection.saveData, // boolean
  }
}

/**
 * Check if on slow connection
 * @returns {boolean}
 */
export function isSlowConnection() {
  const quality = getNetworkQuality()
  return (
    quality.saveData ||
    quality.effectiveType === 'slow-2g' ||
    quality.effectiveType === '2g' ||
    (quality.downlink !== null && quality.downlink < 0.5)
  )
}

/**
 * App lifecycle events
 */
export function initAppLifecycle() {
  // Page visibility API
  document.addEventListener('visibilitychange', () => {
    const visible = !document.hidden
    console.log(`App is now ${visible ? 'visible' : 'hidden'}`)
    
    const event = new CustomEvent('app-visibility-changed', {
      detail: {visible},
    })
    window.dispatchEvent(event)
  })

  // Page load/unload
  window.addEventListener('load', () => {
    const event = new CustomEvent('app-loaded')
    window.dispatchEvent(event)
  })

  window.addEventListener('beforeunload', () => {
    const event = new CustomEvent('app-unloading')
    window.dispatchEvent(event)
  })
}

/**
 * Initialize all PWA features
 */
export async function initPWA() {
  console.log('Initializing PWA features...')

  // Register service worker
  await registerServiceWorker()

  // Initialize install prompt
  initInstallPrompt()

  // Initialize online detection
  initOnlineDetection()

  // Initialize app lifecycle
  initAppLifecycle()

  console.log('PWA features initialized')
  
  // Log PWA status
  console.log('PWA Status:', {
    installed: isAppInstalled(),
    online: isOnlineStatus(),
    canInstall: canInstallApp(),
    networkQuality: getNetworkQuality(),
  })
}

/**
 * Get PWA status
 * @returns {Object} Status object
 */
export function getPWAStatus() {
  return {
    serviceWorkerSupported: 'serviceWorker' in navigator,
    serviceWorkerRegistered: navigator.serviceWorker?.controller !== undefined,
    installed: isAppInstalled(),
    online: isOnlineStatus(),
    canInstall: canInstallApp(),
    networkQuality: getNetworkQuality(),
  }
}

/**
 * Request persistent storage
 * Ensures data won't be cleared under storage pressure
 */
export async function requestPersistentStorage() {
  if (!('storage' in navigator) || !('persist' in navigator.storage)) {
    console.warn('Persistent storage is not supported')
    return false
  }

  const isPersisted = await navigator.storage.persisted()
  
  if (isPersisted) {
    console.log('Storage is already persistent')
    return true
  }

  const granted = await navigator.storage.persist()
  console.log(`Persistent storage ${granted ? 'granted' : 'denied'}`)
  return granted
}

/**
 * Get storage estimate
 * @returns {Promise<Object>}
 */
export async function getStorageEstimate() {
  if (!('storage' in navigator) || !('estimate' in navigator.storage)) {
    return null
  }

  const estimate = await navigator.storage.estimate()
  
  return {
    usage: estimate.usage,
    quota: estimate.quota,
    usagePercent: Math.round((estimate.usage / estimate.quota) * 100),
    usageMB: Math.round(estimate.usage / (1024 * 1024)),
    quotaMB: Math.round(estimate.quota / (1024 * 1024)),
  }
}
