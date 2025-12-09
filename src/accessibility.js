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
 * Announce a message to screen readers
 * @param {string} message - The message to announce
 * @param {string} priority - 'polite' or 'assertive'
 */
export function announceToScreenReader(message, priority = 'polite') {
  const liveRegion = document.querySelector(`[aria-live="${priority}"]`)
  if (liveRegion) {
    liveRegion.textContent = message
    // Clear after announcement
    setTimeout(() => {
      liveRegion.textContent = ''
    }, 1000)
  }
}

/**
 * Trap focus within a container (for modals/dialogs)
 * @param {HTMLElement} container - The container element
 * @returns {Function} Cleanup function to remove listeners
 */
export function trapFocus(container) {
  const focusableElements = container.querySelectorAll(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )
  const firstFocusable = focusableElements[0]
  const lastFocusable = focusableElements[focusableElements.length - 1]

  function handleTab(e) {
    if (e.key !== 'Tab') return

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstFocusable) {
        e.preventDefault()
        lastFocusable.focus()
      }
    } else if (document.activeElement === lastFocusable) {
      // Tab
      e.preventDefault()
      firstFocusable.focus()
    }
  }

  container.addEventListener('keydown', handleTab)

  // Focus first element
  firstFocusable?.focus()

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleTab)
  }
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
 * Create a skip navigation link
 * @param {string} targetId - The ID of the main content
 * @param {string} text - The text for the skip link
 * @returns {HTMLElement}
 */
export function createSkipLink(targetId, text = 'Skip to main content') {
  const skipLink = document.createElement('a')
  skipLink.href = `#${targetId}`
  skipLink.className = 'skip-link'
  skipLink.textContent = text
  skipLink.addEventListener('click', e => {
    e.preventDefault()
    const target = document.getElementById(targetId)
    if (target) {
      target.focus()
      target.scrollIntoView({behavior: 'smooth'})
    }
  })
  return skipLink
}

/**
 * Set up live region for announcements
 * @param {string} priority - 'polite' or 'assertive'
 * @returns {HTMLElement}
 */
export function createLiveRegion(priority = 'polite') {
  const existing = document.querySelector(`[aria-live="${priority}"]`)
  if (existing) return existing

  const liveRegion = document.createElement('div')
  liveRegion.setAttribute('aria-live', priority)
  liveRegion.setAttribute('aria-atomic', 'true')
  liveRegion.className = 'sr-only'
  document.body.appendChild(liveRegion)
  return liveRegion
}

/**
 * Initialize accessibility features
 * Call this on app startup
 */
export function initAccessibility() {
  // Set up keyboard navigation detection
  initKeyboardNavDetection()

  // Create live regions
  createLiveRegion('polite')
  createLiveRegion('assertive')

  // Add skip link to main content
  const skipLink = createSkipLink('main-content')
  document.body.insertBefore(skipLink, document.body.firstChild)

  // Announce page loads to screen readers
  announceToScreenReader('Page loaded', 'polite')
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
