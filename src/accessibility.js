/**
 * Accessibility Utilities for Gramps Web
 * 
 * Provides comprehensive accessibility features including:
 * - Keyboard navigation helpers
 * - Focus management
 * - Screen reader announcements
 * - ARIA attribute helpers
 * - WCAG compliance utilities
 */

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
export function createSkipLink(targetId = 'main-content', label = 'Skip to main content') {
  const skipLink = document.createElement('a')
  skipLink.href = `#${targetId}`
  skipLink.className = 'skip-link'
  skipLink.textContent = label
  skipLink.setAttribute('tabindex', '0')
  
  // Style the skip link (hidden until focused)
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
  
  skipLink.addEventListener('click', (e) => {
    e.preventDefault()
    const target = document.getElementById(targetId)
    if (target) {
      target.focus()
      target.scrollIntoView()
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
    
    return Array.from(this.element.querySelectorAll(focusableSelectors))
      .filter(el => el.offsetParent !== null) // Exclude hidden elements
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
  handleKeyDown = (e) => {
    if (e.key !== 'Tab') return
    
    const firstElement = this.focusableElements[0]
    const lastElement = this.focusableElements[this.focusableElements.length - 1]
    
    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault()
        lastElement.focus()
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault()
        firstElement.focus()
      }
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
  
  const getItems = () => Array.from(listElement.querySelectorAll(itemSelector))
    .filter(el => el.offsetParent !== null)
  
  const getCurrentIndex = () => {
    const items = getItems()
    const focused = document.activeElement
    return items.indexOf(focused)
  }
  
  const focusItem = (index) => {
    const items = getItems()
    if (items[index]) {
      items[index].focus()
    }
  }
  
  listElement.addEventListener('keydown', (e) => {
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
    
    if (nextIndex !== currentIndex && nextIndex >= 0 && nextIndex < items.length) {
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
    if (parentStyle.display === 'none' || parentStyle.visibility === 'hidden') return false
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
 * Initialize accessibility features
 */
export function initializeAccessibility() {
  console.log('[A11y] Initializing accessibility features...')
  
  // Create skip link
  createSkipLink('main-content', 'Skip to main content')
  
  // Create live region
  getLiveRegion()
  
  // Add keyboard navigation hints
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      document.body.classList.add('keyboard-navigation')
    }
  })
  
  document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-navigation')
  })
  
  console.log('[A11y] Accessibility features initialized')
}
