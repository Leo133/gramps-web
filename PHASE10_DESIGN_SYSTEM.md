# Phase 10: Design System Documentation

## Overview

Gramps Web uses a comprehensive design system based on Material Design 3 (Material You), implemented through Material Web Components and CSS custom properties. This document provides a complete reference for developers and designers working with the Gramps Web UI.

## Design Tokens

### Color System

Gramps Web implements a full Material 3 color system with comprehensive support for light and dark themes. All colors are defined as CSS custom properties.

#### Primary Colors

The primary color palette is based on earthy tones suitable for a genealogy application:

**Light Theme:**
```css
--md-sys-color-primary: rgb(109, 76, 65)           /* Primary brown */
--md-sys-color-on-primary: rgb(255, 255, 255)      /* White text on primary */
--md-sys-color-primary-container: rgb(255, 219, 207) /* Light container */
--md-sys-color-on-primary-container: rgb(57, 12, 0)  /* Dark text on container */
```

**Dark Theme:**
```css
--md-sys-color-primary: #8d7168                    /* Lighter brown for dark mode */
--md-sys-color-on-primary: rgba(0, 0, 0, 0.8)     /* Dark text on primary */
--md-sys-color-primary-container: rgb(109, 76, 65) /* Container */
--md-sys-color-on-primary-container: rgb(235, 190, 176) /* Light text */
```

#### Secondary Colors

Secondary colors are used for complementary actions and accents:

**Light Theme:**
```css
--md-sys-color-secondary: rgb(49, 98, 141)         /* Blue */
--md-sys-color-on-secondary: rgb(255, 255, 255)
--md-sys-color-secondary-container: rgb(207, 229, 255)
--md-sys-color-on-secondary-container: rgb(0, 29, 52)
```

**Legacy Secondary (for compatibility):**
```css
--mdc-theme-secondary: #0277bd                      /* Link blue */
--mdc-theme-on-secondary: rgba(255, 255, 255, 0.95)
```

#### Surface Colors

Surface colors define the background hierarchy:

**Light Theme:**
```css
--md-sys-color-background: #fff
--md-sys-color-surface: #fff
--md-sys-color-surface-container: #fff
--md-sys-color-surface-container-low: rgb(240, 240, 240)
--md-sys-color-surface-container-high: #fff
--md-sys-color-surface-container-highest: whitesmoke
```

**Dark Theme:**
```css
--md-sys-color-background: rgb(22, 19, 18)
--md-sys-color-surface: rgb(20, 19, 19)
--md-sys-color-surface-container: rgb(32, 31, 31)
--md-sys-color-surface-container-low: rgb(28, 27, 27)
--md-sys-color-surface-container-high: rgb(42, 42, 42)
--md-sys-color-surface-container-highest: rgb(53, 52, 52)
```

#### Semantic Colors

Colors for specific UI states:

```css
--md-sys-color-error: rgb(186, 26, 26)             /* Error red */
--md-sys-color-tertiary: rgb(106, 94, 47)          /* Tertiary gold */
```

#### Application-Specific Colors

Custom colors for genealogy-specific UI:

```css
--color-boy: #64b5f6                               /* Male gender indicator */
--color-girl: #ef9a9a                              /* Female gender indicator */
--grampsjs-map-marker-color: #ea4335              /* Map markers */
--grampsjs-logout-font-color: #c62828             /* Logout button */
```

### Typography

#### Font Families

```css
--grampsjs-body-font-family: 'Inter var', sans-serif
--grampsjs-heading-font-family: 'Inter var', sans-serif
--grampsjs-monospace-font-family: 'Commit Mono'
```

Gramps Web uses the **Inter** variable font for both body text and headings, providing excellent readability and a modern appearance. Variable fonts allow fine-grained control over font weight.

#### Font Sizes

**Desktop:**
```css
--grampsjs-body-font-size: 17px
```

**Mobile (max-width: 768px):**
```css
font-size: 16px
```

#### Font Weights

Gramps Web uses variable font weights for precise typography:

```css
--grampsjs-body-font-weight: 340                   /* Body text */
h1: 400                                            /* Main headings */
h2: 550                                            /* Section headings */
h3: 470                                            /* Subsection headings */
h4: 500                                            /* Minor headings */
strong/b: 600                                      /* Bold text */
```

#### Heading Scales

**Desktop:**
```css
h1: font-size: 34px
h2: font-size: 30px
h3: font-size: 18px
h4: font-size: 16px
```

**Mobile:**
```css
h1: font-size: 24px
h2: font-size: 24px
h3: font-size: 20px
h4: font-size: 18px
```

### Spacing

#### Responsive Spacing

**List Item Spacing (Desktop):**
```css
--md-list-item-leading-space: 16px
--md-list-item-trailing-space: 16px
--mdc-list-side-padding: 16px
```

**List Item Spacing (Mobile):**
```css
--md-list-item-leading-space: 8px
--md-list-item-trailing-space: 8px
--mdc-list-side-padding: 8px
```

#### Content Spacing

```css
p: margin-top: 1.2em, margin-bottom: 1.2em
h2: margin-top: 10px, margin-bottom: 30px
h3: margin-top: 35px, margin-bottom: 30px
```

### Opacity Scale

Gramps Web uses a comprehensive opacity scale for creating visual hierarchy:

**Light Theme (black-based):**
```css
--grampsjs-body-font-color-5: rgba(0, 0, 0, 0.05)
--grampsjs-body-font-color-15: rgba(0, 0, 0, 0.15)
--grampsjs-body-font-color-35: rgba(0, 0, 0, 0.35)
--grampsjs-body-font-color-50: rgba(0, 0, 0, 0.5)
--grampsjs-body-font-color-60: rgba(0, 0, 0, 0.6)
--grampsjs-body-font-color-87: rgba(0, 0, 0, 0.87)
--grampsjs-body-font-color-100: rgba(0, 0, 0, 1)
```

**Dark Theme (white-based):**
```css
--grampsjs-body-font-color-5: rgba(255, 255, 255, 0.08)
--grampsjs-body-font-color-35: rgba(255, 255, 255, 0.37)
--grampsjs-body-font-color-50: rgba(255, 255, 255, 0.52)
--grampsjs-body-font-color-87: rgba(255, 255, 255, 0.87)
```

### Borders and Dividers

```css
hr: 
  border: 0
  height: 0.5px
  background: var(--grampsjs-body-font-color-40)

--md-divider-thickness: 0px
--grampsjs-connection-chart-border-color: rgba(137, 107, 94, 0.4)
```

### Elevation and Shadows

Material 3 uses color elevation instead of traditional box-shadows. Surface containers provide implicit elevation through color.

## Components

### Buttons

**Primary Button:**
```html
<mwc-button raised label="Primary Action"></mwc-button>
```

**Secondary Button:**
```html
<mwc-button outlined label="Secondary Action"></mwc-button>
```

**Text Button:**
```html
<mwc-button label="Text Action"></mwc-button>
```

**Icon Button:**
```html
<mwc-icon-button icon="edit"></mwc-icon-button>
```

### Form Elements

**Text Field:**
```html
<mwc-textfield label="Label" value=""></mwc-textfield>
```

**Select/Dropdown:**
```html
<mwc-select label="Select Option">
  <mwc-list-item value="1">Option 1</mwc-list-item>
  <mwc-list-item value="2">Option 2</mwc-list-item>
</mwc-select>
```

**Checkbox:**
```html
<mwc-formfield label="Checkbox Label">
  <mwc-checkbox></mwc-checkbox>
</mwc-formfield>
```

### Alerts

**Info Alert:**
```html
<div class="alert">
  Information message
</div>
```

**Error Alert:**
```html
<div class="alert error">
  Error message
</div>
```

**Warning Alert:**
```html
<div class="alert warn">
  Warning message
</div>
```

Custom properties:
```css
--grampsjs-alert-background-color: rgba(109, 76, 65, 0.15)
--grampsjs-alert-border-color: rgba(109, 76, 65, 0.7)
--grampsjs-alert-error-background-color: rgba(191, 54, 12, 0.2)
--grampsjs-alert-warn-background-color: rgba(251, 192, 45, 0.2)
```

### Skeletons (Loading States)

```html
<span class="skeleton">Loading text...</span>
<div class="skeleton" style="width: 200px; height: 20px;"></div>
```

Skeleton animation:
```css
@keyframes shine {
  to {
    background-position-x: -200%;
  }
}
animation: 1.5s shine linear infinite;
```

### Links

```css
a:link, a:visited {
  color: var(--grampsjs-color-link-font)
  text-decoration: none
}

a:hover {
  color: var(--grampsjs-color-link-hover)
  text-decoration: underline
  text-decoration-thickness: 1px
  text-underline-offset: 0.2em
}
```

## Theme System

### Theme Selection

Gramps Web supports three theme modes:

1. **System** (default): Follows OS preference
2. **Light**: Always use light theme
3. **Dark**: Always use dark theme

### Theme Switching API

```javascript
import {applyTheme, getCurrentTheme, getSystemTheme} from './theme.js'

// Apply a theme
applyTheme('dark')  // 'light', 'dark', or 'system'

// Get current theme
const theme = getCurrentTheme(settings.theme)

// Detect system preference
const systemTheme = getSystemTheme()
```

### Theme Implementation

Themes are implemented using the `data-theme` attribute on the root element:

```javascript
export function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', getCurrentTheme(theme))
}
```

CSS selectors:
```css
:root[data-theme='light'] { /* light theme styles */ }
:root[data-theme='dark'] { /* dark theme styles */ }
```

## Responsive Design

### Breakpoints

**Mobile Breakpoint:**
```css
@media (max-width: 768px) {
  /* Mobile styles */
}
```

### Mobile Optimizations

- Reduced font sizes (17px → 16px)
- Reduced heading sizes
- Reduced spacing (16px → 8px for list items)
- Touch-friendly target sizes

## Icons

### Material Icons

```html
<mwc-icon>home</mwc-icon>
<mwc-icon class="male">male</mwc-icon>
<mwc-icon class="female">female</mwc-icon>
```

### MDI Icons (via @mdi/js)

```javascript
import {mdiAccount} from '@mdi/js'
```

## Accessibility Features

### Current Implementation

- Semantic HTML elements
- Material Web Components with built-in ARIA
- Keyboard navigation on form elements
- Focus indicators

### Areas for Improvement

See PHASE10_IMPLEMENTATION.md for accessibility enhancements planned in Phase 10.

## Best Practices

### Using Design Tokens

**✅ DO:**
```css
color: var(--grampsjs-body-font-color)
background: var(--md-sys-color-surface)
```

**❌ DON'T:**
```css
color: #000
background: white
```

### Maintaining Theme Consistency

1. Always use CSS custom properties for colors
2. Test components in both light and dark themes
3. Use opacity scale for hierarchy, not hard-coded colors
4. Follow Material 3 color roles (primary, secondary, surface, etc.)

### Typography Guidelines

1. Use system font stack for performance
2. Limit font weights to those defined in the scale
3. Use relative units (em, rem) for spacing
4. Maintain consistent heading hierarchy

### Component Guidelines

1. Use Material Web Components for UI consistency
2. Extend existing components instead of creating duplicates
3. Follow shared styles conventions
4. Implement proper loading states with skeletons

## Migration Guide

### From Hard-coded Colors

**Before:**
```css
.my-element {
  color: #333;
  background: #f5f5f5;
}
```

**After:**
```css
.my-element {
  color: var(--grampsjs-body-font-color);
  background: var(--md-sys-color-surface-container-low);
}
```

### Supporting Dark Mode

**Before:**
```css
.card {
  background: white;
  color: black;
}
```

**After:**
```css
.card {
  background: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
}
```

## Resources

- **Material Design 3**: https://m3.material.io/
- **Material Web Components**: https://github.com/material-components/material-web
- **Inter Font**: https://rsms.me/inter/
- **CSS Custom Properties**: https://developer.mozilla.org/en-US/docs/Web/CSS/--*

## Version History

- **1.0.0** (Phase 10): Initial design system documentation
