/* eslint-disable max-classes-per-file */
/**
 * Responsive Design Utilities for Gramps Web
 *
 * Phase 10: UI/UX Overhaul - Mobile-First Responsive Design
 *
 * This module provides utilities for creating responsive,
 * mobile-first user interfaces.
 */

import {css} from 'lit'

/**
 * Responsive design CSS utilities
 */
export const responsiveStyles = css`
  /* =====================================================
     CONTAINER SYSTEM
     ===================================================== */

  .container {
    width: 100%;
    margin-left: auto;
    margin-right: auto;
    padding-left: var(--spacing-4, 16px);
    padding-right: var(--spacing-4, 16px);
  }

  .container-sm {
    max-width: var(--container-sm, 640px);
  }

  .container-md {
    max-width: var(--container-md, 768px);
  }

  .container-lg {
    max-width: var(--container-lg, 1024px);
  }

  .container-xl {
    max-width: var(--container-xl, 1280px);
  }

  .container-2xl {
    max-width: var(--container-2xl, 1536px);
  }

  .container-fluid {
    width: 100%;
    padding-left: var(--spacing-4, 16px);
    padding-right: var(--spacing-4, 16px);
  }

  /* =====================================================
     GRID SYSTEM
     Mobile-first responsive grid
     ===================================================== */

  .grid {
    display: grid;
    gap: var(--spacing-4, 16px);
  }

  .grid-cols-1 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
  .grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .grid-cols-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
  .grid-cols-6 {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }
  .grid-cols-12 {
    grid-template-columns: repeat(12, minmax(0, 1fr));
  }

  /* Responsive grid breakpoints */
  @media (min-width: 640px) {
    .sm\\:grid-cols-1 {
      grid-template-columns: repeat(1, minmax(0, 1fr));
    }
    .sm\\:grid-cols-2 {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .sm\\:grid-cols-3 {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
    .sm\\:grid-cols-4 {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }

  @media (min-width: 768px) {
    .md\\:grid-cols-1 {
      grid-template-columns: repeat(1, minmax(0, 1fr));
    }
    .md\\:grid-cols-2 {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .md\\:grid-cols-3 {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
    .md\\:grid-cols-4 {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }

  @media (min-width: 1024px) {
    .lg\\:grid-cols-1 {
      grid-template-columns: repeat(1, minmax(0, 1fr));
    }
    .lg\\:grid-cols-2 {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .lg\\:grid-cols-3 {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
    .lg\\:grid-cols-4 {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
    .lg\\:grid-cols-6 {
      grid-template-columns: repeat(6, minmax(0, 1fr));
    }
  }

  /* =====================================================
     FLEX UTILITIES
     ===================================================== */

  .flex {
    display: flex;
  }
  .inline-flex {
    display: inline-flex;
  }
  .flex-row {
    flex-direction: row;
  }
  .flex-col {
    flex-direction: column;
  }
  .flex-wrap {
    flex-wrap: wrap;
  }
  .flex-nowrap {
    flex-wrap: nowrap;
  }
  .flex-1 {
    flex: 1 1 0%;
  }
  .flex-auto {
    flex: 1 1 auto;
  }
  .flex-initial {
    flex: 0 1 auto;
  }
  .flex-none {
    flex: none;
  }

  /* Flex alignment */
  .items-start {
    align-items: flex-start;
  }
  .items-end {
    align-items: flex-end;
  }
  .items-center {
    align-items: center;
  }
  .items-baseline {
    align-items: baseline;
  }
  .items-stretch {
    align-items: stretch;
  }

  .justify-start {
    justify-content: flex-start;
  }
  .justify-end {
    justify-content: flex-end;
  }
  .justify-center {
    justify-content: center;
  }
  .justify-between {
    justify-content: space-between;
  }
  .justify-around {
    justify-content: space-around;
  }
  .justify-evenly {
    justify-content: space-evenly;
  }

  /* Gap utilities */
  .gap-0 {
    gap: 0;
  }
  .gap-1 {
    gap: var(--spacing-1, 4px);
  }
  .gap-2 {
    gap: var(--spacing-2, 8px);
  }
  .gap-3 {
    gap: var(--spacing-3, 12px);
  }
  .gap-4 {
    gap: var(--spacing-4, 16px);
  }
  .gap-6 {
    gap: var(--spacing-6, 24px);
  }
  .gap-8 {
    gap: var(--spacing-8, 32px);
  }

  /* =====================================================
     DISPLAY UTILITIES
     ===================================================== */

  .block {
    display: block;
  }
  .inline-block {
    display: inline-block;
  }
  .inline {
    display: inline;
  }
  .hidden {
    display: none;
  }

  /* Responsive display */
  @media (max-width: 639px) {
    .xs\\:hidden {
      display: none;
    }
    .xs\\:block {
      display: block;
    }
  }

  @media (min-width: 640px) {
    .sm\\:hidden {
      display: none;
    }
    .sm\\:block {
      display: block;
    }
  }

  @media (min-width: 768px) {
    .md\\:hidden {
      display: none;
    }
    .md\\:block {
      display: block;
    }
  }

  @media (min-width: 1024px) {
    .lg\\:hidden {
      display: none;
    }
    .lg\\:block {
      display: block;
    }
  }

  /* =====================================================
     SPACING UTILITIES
     ===================================================== */

  /* Margin */
  .m-0 {
    margin: 0;
  }
  .m-1 {
    margin: var(--spacing-1, 4px);
  }
  .m-2 {
    margin: var(--spacing-2, 8px);
  }
  .m-3 {
    margin: var(--spacing-3, 12px);
  }
  .m-4 {
    margin: var(--spacing-4, 16px);
  }
  .m-6 {
    margin: var(--spacing-6, 24px);
  }
  .m-8 {
    margin: var(--spacing-8, 32px);
  }
  .m-auto {
    margin: auto;
  }

  .mx-auto {
    margin-left: auto;
    margin-right: auto;
  }
  .my-auto {
    margin-top: auto;
    margin-bottom: auto;
  }

  .mt-0 {
    margin-top: 0;
  }
  .mt-1 {
    margin-top: var(--spacing-1, 4px);
  }
  .mt-2 {
    margin-top: var(--spacing-2, 8px);
  }
  .mt-4 {
    margin-top: var(--spacing-4, 16px);
  }
  .mt-6 {
    margin-top: var(--spacing-6, 24px);
  }
  .mt-8 {
    margin-top: var(--spacing-8, 32px);
  }

  .mb-0 {
    margin-bottom: 0;
  }
  .mb-1 {
    margin-bottom: var(--spacing-1, 4px);
  }
  .mb-2 {
    margin-bottom: var(--spacing-2, 8px);
  }
  .mb-4 {
    margin-bottom: var(--spacing-4, 16px);
  }
  .mb-6 {
    margin-bottom: var(--spacing-6, 24px);
  }
  .mb-8 {
    margin-bottom: var(--spacing-8, 32px);
  }

  /* Padding */
  .p-0 {
    padding: 0;
  }
  .p-1 {
    padding: var(--spacing-1, 4px);
  }
  .p-2 {
    padding: var(--spacing-2, 8px);
  }
  .p-3 {
    padding: var(--spacing-3, 12px);
  }
  .p-4 {
    padding: var(--spacing-4, 16px);
  }
  .p-6 {
    padding: var(--spacing-6, 24px);
  }
  .p-8 {
    padding: var(--spacing-8, 32px);
  }

  .px-2 {
    padding-left: var(--spacing-2, 8px);
    padding-right: var(--spacing-2, 8px);
  }
  .px-4 {
    padding-left: var(--spacing-4, 16px);
    padding-right: var(--spacing-4, 16px);
  }
  .px-6 {
    padding-left: var(--spacing-6, 24px);
    padding-right: var(--spacing-6, 24px);
  }

  .py-2 {
    padding-top: var(--spacing-2, 8px);
    padding-bottom: var(--spacing-2, 8px);
  }
  .py-4 {
    padding-top: var(--spacing-4, 16px);
    padding-bottom: var(--spacing-4, 16px);
  }
  .py-6 {
    padding-top: var(--spacing-6, 24px);
    padding-bottom: var(--spacing-6, 24px);
  }

  /* =====================================================
     TEXT UTILITIES
     ===================================================== */

  .text-left {
    text-align: left;
  }
  .text-center {
    text-align: center;
  }
  .text-right {
    text-align: right;
  }
  .text-justify {
    text-align: justify;
  }

  .font-light {
    font-weight: var(--font-weight-light, 300);
  }
  .font-normal {
    font-weight: var(--font-weight-regular, 400);
  }
  .font-medium {
    font-weight: var(--font-weight-medium, 500);
  }
  .font-semibold {
    font-weight: var(--font-weight-semibold, 600);
  }
  .font-bold {
    font-weight: var(--font-weight-bold, 700);
  }

  .truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* =====================================================
     MOBILE OPTIMIZATIONS
     ===================================================== */

  /* Touch-friendly spacing */
  @media (max-width: 768px) {
    .touch-spacing {
      padding: var(--spacing-4, 16px);
      margin: var(--spacing-2, 8px) 0;
    }

    /* Larger touch targets on mobile */
    button,
    a.button,
    [role='button'] {
      min-height: var(--touch-target-min-size, 48px);
      padding: var(--spacing-3, 12px) var(--spacing-4, 16px);
    }

    /* Reduce font sizes slightly on very small screens */
    h1 {
      font-size: var(--type-headline-medium-size, 28px);
    }
    h2 {
      font-size: var(--type-headline-small-size, 24px);
    }
    h3 {
      font-size: var(--type-title-large-size, 22px);
    }
  }

  /* Safe area insets for notched devices */
  @supports (padding: max(0px)) {
    .safe-area-inset {
      padding-top: max(var(--spacing-4, 16px), var(--safe-area-inset-top, 0));
      padding-right: max(
        var(--spacing-4, 16px),
        var(--safe-area-inset-right, 0)
      );
      padding-bottom: max(
        var(--spacing-4, 16px),
        var(--safe-area-inset-bottom, 0)
      );
      padding-left: max(var(--spacing-4, 16px), var(--safe-area-inset-left, 0));
    }
  }

  /* =====================================================
     ORIENTATION HANDLING
     ===================================================== */

  @media (orientation: landscape) {
    .landscape\\:flex-row {
      flex-direction: row;
    }
    .landscape\\:grid-cols-2 {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (orientation: portrait) {
    .portrait\\:flex-col {
      flex-direction: column;
    }
    .portrait\\:grid-cols-1 {
      grid-template-columns: repeat(1, minmax(0, 1fr));
    }
  }

  /* =====================================================
     HOVER STATES (Disable on touch devices)
     ===================================================== */

  @media (hover: hover) and (pointer: fine) {
    .hover\\:opacity-80:hover {
      opacity: 0.8;
    }
    .hover\\:scale-105:hover {
      transform: scale(1.05);
    }
    .hover\\:shadow-lg:hover {
      box-shadow: var(--elevation-3);
    }
  }

  /* =====================================================
     PRINT STYLES
     ===================================================== */

  @media print {
    .print\\:hidden {
      display: none !important;
    }
    .print\\:block {
      display: block !important;
    }

    /* Remove backgrounds and shadows for print */
    * {
      background: none !important;
      box-shadow: none !important;
    }

    /* Ensure text is black */
    body {
      color: #000 !important;
    }

    /* Page breaks */
    .page-break-before {
      page-break-before: always;
    }
    .page-break-after {
      page-break-after: always;
    }
    .page-break-inside-avoid {
      page-break-inside: avoid;
    }
  }
`

/* eslint-disable max-classes-per-file */
/**
 * Responsive Breakpoint Utilities
 *
 * Provides utilities for working with responsive breakpoints,
 * matching the breakpoints used in Gramps Web's design system.
 */

/**
 * Breakpoint utilities (Tailwind style)
 */
export const BREAKPOINTS = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}

/**
 * Standard breakpoints (Phase 10 style)
 */
export const Breakpoints = {
  mobile: 768,
  tablet: 992,
  desktop: 1200,
}

/**
 * Get current breakpoint (Phase 10)
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
 * Get current active screen size (Tailwind style)
 * @returns {string} Current breakpoint name (xs, sm, md, lg, xl, 2xl)
 */
export function getScreenSize() {
  const width = window.innerWidth
  if (width >= BREAKPOINTS['2xl']) return '2xl'
  if (width >= BREAKPOINTS.xl) return 'xl'
  if (width >= BREAKPOINTS.lg) return 'lg'
  if (width >= BREAKPOINTS.md) return 'md'
  if (width >= BREAKPOINTS.sm) return 'sm'
  return 'xs'
}

/**
 * Check if current viewport matches a breakpoint (Tailwind style)
 * @param {string} breakpoint - Breakpoint name (xs, sm, md, lg, xl, 2xl)
 * @returns {boolean}
 */
export function matchesScreenSize(breakpoint) {
  const width = BREAKPOINTS[breakpoint]
  if (!width) return false
  return window.matchMedia(`(min-width: ${width}px)`).matches
}

/**
 * Check if current viewport matches a breakpoint (Phase 10)
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
 * Check if device is mobile (Tailwind style)
 * @returns {boolean}
 */
export function isMobile() {
  return window.innerWidth < BREAKPOINTS.md
}

/**
 * Check if device is tablet (Tailwind style)
 * @returns {boolean}
 */
export function isTablet() {
  const width = window.innerWidth
  return width >= BREAKPOINTS.md && width < BREAKPOINTS.lg
}

/**
 * Check if device is desktop (Tailwind style)
 * @returns {boolean}
 */
export function isDesktop() {
  return window.innerWidth >= BREAKPOINTS.lg
}

/**
 * Check if viewport is mobile or smaller (Phase 10)
 * @returns {boolean}
 */
export function isMobileViewport() {
  return window.innerWidth < Breakpoints.mobile
}

/**
 * Check if viewport is tablet or smaller (Phase 10)
 * @returns {boolean}
 */
export function isTabletViewport() {
  return window.innerWidth < Breakpoints.tablet
}

/**
 * Check if viewport is desktop or larger (Phase 10)
 * @returns {boolean}
 */
export function isDesktopViewport() {
  return window.innerWidth >= Breakpoints.desktop
}

/**
 * Check if device has touch capability
 * @returns {boolean}
 */
export function isTouchDevice() {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  )
}

/**
 * Get viewport dimensions
 * @returns {Object} { width, height }
 */
export function getViewportSize() {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  }
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
 * Watch for breakpoint changes (Phase 10)
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
 * Create a media query listener
 * @param {string} query - Media query string
 * @param {Function} callback - Callback when query matches/unmmatches
 * @returns {Function} Cleanup function
 */
export function onMediaQuery(query, callback) {
  const mediaQuery = window.matchMedia(query)

  // Call immediately with current state
  callback(mediaQuery.matches)

  // Listen for changes
  const listener = e => callback(e.matches)

  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', listener)
    return () => mediaQuery.removeEventListener('change', listener)
  }
  // Fallback for older browsers
  mediaQuery.addListener(listener)
  return () => mediaQuery.removeListener(listener)
}

/**
 * Watch for screen size changes (Tailwind style)
 * @param {Function} callback - Called with breakpoint name when it changes
 * @returns {Function} Cleanup function
 */
export function watchScreenSize(callback) {
  let currentBreakpoint = getScreenSize()

  function checkBreakpoint() {
    const newBreakpoint = getScreenSize()
    if (newBreakpoint !== currentBreakpoint) {
      currentBreakpoint = newBreakpoint
      callback(newBreakpoint)
    }
  }

  window.addEventListener('resize', checkBreakpoint)

  // Call immediately
  callback(currentBreakpoint)

  return () => window.removeEventListener('resize', checkBreakpoint)
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
 * Debounce function for resize events
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 250) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
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
 * Throttle function for scroll events
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in ms
 * @returns {Function} Throttled function
 */
export function throttle(func, limit = 250) {
  let inThrottle
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * Lock body scroll (useful for modals)
 */
export function lockScroll() {
  const scrollBarWidth =
    window.innerWidth - document.documentElement.clientWidth
  document.body.style.overflow = 'hidden'
  document.body.style.paddingRight = `${scrollBarWidth}px`
}

/**
 * Unlock body scroll
 */
export function unlockScroll() {
  document.body.style.overflow = ''
  document.body.style.paddingRight = ''
}

/**
 * Smooth scroll to element
 * @param {string|HTMLElement} target - Element or selector
 * @param {Object} options - Scroll options
 */
export function scrollToElement(target, options = {}) {
  const element =
    typeof target === 'string' ? document.querySelector(target) : target

  if (!element) return

  const defaultOptions = {
    behavior: 'smooth',
    block: 'start',
    inline: 'nearest',
    ...options,
  }

  element.scrollIntoView(defaultOptions)
}

/**
 * Get scroll position
 * @returns {Object} { x, y }
 */
export function getScrollPosition() {
  return {
    x: window.pageXOffset || document.documentElement.scrollLeft,
    y: window.pageYOffset || document.documentElement.scrollTop,
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
