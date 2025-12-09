/* eslint-disable max-classes-per-file */
/**
 * Responsive Breakpoint Utilities
 *
 * Provides utilities for working with responsive breakpoints,
 * matching the breakpoints used in Gramps Web's design system.
 */

/**
 * Standard breakpoints
 */
export const Breakpoints = {
  mobile: 768,
  tablet: 992,
  desktop: 1200,
}

/**
 * Get current breakpoint
 * @returns {string} 'mobile', 'tablet', or 'desktop'
 */
export function getCurrentBreakpoint() {
  const width = window.innerWidth

  if (width < Breakpoints.mobile) {
    return 'mobile'
  }
  if (width < Breakpoints.tablet) {
    return 'tablet'
  }
  if (width < Breakpoints.desktop) {
    return 'large-tablet'
  }
  return 'desktop'
}

/**
 * Check if current viewport matches a breakpoint
 * @param {string} breakpoint - 'mobile', 'tablet', or 'desktop'
 * @returns {boolean}
 */
export function matchesBreakpoint(breakpoint) {
  const current = getCurrentBreakpoint()

  switch (breakpoint) {
    case 'mobile':
      return current === 'mobile'
    case 'tablet':
      return current === 'tablet' || current === 'large-tablet'
    case 'desktop':
      return current === 'desktop'
    default:
      return false
  }
}

/**
 * Check if viewport is mobile or smaller
 * @returns {boolean}
 */
export function isMobileViewport() {
  return window.innerWidth < Breakpoints.mobile
}

/**
 * Check if viewport is tablet or smaller
 * @returns {boolean}
 */
export function isTabletViewport() {
  return window.innerWidth < Breakpoints.tablet
}

/**
 * Check if viewport is desktop or larger
 * @returns {boolean}
 */
export function isDesktopViewport() {
  return window.innerWidth >= Breakpoints.desktop
}

/**
 * Media query matcher with callback
 */
export class ResponsiveWatcher {
  constructor(breakpoint, callback) {
    this.breakpoint = breakpoint
    this.callback = callback
    this.mediaQuery = null
    this.handler = null

    this.setup()
  }

  setup() {
    let query = ''

    switch (this.breakpoint) {
      case 'mobile':
        query = `(max-width: ${Breakpoints.mobile - 1}px)`
        break
      case 'tablet':
        query = `(min-width: ${Breakpoints.mobile}px) and (max-width: ${
          Breakpoints.tablet - 1
        }px)`
        break
      case 'desktop':
        query = `(min-width: ${Breakpoints.desktop}px)`
        break
      default:
        query = this.breakpoint // Custom query
    }

    this.mediaQuery = window.matchMedia(query)
    this.handler = e => this.callback(e.matches)

    // Call immediately with current state
    this.callback(this.mediaQuery.matches)

    // Listen for changes
    this.mediaQuery.addEventListener('change', this.handler)
  }

  destroy() {
    if (this.mediaQuery && this.handler) {
      this.mediaQuery.removeEventListener('change', this.handler)
    }
  }
}

/**
 * Watch for breakpoint changes
 * @param {string} breakpoint - Breakpoint name or custom media query
 * @param {Function} callback - Called when breakpoint matches
 * @returns {ResponsiveWatcher}
 */
export function watchBreakpoint(breakpoint, callback) {
  return new ResponsiveWatcher(breakpoint, callback)
}

/**
 * Apply different values based on breakpoint
 * @param {Object} values - Object with breakpoint keys and values
 * @returns {*} Value for current breakpoint
 *
 * @example
 * const fontSize = responsive({
 *   mobile: '14px',
 *   tablet: '16px',
 *   desktop: '18px'
 * })
 */
export function responsive(values) {
  const bp = getCurrentBreakpoint()

  // Try exact match first
  if (values[bp]) {
    return values[bp]
  }

  // Fall back to closest smaller breakpoint
  if (bp === 'large-tablet' && values.tablet) {
    return values.tablet
  }

  if ((bp === 'tablet' || bp === 'large-tablet') && values.mobile) {
    return values.mobile
  }

  // Default fallback
  return values.mobile || values.tablet || values.desktop || null
}

/**
 * Get grid columns based on breakpoint
 * @param {Object} columns - Column count per breakpoint
 * @returns {number}
 *
 * @example
 * const cols = getGridColumns({
 *   mobile: 1,
 *   tablet: 2,
 *   desktop: 3
 * })
 */
export function getGridColumns(columns) {
  return responsive(columns)
}

/**
 * Check if device is in landscape orientation
 * @returns {boolean}
 */
export function isLandscape() {
  return window.innerWidth > window.innerHeight
}

/**
 * Check if device is in portrait orientation
 * @returns {boolean}
 */
export function isPortrait() {
  return window.innerWidth <= window.innerHeight
}

/**
 * Watch for orientation changes
 * @param {Function} callback - Called with 'landscape' or 'portrait'
 */
export function watchOrientation(callback) {
  const handler = () => {
    callback(isLandscape() ? 'landscape' : 'portrait')
  }

  window.addEventListener('orientationchange', handler)
  window.addEventListener('resize', handler)

  // Call immediately
  handler()

  return () => {
    window.removeEventListener('orientationchange', handler)
    window.removeEventListener('resize', handler)
  }
}

/**
 * Debounced resize handler
 * @param {Function} callback
 * @param {number} delay - Debounce delay in ms
 * @returns {Function} Cleanup function
 */
export function onResize(callback, delay = 250) {
  let timeout = null

  const handler = () => {
    clearTimeout(timeout)
    timeout = setTimeout(callback, delay)
  }

  window.addEventListener('resize', handler)

  // Call immediately
  callback()

  return () => {
    window.removeEventListener('resize', handler)
    clearTimeout(timeout)
  }
}

/**
 * Get viewport dimensions
 * @returns {Object} Width and height
 */
export function getViewportSize() {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  }
}

/**
 * Check if element is visible in viewport
 * @param {HTMLElement} element
 * @param {number} threshold - Percentage of element that must be visible (0-1)
 * @returns {boolean}
 */
export function isInViewport(element, threshold = 0) {
  const rect = element.getBoundingClientRect()
  const windowHeight = window.innerHeight
  const windowWidth = window.innerWidth

  const vertInView = rect.top <= windowHeight && rect.top + rect.height >= 0
  const horInView = rect.left <= windowWidth && rect.left + rect.width >= 0

  if (!vertInView || !horInView) {
    return false
  }

  if (threshold === 0) {
    return true
  }

  // Calculate visible percentage
  const visibleHeight =
    Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0)
  const visibleWidth =
    Math.min(rect.right, windowWidth) - Math.max(rect.left, 0)
  const visibleArea = visibleHeight * visibleWidth
  const totalArea = rect.height * rect.width

  return visibleArea / totalArea >= threshold
}

/**
 * Viewport observer for lazy loading
 */
export class ViewportObserver {
  constructor(callback, options = {}) {
    this.callback = callback
    this.options = {
      threshold: options.threshold || 0.1,
      rootMargin: options.rootMargin || '50px',
    }

    this.observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          this.callback(entry.target, entry.isIntersecting, entry)
        })
      },
      {
        threshold: this.options.threshold,
        rootMargin: this.options.rootMargin,
      }
    )
  }

  observe(element) {
    this.observer.observe(element)
  }

  unobserve(element) {
    this.observer.unobserve(element)
  }

  disconnect() {
    this.observer.disconnect()
  }
}

/**
 * Create viewport observer for lazy loading
 * @param {Function} callback
 * @param {Object} options
 * @returns {ViewportObserver}
 */
export function createViewportObserver(callback, options) {
  return new ViewportObserver(callback, options)
}
