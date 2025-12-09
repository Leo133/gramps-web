# Phase 10: UI/UX Overhaul - Design System Documentation

## Overview

Phase 10 represents a comprehensive overhaul of the Gramps Web user interface, focusing on creating a beautiful, accessible, and mobile-first experience. This phase also reviews and completes frontend integration for all previous phases (1-10).

## Goals

1. **Design System Foundation** - Create a unified design language with consistent tokens
2. **Component Library Enhancement** - Improve and standardize all 171+ components
3. **Mobile-First Responsive Design** - Optimize for all screen sizes and devices
4. **Accessibility (WCAG 2.1 AA)** - Ensure the platform is usable by everyone
5. **PWA Enhancement** - Implement offline mode and native app experience
6. **Visual Polish** - Refine typography, spacing, animations, and overall aesthetics
7. **Complete Phase 4 Frontend** - Implement pending media management UI features

## Design System Foundation

### Design Tokens

The design system is built on a comprehensive set of design tokens defined in `src/design-tokens.js`. These tokens provide consistency across all components and views.

#### Token Categories

1. **Spacing System** - 8px base unit with 14 spacing levels
2. **Typography Scale** - Material Design 3 type scale (Display, Headline, Title, Body, Label)
3. **Color System** - Material 3 dynamic color with full dark mode support
4. **Border Radius** - 9 radius levels from none to full
5. **Elevation** - 5 elevation levels with shadows
6. **Transitions** - Standardized durations and easing curves
7. **Z-index** - Layering system for overlays
8. **Breakpoints** - 6 responsive breakpoints (xs to 2xl)
9. **Component Tokens** - Specific tokens for buttons, inputs, cards, etc.

### Usage Example

```javascript
import {LitElement, html, css} from 'lit'
import {designTokens} from './design-tokens.js'

class MyComponent extends LitElement {
  static styles = [
    designTokens,
    css`
      .my-card {
        padding: var(--spacing-6);
        border-radius: var(--radius-card);
        box-shadow: var(--elevation-card);
        font-size: var(--type-body-medium-size);
      }
    `
  ]
}
```

## Accessibility (WCAG 2.1 AA Compliance)

### Implementation

The accessibility module (`src/accessibility.js`) provides:

1. **Focus Management** - Visible focus indicators and keyboard navigation
2. **Screen Reader Support** - ARIA labels, live regions, and announcements
3. **Color Contrast** - Tools to ensure 4.5:1 ratio for text
4. **Touch Targets** - Minimum 48x48px for all interactive elements
5. **Keyboard Navigation** - Full keyboard support with proper tab order
6. **Skip Links** - Skip to main content for screen readers

### Key Features

#### Focus Indicators

All interactive elements have visible focus indicators that meet WCAG requirements:

```css
.focusable:focus {
  outline: 2px solid var(--focus-ring-color);
  outline-offset: 2px;
}
```

#### Screen Reader Support

```javascript
import {announceToScreenReader} from './accessibility.js'

// Announce important updates to screen readers
announceToScreenReader('Item added to tree', 'polite')
```

#### Focus Trapping

For modals and dialogs:

```javascript
import {trapFocus} from './accessibility.js'

const cleanup = trapFocus(modalElement)
// When closing modal:
cleanup()
```

#### Initialization

Add to app startup:

```javascript
import {initAccessibility} from './accessibility.js'

// Initialize all accessibility features
initAccessibility()
```

### Accessibility Checklist

- [x] All images have alt text
- [x] All interactive elements have accessible names
- [x] Proper heading hierarchy (h1 -> h6)
- [x] Sufficient color contrast (4.5:1 minimum)
- [x] Keyboard navigation support
- [x] Focus indicators visible
- [x] Skip navigation links
- [x] ARIA labels for all controls
- [x] Error messages associated with form fields
- [x] Loading states announced to screen readers

## Responsive Design

### Mobile-First Approach

All styles are written mobile-first, with progressive enhancement for larger screens.

### Breakpoints

```javascript
const BREAKPOINTS = {
  xs: 320px,   // Small phones
  sm: 640px,   // Large phones
  md: 768px,   // Tablets
  lg: 1024px,  // Laptops
  xl: 1280px,  // Desktops
  '2xl': 1536px // Large desktops
}
```

### Responsive Utilities

The responsive module (`src/responsive.js`) provides:

1. **Grid System** - 12-column responsive grid
2. **Flex Utilities** - Flexbox helpers
3. **Display Utilities** - Show/hide at breakpoints
4. **Spacing Utilities** - Responsive padding/margin
5. **Device Detection** - isMobile(), isTablet(), isDesktop()
6. **Viewport Utilities** - Scroll, lock, orientation detection

### Usage Examples

#### Responsive Grid

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <div>Column 1</div>
  <div>Column 2</div>
  <div>Column 3</div>
  <div>Column 4</div>
</div>
```

#### Device Detection

```javascript
import {isMobile, isTablet, getCurrentBreakpoint} from './responsive.js'

if (isMobile()) {
  // Show mobile navigation
}

const breakpoint = getCurrentBreakpoint() // 'xs', 'sm', 'md', 'lg', 'xl', '2xl'
```

#### Watch Breakpoint Changes

```javascript
import {watchBreakpoint} from './responsive.js'

const cleanup = watchBreakpoint(breakpoint => {
  console.log(`Breakpoint changed to: ${breakpoint}`)
})
```

### Mobile Optimizations

1. **Touch Targets** - All interactive elements >= 48x48px
2. **Safe Area Insets** - Support for notched devices (iPhone X+)
3. **Orientation Handling** - Responsive to portrait/landscape
4. **Touch Gestures** - Swipe, pinch-to-zoom where appropriate
5. **Performance** - Optimized for slower mobile networks

## Component Architecture

### Base Component Structure

All components should follow this structure:

```javascript
import {LitElement, html, css} from 'lit'
import {designTokens} from './design-tokens.js'
import {a11yStyles} from './accessibility.js'
import {responsiveStyles} from './responsive.js'

class MyComponent extends LitElement {
  static styles = [
    designTokens,
    a11yStyles,
    responsiveStyles,
    css`
      /* Component-specific styles */
    `
  ]

  static properties = {
    // Properties
  }

  render() {
    return html`
      <!-- Component template -->
    `
  }
}

customElements.define('my-component', MyComponent)
```

### Component Guidelines

1. **Use Design Tokens** - Always use tokens instead of hard-coded values
2. **Include Accessibility** - Add ARIA labels, roles, and keyboard support
3. **Responsive Design** - Use responsive utilities for mobile optimization
4. **Focus States** - Ensure visible focus indicators
5. **Loading States** - Show loading skeletons or spinners
6. **Error States** - Display user-friendly error messages
7. **Empty States** - Show helpful empty state messages

## Typography

### Type Scale

Based on Material Design 3:

| Scale | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| Display Large | 57px | 64px | 400 | Hero headings |
| Display Medium | 45px | 52px | 400 | Page titles |
| Display Small | 36px | 44px | 400 | Section titles |
| Headline Large | 32px | 40px | 400 | Card titles |
| Headline Medium | 28px | 36px | 400 | List headers |
| Headline Small | 24px | 32px | 400 | Subsections |
| Title Large | 22px | 28px | 400 | Dialogs |
| Title Medium | 16px | 24px | 500 | Card subtitles |
| Title Small | 14px | 20px | 500 | Labels |
| Body Large | 16px | 24px | 400 | Body text |
| Body Medium | 14px | 20px | 400 | Default text |
| Body Small | 12px | 16px | 400 | Captions |
| Label Large | 14px | 20px | 500 | Buttons |
| Label Medium | 12px | 16px | 500 | Tabs |
| Label Small | 11px | 16px | 500 | Chips |

### Font Families

- **Body & Headings**: Inter var (with system font fallbacks)
- **Monospace**: Commit Mono (for code and IDs)

### Usage

```css
.heading {
  font-size: var(--type-headline-large-size);
  line-height: var(--type-headline-large-line-height);
  font-weight: var(--type-headline-large-weight);
  letter-spacing: var(--type-headline-large-tracking);
}
```

## Color System

### Material 3 Dynamic Color

The application uses Material Design 3's dynamic color system with full support for light and dark modes.

#### Key Color Roles

- **Primary** - Main brand color, used for prominent buttons and active states
- **Secondary** - Accent color, used for less prominent elements
- **Tertiary** - Additional accent, used for contrasting highlights
- **Error** - Error states and destructive actions
- **Surface** - Component backgrounds
- **Background** - Main background color

#### Usage

```css
.button-primary {
  background-color: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
}

.card {
  background-color: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
}
```

### Dark Mode

Dark mode is automatically supported through the `data-theme` attribute:

```javascript
import {applyTheme} from './theme.js'

// Set theme
applyTheme('dark')  // or 'light' or 'system'
```

## Spacing System

### 8px Base Unit

All spacing uses an 8px base unit for consistency:

```javascript
--spacing-1: 4px    (0.5 × base)
--spacing-2: 8px    (1 × base)
--spacing-3: 12px   (1.5 × base)
--spacing-4: 16px   (2 × base)
--spacing-6: 24px   (3 × base)
--spacing-8: 32px   (4 × base)
// etc.
```

### Semantic Spacing

```css
.card {
  padding: var(--spacing-card-padding);  /* 24px */
  margin-bottom: var(--spacing-section-margin);  /* 32px */
}
```

## Elevation (Shadows)

### Material Design Elevation

5 elevation levels matching Material Design 3:

```css
.card {
  box-shadow: var(--elevation-1);
}

.dialog {
  box-shadow: var(--elevation-3);
}

.floating-action-button {
  box-shadow: var(--elevation-fab);
}
```

## Transitions & Animations

### Duration Scale

- **Instant**: 0ms
- **Short**: 50-200ms
- **Medium**: 250-400ms
- **Long**: 450-600ms
- **Extra Long**: 700-1000ms

### Easing Curves

- **Standard**: `cubic-bezier(0.2, 0, 0, 1)` - Default transitions
- **Emphasized**: `cubic-bezier(0.2, 0, 0, 1)` - Important transitions
- **Emphasized Decelerate**: `cubic-bezier(0.05, 0.7, 0.1, 1)` - Entering elements
- **Emphasized Accelerate**: `cubic-bezier(0.3, 0, 0.8, 0.15)` - Exiting elements

### Usage

```css
.button {
  transition: var(--transition-color);
}

.modal {
  transition: var(--transition-scale);
}
```

### Reduced Motion

The system respects `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Border Radius

### Radius Scale

- **None**: 0
- **XS**: 2px
- **SM**: 4px
- **MD**: 8px
- **LG**: 12px
- **XL**: 16px
- **2XL**: 24px
- **3XL**: 32px
- **Full**: 9999px (pills)

### Semantic Radius

```css
.button {
  border-radius: var(--radius-button);  /* Full */
}

.card {
  border-radius: var(--radius-card);  /* 12px */
}

.dialog {
  border-radius: var(--radius-dialog);  /* 16px */
}
```

## Progressive Web App (PWA)

### Features

1. **App Install Prompt** - Users can install as native app
2. **Offline Support** - Service worker caching for offline access
3. **App Icons** - 192x192 and 512x512 icons for all platforms
4. **Splash Screens** - Custom splash screens for iOS/Android
5. **Status Bar** - Themed status bar on mobile

### Manifest

The app manifest (`manifest.json`) defines:

```json
{
  "name": "Gramps Web",
  "short_name": "Gramps",
  "display": "standalone",
  "theme_color": "#6D4C41",
  "background_color": "#fff",
  "icons": [...]
}
```

### Service Worker (To Be Implemented)

Service worker will provide:
- Offline caching of app shell
- Background sync
- Push notifications (future)

## Performance Optimizations

### Code Splitting

- Lazy load views with dynamic imports
- Separate vendor bundles
- Route-based code splitting

### Asset Optimization

- Optimized images (WebP format)
- Icon sprite sheets
- Lazy loading for media

### Virtual Scrolling

For large lists (1000+ items):

```javascript
// Use virtual scrolling for performance
import '@lit-labs/virtualizer'
```

### Bundle Size

- Minimize dependencies
- Tree-shaking for unused code
- Compression (Gzip/Brotli)

## Testing

### Accessibility Testing

Tools to use:
- **axe DevTools** - Browser extension for accessibility scanning
- **WAVE** - Web accessibility evaluation tool
- **Screen readers** - NVDA (Windows), JAWS (Windows), VoiceOver (macOS/iOS)
- **Keyboard testing** - Test all functionality without mouse

### Responsive Testing

Test on:
- **Mobile**: iPhone SE, iPhone 14 Pro, Samsung Galaxy
- **Tablet**: iPad, iPad Pro, Samsung Tab
- **Desktop**: 1280px, 1920px, 2560px widths
- **Browsers**: Chrome, Firefox, Safari, Edge

### Performance Testing

- **Lighthouse** - Google Chrome audit tool
- **WebPageTest** - Real-world performance testing
- **Core Web Vitals** - LCP, FID, CLS metrics

## Browser Support

### Minimum Requirements

- **Chrome/Edge**: Last 2 versions
- **Firefox**: Last 2 versions
- **Safari**: Last 2 versions
- **Mobile**: iOS 12+, Android 8+

### Progressive Enhancement

- Core functionality works in all browsers
- Enhanced features for modern browsers
- Graceful degradation for older browsers

## Migration Guide

### Updating Existing Components

1. Import design tokens:
   ```javascript
   import {designTokens} from './design-tokens.js'
   ```

2. Replace hard-coded values:
   ```css
   /* Before */
   padding: 16px;
   
   /* After */
   padding: var(--spacing-4);
   ```

3. Add accessibility features:
   ```javascript
   import {a11yStyles} from './accessibility.js'
   ```

4. Use responsive utilities:
   ```javascript
   import {responsiveStyles} from './responsive.js'
   ```

### Checklist for Each Component

- [ ] Uses design tokens instead of hard-coded values
- [ ] Includes accessibility styles
- [ ] Responsive on all screen sizes
- [ ] Has visible focus indicators
- [ ] ARIA labels on interactive elements
- [ ] Keyboard navigation works
- [ ] Color contrast meets WCAG AA
- [ ] Touch targets >= 48x48px
- [ ] Works in dark mode

## Future Enhancements

### Phase 11 (Performance & DevOps)
- Service worker implementation
- Offline mode
- CI/CD pipelines
- Redis caching

### Phase 12 (AI & Automation)
- AI-powered biographer
- Handwriting OCR
- Face recognition
- Smart hints

### Phase 13 (Administration)
- Audit logs
- Backup scheduler
- Bulk operations
- System health dashboard

## Resources

### Internal Documentation
- `src/design-tokens.js` - All design tokens
- `src/accessibility.js` - Accessibility utilities
- `src/responsive.js` - Responsive design utilities
- `src/theme.js` - Theme management

### External Resources
- [Material Design 3](https://m3.material.io/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Web Docs](https://developer.mozilla.org/)
- [Lit Documentation](https://lit.dev/)

## Contributing

When adding new components or features:

1. Follow the design system guidelines
2. Use design tokens for all values
3. Ensure WCAG 2.1 AA compliance
4. Test on mobile and desktop
5. Add proper documentation
6. Run accessibility audits

## Support

For questions or issues:
- Check the documentation first
- Review existing components for examples
- Test in multiple browsers and devices
- Run accessibility audits

---

**Phase 10 Implementation**  
**Status**: In Progress  
**Version**: 1.0.0  
**Last Updated**: December 9, 2025
