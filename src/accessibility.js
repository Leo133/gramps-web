/**
 * Accessibility Utilities for Gramps Web
 *
 * Phase 10: UI/UX Overhaul - Accessibility (WCAG 2.1 AA Compliance)
 *
 * This module provides utilities and helpers for ensuring accessibility
 * across the Gramps Web application.
 */

import {css} from 'lit'

/**
 * Accessibility-focused CSS utilities
 */
export const a11yStyles = css`
  /* =====================================================
     FOCUS MANAGEMENT
     ===================================================== */

  /* Ensure all interactive elements have visible focus indicators */
  .focusable:focus {
    outline: var(--focus-ring-width, 2px) solid
      var(--focus-ring-color, var(--md-sys-color-primary));
    outline-offset: var(--focus-ring-offset, 2px);
  }

  /* Enhanced focus for keyboard navigation */
  .focus-visible:focus-visible {
    outline: var(--focus-ring-width, 2px) solid
      var(--focus-ring-color, var(--md-sys-color-primary));
    outline-offset: var(--focus-ring-offset, 2px);
    box-shadow: var(--focus-ring);
  }

  /* Remove focus styles when not using keyboard */
  .focus-visible:focus:not(:focus-visible) {
    outline: none;
    box-shadow: none;
  }

  /* =====================================================
     SKIP NAVIGATION
     ===================================================== */

  .skip-link {
    position: absolute;
    top: -40px;
    left: 0;
    background: var(--md-sys-color-primary);
    color: var(--md-sys-color-on-primary);
    padding: var(--spacing-3, 12px) var(--spacing-4, 16px);
    text-decoration: none;
    z-index: var(--z-index-top, 9999);
    border-radius: 0 0 var(--radius-sm, 4px) 0;
    font-weight: var(--font-weight-medium, 500);
    transition: top 0.2s;
  }

  .skip-link:focus {
    top: 0;
    outline: var(--focus-ring-width, 2px) solid var(--md-sys-color-on-primary);
    outline-offset: -2px;
  }

  /* =====================================================
     SCREEN READER UTILITIES
     ===================================================== */

  /* Visually hide content but keep it accessible to screen readers */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  /* Make screen-reader-only content visible on focus */
  .sr-only-focusable:focus,
  .sr-only-focusable:active {
    position: static;
    width: auto;
    height: auto;
    overflow: visible;
    clip: auto;
    white-space: normal;
  }

  /* =====================================================
     COLOR CONTRAST
     Ensure sufficient contrast for text readability
     ===================================================== */

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    :host {
      --input-border-width: var(--high-contrast-border-width, 2px);
      --button-border-width: var(--high-contrast-border-width, 2px);
    }

    .text-primary {
      color: var(--md-sys-color-on-background);
    }

    .border {
      border-width: var(--high-contrast-border-width, 2px) !important;
    }
  }

  /* =====================================================
     TOUCH TARGETS
     Ensure minimum touch target size (48x48px) for WCAG AA
     ===================================================== */

  .touch-target {
    min-width: var(--touch-target-min-size, 48px);
    min-height: var(--touch-target-min-size, 48px);
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  /* Ensure buttons meet minimum touch target size */
  button,
  a.button,
  .clickable {
    min-width: var(--touch-target-min-size, 48px);
    min-height: var(--touch-target-min-size, 48px);
  }

  /* =====================================================
     REDUCED MOTION
     Respect user's motion preferences
     ===================================================== */

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }

  /* =====================================================
     KEYBOARD NAVIGATION
     ===================================================== */

  /* Ensure tab order is logical */
  .tab-trap {
    position: relative;
  }

  /* Visual indicator for keyboard navigation mode */
  body.keyboard-nav *:focus {
    outline: var(--focus-ring-width, 2px) solid
      var(--focus-ring-color, var(--md-sys-color-primary));
    outline-offset: var(--focus-ring-offset, 2px);
  }

  /* =====================================================
     SEMANTIC REGIONS
     ===================================================== */

  /* Ensure main content regions are properly labeled */
  [role='main'],
  [role='navigation'],
  [role='complementary'],
  [role='contentinfo'] {
    position: relative;
  }

  /* =====================================================
     ARIA LIVE REGIONS
     ===================================================== */

  .live-region-polite {
    position: absolute;
    left: -10000px;
    width: 1px;
    height: 1px;
    overflow: hidden;
  }

  [aria-live='polite'],
  [aria-live='assertive'] {
    position: absolute;
    left: -10000px;
    width: 1px;
    height: 1px;
    overflow: hidden;
  }

  /* =====================================================
     TOOLTIPS & HINTS
     ===================================================== */

  /* Ensure tooltips are accessible */
  [role='tooltip'] {
    position: absolute;
    z-index: var(--z-index-tooltip, 1070);
    max-width: 300px;
  }

  /* =====================================================
     LINK ACCESSIBILITY
     ===================================================== */

  /* Ensure links are distinguishable */
  a {
    text-decoration-thickness: 1px;
    text-underline-offset: 0.2em;
  }

  a:hover,
  a:focus {
    text-decoration: underline;
    text-decoration-thickness: 2px;
  }

  /* External links indicator */
  a[target='_blank']::after {
    content: ' (opens in new window)';
    position: absolute;
    left: -10000px;
  }

  /* =====================================================
     FORM ACCESSIBILITY
     ===================================================== */

  /* Ensure form labels are properly associated */
  label {
    cursor: pointer;
  }

  /* Required field indicator */
  [required]::after,
  [aria-required='true']::after {
    content: ' *';
    color: var(--md-sys-color-error);
  }

  /* Error state styling */
  [aria-invalid='true'] {
    border-color: var(--md-sys-color-error);
  }

  /* Error message styling */
  .error-message {
    color: var(--md-sys-color-error);
    font-size: var(--type-body-small-size, 12px);
    margin-top: var(--spacing-1, 4px);
  }

  /* =====================================================
     TABLE ACCESSIBILITY
     ===================================================== */

  /* Ensure table headers are properly marked */
  table {
    border-collapse: collapse;
  }

  th {
    text-align: left;
    font-weight: var(--font-weight-semibold, 600);
  }

  /* Zebra striping for better readability */
  tbody tr:nth-child(even) {
    background-color: var(--md-sys-color-surface-container-low);
  }

  /* =====================================================
     LOADING & PROGRESS STATES
     ===================================================== */

  /* Ensure loading states are announced to screen readers */
  [aria-busy='true'] {
    position: relative;
  }

  /* =====================================================
     MOBILE ACCESSIBILITY
     ===================================================== */

  /* Prevent horizontal scrolling */
  .no-scroll {
    overflow-x: hidden;
  }

  /* Tap highlight color */
  * {
    -webkit-tap-highlight-color: var(--mobile-tap-highlight-color, transparent);
  }

  /* =====================================================
     PRINT ACCESSIBILITY
     ===================================================== */

  @media print {
    /* Hide non-essential elements when printing */
    .no-print {
      display: none !important;
    }

    /* Ensure links are visible */
    a[href]::after {
      content: ' (' attr(href) ')';
    }

    /* Expand collapsed sections */
    details {
      display: block;
    }

    summary {
      display: block;
    }
  }
`

/**
 * Live region for screen reader announcements
 */
let liveRegion = null

/**
 * Create or get the live region for announcements
 * @returns {HTMLElement}
 */
function getLiveRegion() {
  if (!liveRegion) {
    liveRegion = document.getElementById('a11y-live-region')

    if (!liveRegion) {
      liveRegion = document.createElement('div')
      liveRegion.id = 'a11y-live-region'
      liveRegion.setAttribute('role', 'status')
      liveRegion.setAttribute('aria-live', 'polite')
      liveRegion.setAttribute('aria-atomic', 'true')
      liveRegion.style.cssText = `
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
      `
      document.body.appendChild(liveRegion)
    }
  }

  return liveRegion
}

/**
 * Announce message to screen readers
 * @param {string} message - Message to announce
 * @param {string} priority - 'polite' or 'assertive' (default: 'polite')
 */
export function announceToScreenReader(message, priority = 'polite') {
  const region = getLiveRegion()
  region.setAttribute('aria-live', priority)

  // Clear and set message (triggering announcement)
  region.textContent = ''
  setTimeout(() => {
    region.textContent = message
  }, 100)
}

/**
 * Create skip navigation link
 * @param {string} targetId - ID of main content area
 * @param {string} label - Link text (default: 'Skip to main content')
 */
export function createSkipLink(
  targetId = 'main-content',
  label = 'Skip to main content'
) {
  const skipLink = document.createElement('a')
  skipLink.href = `#${targetId}`
  skipLink.className = 'skip-link'
  skipLink.textContent = label
  skipLink.setAttribute('tabindex', '0')

  // Style the skip link (hidden until focused)
  // Note: We also have .skip-link in a11yStyles, but this ensures it works standalone
  skipLink.style.cssText = `
    position: absolute;
    top: -40px;
    left: 0;
    background: var(--md-sys-color-primary);
    color: var(--md-sys-color-on-primary);
    padding: 8px 16px;
    text-decoration: none;
    z-index: 10000;
    transition: top 0.2s;
  `

  skipLink.addEventListener('focus', () => {
    skipLink.style.top = '0'
  })

  skipLink.addEventListener('blur', () => {
    skipLink.style.top = '-40px'
  })

  skipLink.addEventListener('click', e => {
    e.preventDefault()
    const target = document.getElementById(targetId)
    if (target) {
      target.focus()
      target.scrollIntoView({behavior: 'smooth'})
    }
  })

  // Insert at the beginning of body
  if (document.body.firstChild) {
    document.body.insertBefore(skipLink, document.body.firstChild)
  } else {
    document.body.appendChild(skipLink)
  }

  return skipLink
}

/**
 * Set up live region for announcements (Alias for getLiveRegion for backward compatibility)
 * @param {string} priority - 'polite' or 'assertive'
 * @returns {HTMLElement}
 */
export function createLiveRegion(priority = 'polite') {
  const region = getLiveRegion()
  region.setAttribute('aria-live', priority)
  return region
}

/**
 * Focus trap for modals and dialogs
 */
export class FocusTrap {
  constructor(element) {
    this.element = element
    this.focusableElements = []
    this.previouslyFocused = null
  }

  /**
   * Get all focusable elements within container
   */
  getFocusableElements() {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      'mwc-button:not([disabled])',
      'mwc-icon-button:not([disabled])',
      'md-filled-button:not([disabled])',
      'md-outlined-button:not([disabled])',
      'md-text-button:not([disabled])',
    ].join(',')

    return Array.from(this.element.querySelectorAll(focusableSelectors)).filter(
      el => el.offsetParent !== null
    ) // Exclude hidden elements
  }

  /**
   * Activate focus trap
   */
  activate() {
    this.previouslyFocused = document.activeElement
    this.focusableElements = this.getFocusableElements()

    if (this.focusableElements.length > 0) {
      this.focusableElements[0].focus()
    }

    this.element.addEventListener('keydown', this.handleKeyDown)
  }

  /**
   * Deactivate focus trap
   */
  deactivate() {
    this.element.removeEventListener('keydown', this.handleKeyDown)

    if (this.previouslyFocused && this.previouslyFocused.focus) {
      this.previouslyFocused.focus()
    }
  }

  /**
   * Handle Tab key navigation
   */
  handleKeyDown = e => {
    if (e.key !== 'Tab') return

    const firstElement = this.focusableElements[0]
    const lastElement =
      this.focusableElements[this.focusableElements.length - 1]

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault()
        lastElement.focus()
      }
    } else if (document.activeElement === lastElement) {
      // Tab
      e.preventDefault()
      firstElement.focus()
    }
  }
}

/**
 * Create focus trap for an element
 * @param {HTMLElement} element - Container element
 * @returns {FocusTrap}
 */
export function createFocusTrap(element) {
  return new FocusTrap(element)
}

/**
 * Trap focus within a container (Legacy wrapper)
 * @param {HTMLElement} container - The container element
 * @returns {Function} Cleanup function to remove listeners
 */
export function trapFocus(container) {
  const trap = new FocusTrap(container)
  trap.activate()
  return () => trap.deactivate()
}

/**
 * Manage focus for single-page app navigation
 * @param {HTMLElement} element - Element to focus after navigation
 * @param {string} message - Optional announcement message
 */
export function manageFocus(element, message) {
  if (!element) return

  // Make element focusable if needed
  if (!element.hasAttribute('tabindex')) {
    element.setAttribute('tabindex', '-1')
  }

  // Focus element
  element.focus()

  // Announce navigation if message provided
  if (message) {
    announceToScreenReader(message)
  }
}

/**
 * Add keyboard navigation to a list
 * @param {HTMLElement} listElement - List container
 * @param {Object} options - Navigation options
 */
export function addKeyboardNavigation(listElement, options = {}) {
  const {
    itemSelector = 'li',
    onSelect = null,
    loop = true,
    orientation = 'vertical', // 'vertical' or 'horizontal'
  } = options

  const getItems = () =>
    Array.from(listElement.querySelectorAll(itemSelector)).filter(
      el => el.offsetParent !== null
    )

  const getCurrentIndex = () => {
    const items = getItems()
    const focused = document.activeElement
    return items.indexOf(focused)
  }

  const focusItem = index => {
    const items = getItems()
    if (items[index]) {
      items[index].focus()
    }
  }

  listElement.addEventListener('keydown', e => {
    const items = getItems()
    const currentIndex = getCurrentIndex()

    if (currentIndex === -1) return

    let nextIndex = currentIndex

    if (orientation === 'vertical') {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        nextIndex = currentIndex + 1
        if (nextIndex >= items.length && loop) {
          nextIndex = 0
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        nextIndex = currentIndex - 1
        if (nextIndex < 0 && loop) {
          nextIndex = items.length - 1
        }
      }
    } else if (orientation === 'horizontal') {
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        nextIndex = currentIndex + 1
        if (nextIndex >= items.length && loop) {
          nextIndex = 0
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        nextIndex = currentIndex - 1
        if (nextIndex < 0 && loop) {
          nextIndex = items.length - 1
        }
      }
    }

    if (e.key === 'Home') {
      e.preventDefault()
      nextIndex = 0
    } else if (e.key === 'End') {
      e.preventDefault()
      nextIndex = items.length - 1
    }

    if (e.key === 'Enter' || e.key === ' ') {
      if (onSelect) {
        e.preventDefault()
        onSelect(items[currentIndex], currentIndex)
      }
    }

    if (
      nextIndex !== currentIndex &&
      nextIndex >= 0 &&
      nextIndex < items.length
    ) {
      focusItem(nextIndex)
    }
  })
}

/**
 * Check if an element is visible to screen readers
 * @param {HTMLElement} element
 * @returns {boolean}
 */
export function isVisibleToScreenReader(element) {
  if (!element) return false

  // Check aria-hidden
  if (element.getAttribute('aria-hidden') === 'true') return false

  // Check display and visibility
  const style = getComputedStyle(element)
  if (style.display === 'none' || style.visibility === 'hidden') return false

  // Check parent elements
  let parent = element.parentElement
  while (parent) {
    if (parent.getAttribute('aria-hidden') === 'true') return false
    const parentStyle = getComputedStyle(parent)
    if (parentStyle.display === 'none' || parentStyle.visibility === 'hidden')
      return false
    parent = parent.parentElement
  }

  return true
}

/**
 * Set accessible label for an element
 * @param {HTMLElement} element
 * @param {string} label
 * @param {string} type - 'label', 'labelledby', or 'describedby'
 */
export function setAccessibleLabel(element, label, type = 'label') {
  if (type === 'label') {
    element.setAttribute('aria-label', label)
  } else if (type === 'labelledby') {
    element.setAttribute('aria-labelledby', label)
  } else if (type === 'describedby') {
    element.setAttribute('aria-describedby', label)
  }
}

/**
 * Create accessible tooltip
 * @param {HTMLElement} trigger - Element that triggers tooltip
 * @param {string} text - Tooltip text
 * @returns {HTMLElement} Tooltip element
 */
export function createAccessibleTooltip(trigger, text) {
  const tooltipId = `tooltip-${Math.random().toString(36).substr(2, 9)}`

  const tooltip = document.createElement('div')
  tooltip.id = tooltipId
  tooltip.setAttribute('role', 'tooltip')
  tooltip.textContent = text
  tooltip.style.cssText = `
    position: absolute;
    z-index: 10000;
    background: var(--md-sys-color-inverse-surface);
    color: var(--md-sys-color-inverse-on-surface);
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 14px;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s;
  `

  document.body.appendChild(tooltip)

  trigger.setAttribute('aria-describedby', tooltipId)

  const show = () => {
    const rect = trigger.getBoundingClientRect()
    tooltip.style.top = `${rect.bottom + 8}px`
    tooltip.style.left = `${rect.left}px`
    tooltip.style.opacity = '1'
  }

  const hide = () => {
    tooltip.style.opacity = '0'
  }

  trigger.addEventListener('mouseenter', show)
  trigger.addEventListener('mouseleave', hide)
  trigger.addEventListener('focus', show)
  trigger.addEventListener('blur', hide)

  return tooltip
}

/**
 * Get the contrast ratio between two colors
 * Used to ensure WCAG AA compliance (4.5:1 for normal text, 3:1 for large text)
 * @param {string} color1 - First color (hex format, e.g., #RRGGBB or #RGB)
 * @param {string} color2 - Second color (hex format, e.g., #RRGGBB or #RGB)
 * @returns {number} Contrast ratio
 * @throws {Error} If colors are not valid hex format
 */
export function getContrastRatio(color1, color2) {
  function getLuminance(color) {
    // Validate hex color format
    const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
    if (!hexPattern.test(color)) {
      throw new Error(
        `Invalid hex color format: ${color}. Use #RRGGBB or #RGB format.`
      )
    }

    // Normalize 3-digit hex to 6-digit
    let hex = color.replace(/^#/, '')
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
    }

    const rgb = hex
      .match(/.{2}/g)
      .map(x => parseInt(x, 16) / 255)
      .map(x => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4))
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]
  }

  const lum1 = getLuminance(color1)
  const lum2 = getLuminance(color2)
  const lighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Check if keyboard navigation is active
 * @returns {boolean}
 */
export function isKeyboardNavigating() {
  return document.body.classList.contains('keyboard-nav')
}

/**
 * Enable keyboard navigation mode
 */
export function enableKeyboardNav() {
  document.body.classList.add('keyboard-nav')
}

/**
 * Disable keyboard navigation mode
 */
export function disableKeyboardNav() {
  document.body.classList.remove('keyboard-nav')
}

/**
 * Initialize keyboard navigation detection
 */
export function initKeyboardNavDetection() {
  let keydownTimeout = null

  // Detect keyboard usage (debounced)
  document.addEventListener('keydown', e => {
    if (e.key === 'Tab') {
      if (keydownTimeout) {
        clearTimeout(keydownTimeout)
      }
      keydownTimeout = setTimeout(() => {
        enableKeyboardNav()
      }, 50)
    }
  })

  // Detect mouse usage
  document.addEventListener('mousedown', () => {
    if (keydownTimeout) {
      clearTimeout(keydownTimeout)
    }
    disableKeyboardNav()
  })
}

/**
 * Validate ARIA attributes
 * @param {HTMLElement} element - Element to validate
 * @returns {Array} Array of validation errors
 */
export function validateAria(element) {
  const errors = []

  // Check for required ARIA attributes
  if (element.hasAttribute('role')) {
    const role = element.getAttribute('role')

    // Check role-specific requirements
    const roleRequirements = {
      button: ['aria-label', 'aria-labelledby', 'textContent'],
      checkbox: ['aria-checked'],
      radio: ['aria-checked'],
      textbox: ['aria-label', 'aria-labelledby'],
      combobox: ['aria-expanded', 'aria-controls'],
      listbox: ['aria-label', 'aria-labelledby'],
      tab: ['aria-selected', 'aria-controls'],
      tabpanel: ['aria-labelledby'],
      dialog: ['aria-label', 'aria-labelledby'],
      alertdialog: ['aria-label', 'aria-labelledby'],
    }

    if (roleRequirements[role]) {
      const hasRequiredAttr = roleRequirements[role].some(attr => {
        if (attr === 'textContent') {
          return element.textContent.trim().length > 0
        }
        return element.hasAttribute(attr)
      })

      if (!hasRequiredAttr) {
        errors.push(
          `Element with role="${role}" is missing required attributes: ${roleRequirements[
            role
          ].join(' or ')}`
        )
      }
    }
  }

  // Check for aria-labelledby references
  if (element.hasAttribute('aria-labelledby')) {
    const labelId = element.getAttribute('aria-labelledby')
    if (!document.getElementById(labelId)) {
      errors.push(`aria-labelledby references non-existent ID: ${labelId}`)
    }
  }

  // Check for aria-controls references
  if (element.hasAttribute('aria-controls')) {
    const controlsId = element.getAttribute('aria-controls')
    if (!document.getElementById(controlsId)) {
      errors.push(`aria-controls references non-existent ID: ${controlsId}`)
    }
  }

  return errors
}

/**
 * Check if an element meets WCAG color contrast requirements
 * @param {HTMLElement} element - Element to check
 * @returns {Object} { passes: boolean, ratio: number, required: number }
 */
export function checkColorContrast(element) {
  const style = window.getComputedStyle(element)
  const bgColor = style.backgroundColor
  const textColor = style.color
  const fontSize = parseFloat(style.fontSize)
  const {fontWeight} = style

  const ratio = getContrastRatio(textColor, bgColor)

  // Large text is 18pt+ or 14pt+ bold (roughly 24px+ or 19px+ bold)
  const isLargeText =
    fontSize >= 24 || (fontSize >= 19 && parseInt(fontWeight, 10) >= 700)

  // WCAG AA requires 4.5:1 for normal text, 3:1 for large text
  const requiredRatio = isLargeText ? 3 : 4.5

  return {
    passes: ratio >= requiredRatio,
    ratio: ratio.toFixed(2),
    required: requiredRatio,
    isLargeText,
  }
}

/**
 * Initialize accessibility features
 * Call this on app startup
 */
export function initAccessibility() {
  // Set up keyboard navigation detection
  initKeyboardNavDetection()

  // Create live regions (using getLiveRegion implicitly via createLiveRegion or just calling it)
  getLiveRegion()

  // Add skip link to main content (createSkipLink already appends it)
  // But we should check if it exists first to avoid duplicates if called multiple times
  if (!document.querySelector('.skip-link')) {
    createSkipLink('main-content')
  }

  // Announce page loads to screen readers
  announceToScreenReader('Page loaded', 'polite')
}

/**
 * Alias for initAccessibility (for backward compatibility with Incoming branch)
 */
export const initializeAccessibility = initAccessibility
