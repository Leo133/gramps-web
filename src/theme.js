/* eslint-disable no-use-before-define */
/**
 * Theme Management System for Gramps Web
 *
 * Provides utilities for managing light, dark, and system themes with
 * smooth transitions and preference persistence.
 */

let systemThemeListener = null

/**
 * Get the system's preferred color scheme
 * @returns {string} 'dark' or 'light'
 */
export function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

/**
 * Resolve the current theme based on user preference
 * @param {string} theme - 'light', 'dark', or 'system'
 * @returns {string} 'dark' or 'light'
 */
export function getCurrentTheme(theme) {
  return theme === undefined || theme === 'system' ? getSystemTheme() : theme
}

/**
 * Store theme preference in localStorage
 * @param {string} theme - Theme preference to store
 */
export function storeThemePreference(theme) {
  try {
    localStorage.setItem('gramps-theme-preference', theme)
  } catch {
    // Silently fail if localStorage is not available
  }
}

/**
 * Load theme preference from localStorage
 * @returns {string|null} Stored theme preference or null
 */
export function loadThemePreference() {
  try {
    return localStorage.getItem('gramps-theme-preference')
  } catch {
    return null
  }
}

/**
 * Set up listener for system theme changes
 */
export function setupSystemThemeListener() {
  // Remove existing listener if any
  if (systemThemeListener) {
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .removeEventListener('change', systemThemeListener)
  }

  // Create new listener
  systemThemeListener = () => {
    const currentPreference = loadThemePreference()
    // Only auto-switch if user has 'system' preference
    if (currentPreference === 'system' || !currentPreference) {
      applyTheme('system', true)
    }
  }

  // Add listener
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', systemThemeListener)
}

/**
 * Apply theme with optional transition animation
 * @param {string} theme - 'light', 'dark', or 'system'
 * @param {boolean} withTransition - Enable smooth transition (default: true)
 */
export function applyTheme(theme, withTransition = true) {
  const resolvedTheme = getCurrentTheme(theme)
  const root = document.documentElement

  // Add transition class for smooth theme switching
  if (withTransition) {
    root.classList.add('theme-transition')
  }

  root.setAttribute('data-theme', resolvedTheme)

  // Remove transition class after animation completes
  if (withTransition) {
    setTimeout(() => {
      root.classList.remove('theme-transition')
    }, 300)
  }

  // Store preference in localStorage for persistence
  storeThemePreference(theme)

  // Dispatch custom event for theme change
  window.dispatchEvent(
    new CustomEvent('theme-changed', {
      detail: {theme, resolvedTheme},
    })
  )
}

/**
 * Initialize theme system with preference detection
 * @returns {string} The initialized theme
 */
export function initializeTheme() {
  // Load stored preference or default to 'system'
  const storedTheme = loadThemePreference() || 'system'

  // Apply theme without transition on initial load
  applyTheme(storedTheme, false)

  // Listen for system theme changes when in 'system' mode
  setupSystemThemeListener()

  return storedTheme
}

/**
 * Get the opposite theme (for theme toggle)
 * @param {string} currentTheme - Current theme ('light' or 'dark')
 * @returns {string} Opposite theme
 */
export function getOppositeTheme(currentTheme) {
  const resolved = getCurrentTheme(currentTheme)
  return resolved === 'dark' ? 'light' : 'dark'
}

/**
 * Toggle between light and dark themes
 * @returns {string} New theme
 */
export function toggleTheme() {
  const currentPreference = loadThemePreference() || 'system'
  const currentResolved = getCurrentTheme(currentPreference)
  const newTheme = currentResolved === 'dark' ? 'light' : 'dark'
  applyTheme(newTheme)
  return newTheme
}

/**
 * Check if high contrast is preferred by the system
 * @returns {boolean}
 */
export function isHighContrastPreferred() {
  return window.matchMedia('(prefers-contrast: more)').matches
}

/**
 * Check if reduced motion is preferred by the system
 * @returns {boolean}
 */
export function isReducedMotionPreferred() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
