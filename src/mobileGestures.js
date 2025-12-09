/**
 * Mobile Touch Gesture Utilities
 * 
 * Provides utilities for handling touch gestures on mobile devices,
 * including swipe detection, long press, and touch optimization.
 */

/**
 * Swipe gesture detector
 */
export class SwipeDetector {
  constructor(element, options = {}) {
    this.element = element
    this.options = {
      threshold: options.threshold || 50, // Minimum distance for swipe
      timeout: options.timeout || 500, // Maximum time for swipe
      onSwipeLeft: options.onSwipeLeft || null,
      onSwipeRight: options.onSwipeRight || null,
      onSwipeUp: options.onSwipeUp || null,
      onSwipeDown: options.onSwipeDown || null,
    }
    
    this.startX = 0
    this.startY = 0
    this.startTime = 0
    
    // Bind handlers once and store references
    this.boundTouchStart = this.handleTouchStart.bind(this)
    this.boundTouchEnd = this.handleTouchEnd.bind(this)
    
    this.bind()
  }
  
  bind() {
    this.element.addEventListener('touchstart', this.boundTouchStart, {passive: true})
    this.element.addEventListener('touchend', this.boundTouchEnd, {passive: false})
  }
  
  unbind() {
    this.element.removeEventListener('touchstart', this.boundTouchStart)
    this.element.removeEventListener('touchend', this.boundTouchEnd)
  }
  
  handleTouchStart(e) {
    const touch = e.touches[0]
    this.startX = touch.clientX
    this.startY = touch.clientY
    this.startTime = Date.now()
  }
  
  handleTouchEnd(e) {
    const touch = e.changedTouches[0]
    const endX = touch.clientX
    const endY = touch.clientY
    const endTime = Date.now()
    
    const deltaX = endX - this.startX
    const deltaY = endY - this.startY
    const deltaTime = endTime - this.startTime
    
    // Check if gesture is within time threshold
    if (deltaTime > this.options.timeout) {
      return
    }
    
    // Determine primary direction
    const absX = Math.abs(deltaX)
    const absY = Math.abs(deltaY)
    
    if (absX > absY && absX > this.options.threshold) {
      // Horizontal swipe
      if (deltaX > 0) {
        // Swipe right
        if (this.options.onSwipeRight) {
          e.preventDefault()
          this.options.onSwipeRight(e)
        }
      } else {
        // Swipe left
        if (this.options.onSwipeLeft) {
          e.preventDefault()
          this.options.onSwipeLeft(e)
        }
      }
    } else if (absY > absX && absY > this.options.threshold) {
      // Vertical swipe
      if (deltaY > 0) {
        // Swipe down
        if (this.options.onSwipeDown) {
          e.preventDefault()
          this.options.onSwipeDown(e)
        }
      } else {
        // Swipe up
        if (this.options.onSwipeUp) {
          e.preventDefault()
          this.options.onSwipeUp(e)
        }
      }
    }
  }
}

/**
 * Long press detector
 */
export class LongPressDetector {
  constructor(element, options = {}) {
    this.element = element
    this.options = {
      duration: options.duration || 500, // Long press duration
      onLongPress: options.onLongPress || null,
    }
    
    this.timer = null
    this.touchStarted = false
    
    // Bind handlers once and store references
    this.boundTouchStart = this.handleTouchStart.bind(this)
    this.boundTouchEnd = this.handleTouchEnd.bind(this)
    this.boundTouchMove = this.handleTouchMove.bind(this)
    
    this.bind()
  }
  
  bind() {
    this.element.addEventListener('touchstart', this.boundTouchStart, {passive: true})
    this.element.addEventListener('touchend', this.boundTouchEnd)
    this.element.addEventListener('touchmove', this.boundTouchMove)
  }
  
  unbind() {
    this.element.removeEventListener('touchstart', this.boundTouchStart)
    this.element.removeEventListener('touchend', this.boundTouchEnd)
    this.element.removeEventListener('touchmove', this.boundTouchMove)
  }
  
  handleTouchStart(e) {
    this.touchStarted = true
    this.timer = setTimeout(() => {
      if (this.touchStarted && this.options.onLongPress) {
        this.options.onLongPress(e)
      }
    }, this.options.duration)
  }
  
  handleTouchEnd() {
    this.touchStarted = false
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
  }
  
  handleTouchMove() {
    this.touchStarted = false
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
  }
}

/**
 * Create a swipe detector
 * @param {HTMLElement} element - Element to attach swipe detection
 * @param {Object} options - Swipe options
 * @returns {SwipeDetector}
 */
export function createSwipeDetector(element, options) {
  return new SwipeDetector(element, options)
}

/**
 * Create a long press detector
 * @param {HTMLElement} element - Element to attach long press detection
 * @param {Object} options - Long press options
 * @returns {LongPressDetector}
 */
export function createLongPressDetector(element, options) {
  return new LongPressDetector(element, options)
}

/**
 * Optimize touch target size for accessibility
 * Ensures minimum 44x44 pixel touch targets
 * @param {HTMLElement} element
 */
export function optimizeTouchTarget(element) {
  const rect = element.getBoundingClientRect()
  const minSize = 44 // WCAG minimum touch target size
  
  if (rect.width < minSize || rect.height < minSize) {
    // Add padding to increase touch target
    const currentPadding = parseInt(getComputedStyle(element).padding) || 0
    const paddingNeeded = Math.max(
      0,
      Math.ceil((minSize - Math.min(rect.width, rect.height)) / 2)
    )
    
    element.style.padding = `${currentPadding + paddingNeeded}px`
  }
}

/**
 * Add haptic feedback on touch (if supported)
 * @param {string} type - 'light', 'medium', or 'heavy'
 */
export function hapticFeedback(type = 'light') {
  if ('vibrate' in navigator) {
    const patterns = {
      light: 10,
      medium: 20,
      heavy: 30,
    }
    navigator.vibrate(patterns[type] || 10)
  }
}

/**
 * Prevent default touch behaviors for custom handling
 * @param {HTMLElement} element
 */
export function preventDefaultTouch(element) {
  element.addEventListener('touchstart', e => e.preventDefault(), {passive: false})
  element.addEventListener('touchmove', e => e.preventDefault(), {passive: false})
  element.addEventListener('touchend', e => e.preventDefault(), {passive: false})
}

/**
 * Detect if device has touch support
 * @returns {boolean}
 */
export function hasTouchSupport() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

/**
 * Detect if device is mobile
 * @returns {boolean}
 */
export function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  ) || (hasTouchSupport() && window.innerWidth < 768)
}

/**
 * Get safe area insets for devices with notches
 * @returns {Object} Insets for top, right, bottom, left
 */
export function getSafeAreaInsets() {
  const root = document.documentElement
  const style = getComputedStyle(root)
  
  return {
    top: parseInt(style.getPropertyValue('env(safe-area-inset-top)')) || 0,
    right: parseInt(style.getPropertyValue('env(safe-area-inset-right)')) || 0,
    bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)')) || 0,
    left: parseInt(style.getPropertyValue('env(safe-area-inset-left)')) || 0,
  }
}

/**
 * Apply safe area padding to an element
 * @param {HTMLElement} element
 */
export function applySafeAreaPadding(element) {
  element.style.paddingTop = 'env(safe-area-inset-top)'
  element.style.paddingRight = 'env(safe-area-inset-right)'
  element.style.paddingBottom = 'env(safe-area-inset-bottom)'
  element.style.paddingLeft = 'env(safe-area-inset-left)'
}

/**
 * Enable fast tap (remove 300ms delay on mobile)
 * Note: Modern browsers handle this automatically, but this provides fallback
 * @param {HTMLElement} element
 */
export function enableFastTap(element) {
  element.addEventListener('touchstart', () => {}, {passive: true})
  element.style.touchAction = 'manipulation'
}

/**
 * Pull to refresh handler
 */
export class PullToRefresh {
  constructor(element, options = {}) {
    this.element = element
    this.options = {
      threshold: options.threshold || 80,
      onRefresh: options.onRefresh || null,
    }
    
    this.startY = 0
    this.currentY = 0
    this.isPulling = false
    
    // Bind handlers once and store references
    this.boundTouchStart = this.handleTouchStart.bind(this)
    this.boundTouchMove = this.handleTouchMove.bind(this)
    this.boundTouchEnd = this.handleTouchEnd.bind(this)
    
    this.bind()
  }
  
  bind() {
    this.element.addEventListener('touchstart', this.boundTouchStart, {passive: true})
    this.element.addEventListener('touchmove', this.boundTouchMove, {passive: false})
    this.element.addEventListener('touchend', this.boundTouchEnd)
  }
  
  unbind() {
    this.element.removeEventListener('touchstart', this.boundTouchStart)
    this.element.removeEventListener('touchmove', this.boundTouchMove)
    this.element.removeEventListener('touchend', this.boundTouchEnd)
  }
  
  handleTouchStart(e) {
    // Only start if at top of scrollable area
    if (this.element.scrollTop === 0) {
      this.startY = e.touches[0].clientY
      this.isPulling = true
    }
  }
  
  handleTouchMove(e) {
    if (!this.isPulling) return
    
    this.currentY = e.touches[0].clientY
    const deltaY = this.currentY - this.startY
    
    if (deltaY > 0 && this.element.scrollTop === 0) {
      // Prevent default scroll
      e.preventDefault()
      
      // Apply visual feedback
      const pullDistance = Math.min(deltaY, this.options.threshold * 1.5)
      this.element.style.transform = `translateY(${pullDistance}px)`
    }
  }
  
  handleTouchEnd() {
    if (!this.isPulling) return
    
    const deltaY = this.currentY - this.startY
    
    if (deltaY > this.options.threshold && this.options.onRefresh) {
      this.options.onRefresh()
    }
    
    // Reset
    this.element.style.transform = ''
    this.isPulling = false
    this.startY = 0
    this.currentY = 0
  }
}

/**
 * Create pull to refresh
 * @param {HTMLElement} element
 * @param {Object} options
 * @returns {PullToRefresh}
 */
export function createPullToRefresh(element, options) {
  return new PullToRefresh(element, options)
}
