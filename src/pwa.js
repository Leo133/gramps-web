/**
 * PWA Utilities for Gramps Web
 * 
 * Handles service worker registration, PWA installation prompts,
 * and offline status detection.
 */

let deferredPrompt = null
let swRegistration = null

/**
 * Register the service worker
 * @returns {Promise<ServiceWorkerRegistration|null>}
 */
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Workers not supported in this browser')
    return null
  }
  
  try {
    swRegistration = await navigator.serviceWorker.register('/service-worker.js', {
      scope: '/'
    })
    
    console.log('[PWA] Service Worker registered:', swRegistration.scope)
    
    // Check for updates periodically (every hour)
    setInterval(() => {
      swRegistration.update()
    }, 60 * 60 * 1000)
    
    // Listen for updates
    swRegistration.addEventListener('updatefound', () => {
      const newWorker = swRegistration.installing
      
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New service worker available
          notifyUpdate()
        }
      })
    })
    
    return swRegistration
  } catch (error) {
    console.error('[PWA] Service Worker registration failed:', error)
    return null
  }
}

/**
 * Unregister service worker (for development/debugging)
 * @returns {Promise<boolean>}
 */
export async function unregisterServiceWorker() {
  if (!swRegistration) {
    return false
  }
  
  try {
    const success = await swRegistration.unregister()
    console.log('[PWA] Service Worker unregistered:', success)
    swRegistration = null
    return success
  } catch (error) {
    console.error('[PWA] Service Worker unregistration failed:', error)
    return false
  }
}

/**
 * Clear all caches
 * @returns {Promise<void>}
 */
export async function clearAllCaches() {
  if ('caches' in window) {
    const cacheNames = await caches.keys()
    await Promise.all(cacheNames.map(name => caches.delete(name)))
    console.log('[PWA] All caches cleared')
  }
}

/**
 * Send message to service worker
 * @param {Object} message - Message to send
 */
export function sendMessageToSW(message) {
  if (swRegistration && swRegistration.active) {
    swRegistration.active.postMessage(message)
  }
}

/**
 * Notify user about update
 */
function notifyUpdate() {
  window.dispatchEvent(new CustomEvent('sw-update-available', {
    detail: {
      registration: swRegistration
    }
  }))
}

/**
 * Update service worker
 */
export function updateServiceWorker() {
  if (swRegistration && swRegistration.waiting) {
    swRegistration.waiting.postMessage({type: 'SKIP_WAITING'})
    
    // Reload page after new SW takes control
    let refreshing = false
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true
        window.location.reload()
      }
    })
  }
}

/**
 * Set up beforeinstallprompt listener for PWA installation
 */
export function setupInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent default browser install prompt
    e.preventDefault()
    
    // Save the event for later use
    deferredPrompt = e
    
    // Notify app that install is available
    window.dispatchEvent(new CustomEvent('pwa-install-available'))
  })
  
  // Listen for successful installation
  window.addEventListener('appinstalled', () => {
    console.log('[PWA] App installed successfully')
    deferredPrompt = null
    
    window.dispatchEvent(new CustomEvent('pwa-installed'))
  })
}

/**
 * Show PWA install prompt
 * @returns {Promise<boolean>} Whether user accepted the install
 */
export async function showInstallPrompt() {
  if (!deferredPrompt) {
    console.warn('[PWA] Install prompt not available')
    return false
  }
  
  try {
    // Show the install prompt
    deferredPrompt.prompt()
    
    // Wait for user response
    const {outcome} = await deferredPrompt.userChoice
    console.log('[PWA] Install prompt outcome:', outcome)
    
    // Clear the prompt
    deferredPrompt = null
    
    return outcome === 'accepted'
  } catch (error) {
    console.error('[PWA] Install prompt error:', error)
    return false
  }
}

/**
 * Check if app is running as installed PWA
 * @returns {boolean}
 */
export function isInstalledPWA() {
  // Check display mode
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true
  }
  
  // Check iOS
  if (window.navigator.standalone === true) {
    return true
  }
  
  return false
}

/**
 * Check if install prompt is available
 * @returns {boolean}
 */
export function isInstallAvailable() {
  return deferredPrompt !== null
}

/**
 * Detect online/offline status
 */
export function setupOnlineStatusDetection() {
  const updateOnlineStatus = () => {
    const isOnline = navigator.onLine
    
    window.dispatchEvent(new CustomEvent('online-status-changed', {
      detail: {isOnline}
    }))
    
    document.documentElement.setAttribute('data-online', isOnline.toString())
  }
  
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)
  
  // Set initial status
  updateOnlineStatus()
}

/**
 * Check if app is online
 * @returns {boolean}
 */
export function isOnline() {
  return navigator.onLine
}

/**
 * Get estimated storage quota and usage
 * @returns {Promise<Object>} Storage info
 */
export async function getStorageInfo() {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate()
      return {
        usage: estimate.usage,
        quota: estimate.quota,
        usagePercent: (estimate.usage / estimate.quota * 100).toFixed(2),
        usageMB: (estimate.usage / 1024 / 1024).toFixed(2),
        quotaMB: (estimate.quota / 1024 / 1024).toFixed(2),
      }
    } catch (error) {
      console.error('[PWA] Storage estimation error:', error)
    }
  }
  
  return null
}

/**
 * Request persistent storage (to prevent eviction)
 * @returns {Promise<boolean>}
 */
export async function requestPersistentStorage() {
  if ('storage' in navigator && 'persist' in navigator.storage) {
    try {
      const persistent = await navigator.storage.persist()
      console.log('[PWA] Persistent storage:', persistent)
      return persistent
    } catch (error) {
      console.error('[PWA] Persistent storage request error:', error)
    }
  }
  
  return false
}

/**
 * Check if storage is persistent
 * @returns {Promise<boolean>}
 */
export async function isPersistentStorage() {
  if ('storage' in navigator && 'persisted' in navigator.storage) {
    try {
      return await navigator.storage.persisted()
    } catch (error) {
      console.error('[PWA] Persistent storage check error:', error)
    }
  }
  
  return false
}

/**
 * Initialize PWA features
 */
export function initializePWA() {
  console.log('[PWA] Initializing...')
  
  // Register service worker
  registerServiceWorker()
  
  // Setup install prompt handling
  setupInstallPrompt()
  
  // Setup online/offline detection
  setupOnlineStatusDetection()
  
  // Log PWA status
  console.log('[PWA] Installed:', isInstalledPWA())
  console.log('[PWA] Online:', isOnline())
  
  // Get storage info
  getStorageInfo().then(info => {
    if (info) {
      console.log('[PWA] Storage:', `${info.usageMB}MB / ${info.quotaMB}MB (${info.usagePercent}%)`)
    }
  })
}
