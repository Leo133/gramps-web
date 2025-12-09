/**
 * Design Tokens and Utilities for Gramps Web
 *
 * This module provides utilities for working with the Gramps Web design system,
 * including color tokens, spacing, typography, and theme utilities.
 */

/**
 * Get the computed value of a CSS custom property
 * @param {string} propertyName - CSS custom property name (with or without --)
 * @returns {string} The computed value
 */
export function getDesignToken(propertyName) {
  const prop = propertyName.startsWith('--')
    ? propertyName
    : `--${propertyName}`
  return getComputedStyle(document.documentElement)
    .getPropertyValue(prop)
    .trim()
}

/**
 * Set a CSS custom property on the root element
 * @param {string} propertyName - CSS custom property name (with or without --)
 * @param {string} value - The value to set
 */
export function setDesignToken(propertyName, value) {
  const prop = propertyName.startsWith('--')
    ? propertyName
    : `--${propertyName}`
  document.documentElement.style.setProperty(prop, value)
}

/**
 * Design token categories for easy reference
 */
export const DesignTokens = {
  // Primary colors
  colors: {
    primary: 'md-sys-color-primary',
    onPrimary: 'md-sys-color-on-primary',
    primaryContainer: 'md-sys-color-primary-container',
    onPrimaryContainer: 'md-sys-color-on-primary-container',
    secondary: 'md-sys-color-secondary',
    onSecondary: 'md-sys-color-on-secondary',
    secondaryContainer: 'md-sys-color-secondary-container',
    onSecondaryContainer: 'md-sys-color-on-secondary-container',
    tertiary: 'md-sys-color-tertiary',
    onTertiary: 'md-sys-color-on-tertiary',
    tertiaryContainer: 'md-sys-color-tertiary-container',
    onTertiaryContainer: 'md-sys-color-on-tertiary-container',
    error: 'md-sys-color-error',
    onError: 'md-sys-color-on-error',
    errorContainer: 'md-sys-color-error-container',
    onErrorContainer: 'md-sys-color-on-error-container',
    background: 'md-sys-color-background',
    onBackground: 'md-sys-color-on-background',
    surface: 'md-sys-color-surface',
    onSurface: 'md-sys-color-on-surface',
    surfaceVariant: 'md-sys-color-surface-variant',
    onSurfaceVariant: 'md-sys-color-on-surface-variant',
    outline: 'md-sys-color-outline',
    outlineVariant: 'md-sys-color-outline-variant',
  },

  // Surface elevation colors
  surfaces: {
    containerLowest: 'md-sys-color-surface-container-lowest',
    containerLow: 'md-sys-color-surface-container-low',
    container: 'md-sys-color-surface-container',
    containerHigh: 'md-sys-color-surface-container-high',
    containerHighest: 'md-sys-color-surface-container-highest',
  },

  // Typography
  typography: {
    bodyFont: 'grampsjs-body-font-family',
    headingFont: 'grampsjs-heading-font-family',
    bodySize: 'grampsjs-body-font-size',
    bodyWeight: 'grampsjs-body-font-weight',
  },

  // Spacing
  spacing: {
    listLeading: 'md-list-item-leading-space',
    listTrailing: 'md-list-item-trailing-space',
    listSide: 'mdc-list-side-padding',
  },

  // Application-specific colors
  app: {
    colorBoy: 'color-boy',
    colorGirl: 'color-girl',
    linkFont: 'grampsjs-color-link-font',
    linkHover: 'grampsjs-color-link-hover',
    mapMarker: 'grampsjs-map-marker-color',
  },
}

/**
 * Get a color token value
 * @param {string} colorName - Name from DesignTokens.colors
 * @returns {string} The color value
 */
export function getColor(colorName) {
  const token = DesignTokens.colors[colorName]
  if (!token) {
    return ''
  }
  return getDesignToken(token)
}

/**
 * Get a surface color token value
 * @param {string} surfaceName - Name from DesignTokens.surfaces
 * @returns {string} The color value
 */
export function getSurface(surfaceName) {
  const token = DesignTokens.surfaces[surfaceName]
  if (!token) {
    return ''
  }
  return getDesignToken(token)
}

/**
 * Opacity scale helper
 * @param {number} opacity - Opacity value (0-100)
 * @returns {string} The CSS custom property name
 */
export function getOpacityToken(opacity) {
  // Round to nearest valid opacity value
  const validOpacities = [
    0, 2, 5, 6, 10, 15, 20, 25, 30, 35, 38, 40, 45, 48, 50, 60, 70, 75, 78, 87,
    90, 100,
  ]
  const nearest = validOpacities.reduce((prev, curr) =>
    Math.abs(curr - opacity) < Math.abs(prev - opacity) ? curr : prev
  )
  return `grampsjs-body-font-color-${nearest}`
}

/**
 * Shade scale helper (for grays)
 * @param {number} shade - Shade value (40, 120, 200, 220, 230, 240, 255)
 * @returns {string} The CSS custom property name
 */
export function getShadeToken(shade) {
  const validShades = [40, 120, 200, 220, 230, 240, 255]
  const nearest = validShades.reduce((prev, curr) =>
    Math.abs(curr - shade) < Math.abs(prev - shade) ? curr : prev
  )
  return `grampsjs-color-shade-${nearest}`
}

/**
 * Create a custom theme by overriding design tokens
 * @param {Object} tokens - Object with token overrides
 * @example
 * applyCustomTheme({
 *   'md-sys-color-primary': 'rgb(150, 100, 80)',
 *   'grampsjs-body-font-size': '18px'
 * })
 */
export function applyCustomTheme(tokens) {
  Object.entries(tokens).forEach(([key, value]) => {
    setDesignToken(key, value)
  })
}

/**
 * Reset design tokens to theme defaults
 */
export function resetDesignTokens() {
  // Remove custom properties from inline styles
  const root = document.documentElement
  const {style} = root
  const customProps = []

  // Collect all custom properties
  for (let i = 0; i < style.length; i += 1) {
    const prop = style[i]
    if (prop.startsWith('--')) {
      customProps.push(prop)
    }
  }

  // Remove them
  customProps.forEach(prop => {
    style.removeProperty(prop)
  })
}

/**
 * Export current theme as JSON
 * @returns {Object} Current theme tokens
 */
export function exportTheme() {
  const tokens = {}
  const styles = getComputedStyle(document.documentElement)

  // Get all CSS custom properties
  for (let i = 0; i < styles.length; i += 1) {
    const prop = styles[i]
    if (prop.startsWith('--')) {
      tokens[prop] = styles.getPropertyValue(prop).trim()
    }
  }

  return tokens
}

/**
 * Import and apply a theme from JSON
 * @param {Object} themeData - Theme tokens object
 */
export function importTheme(themeData) {
  applyCustomTheme(themeData)
}

/**
 * Accessibility: Check color contrast ratio
 * @param {string} foreground - Foreground color (CSS color value)
 * @param {string} background - Background color (CSS color value)
 * @returns {number} Contrast ratio
 */
export function getContrastRatio(foreground, background) {
  // Helper to get luminance
  const getLuminance = colorStr => {
    // Parse color string to RGB
    const temp = document.createElement('div')
    temp.style.color = colorStr
    document.body.appendChild(temp)
    const rgb = getComputedStyle(temp).color.match(/\d+/g).map(Number)
    document.body.removeChild(temp)

    const [r, g, b] = rgb.map(val => {
      const sRGB = val / 255
      return sRGB <= 0.03928 ? sRGB / 12.92 : ((sRGB + 0.055) / 1.055) ** 2.4
    })

    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }

  const l1 = getLuminance(foreground)
  const l2 = getLuminance(background)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)

  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Check if a color combination meets WCAG AA standards
 * @param {string} foreground - Foreground color
 * @param {string} background - Background color
 * @param {boolean} isLargeText - Whether text is large (18pt+ or 14pt+ bold)
 * @returns {Object} Compliance results
 */
export function checkWCAGCompliance(
  foreground,
  background,
  isLargeText = false
) {
  const ratio = getContrastRatio(foreground, background)
  const minRatioAA = isLargeText ? 3 : 4.5
  const minRatioAAA = isLargeText ? 4.5 : 7

  return {
    ratio: ratio.toFixed(2),
    passAA: ratio >= minRatioAA,
    passAAA: ratio >= minRatioAAA,
    isLargeText,
  }
}
