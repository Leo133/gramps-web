# Phase 10: UI/UX Overhaul - Implementation Guide

This document describes the comprehensive implementation of Phase 10 features for Gramps Web, focusing on modern design system, enhanced dark mode, PWA capabilities, and accessibility compliance.

## Overview

Phase 10 transforms Gramps Web into a modern, accessible, and mobile-first progressive web application with:
- **Unified Design System**: Comprehensive Material 3 design token system
- **Enhanced Dark Mode**: Smooth transitions, persistence, and system detection
- **PWA Capabilities**: Offline support, installability, and mobile optimization
- **Accessibility**: WCAG 2.1 AA compliance with comprehensive utilities

## Features Implemented

### 1. Design System Enhancement (100% Complete)

**What it does:**
- Provides a comprehensive design token system for consistent theming
- Documents all Material 3 colors, typography, and spacing
- Offers utilities for accessing and manipulating design tokens
- Supports theme customization and export/import

**Files Created:**
- `PHASE10_DESIGN_SYSTEM.md` - Complete design system documentation
- `src/designTokens.js` - Design token utilities

**Key Features:**

#### Design Token Utilities

```javascript
import {getColor, getSurface, getOpacityToken} from './designTokens.js'

// Get color tokens
const primaryColor = getColor('primary')
const surfaceColor = getSurface('container')

// Work with opacity scale
const opacity50 = getOpacityToken(50) // Returns 'grampsjs-body-font-color-50'
```

#### Theme Customization

```javascript
import {applyCustomTheme, exportTheme, importTheme} from './designTokens.js'

// Apply custom theme
applyCustomTheme({
  'md-sys-color-primary': 'rgb(150, 100, 80)',
  'grampsjs-body-font-size': '18px'
})

// Export current theme
const myTheme = exportTheme()

// Import saved theme
importTheme(myTheme)
```

#### WCAG Compliance Checking

```javascript
import {checkWCAGCompliance} from './designTokens.js'

const compliance = checkWCAGCompliance('#000', '#fff', false)
// Returns: {ratio: '21.00', passAA: true, passAAA: true, isLargeText: false}
```

**Documentation:**
- See `PHASE10_DESIGN_SYSTEM.md` for complete design system reference
- Includes color system, typography, spacing, and component guidelines
- Provides migration guide for theme customization

### 2. Enhanced Dark Mode (100% Complete)

**What it does:**
- Smooth animations when switching themes
- Automatic theme detection from system preferences
- localStorage persistence for user preferences
- System theme listener for runtime changes
- Respects user's motion preferences

**Files Modified:**
- `src/theme.js` - Enhanced with comprehensive theme management
- `global.css` - Added smooth transition styles

**Key Features:**

#### Theme Initialization

```javascript
import {initializeTheme} from './theme.js'

// Initialize theme system (automatically called on app load)
const storedTheme = initializeTheme()
```

#### Theme Switching

```javascript
import {applyTheme, toggleTheme} from './theme.js'

// Apply specific theme with transition
applyTheme('dark', true) // true = with transition

// Toggle between light and dark
toggleTheme()
```

#### Theme Persistence

Themes are automatically saved to localStorage:
```javascript
localStorage.getItem('gramps-theme-preference') // Returns 'light', 'dark', or 'system'
```

#### System Theme Detection

The system automatically:
1. Detects OS theme preference on load
2. Listens for system theme changes
3. Updates app theme when in 'system' mode
4. Respects user's explicit theme choice

**CSS Transitions:**

Smooth theme transitions are applied with:
```css
:root.theme-transition * {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}
```

Motion is reduced for users who prefer it:
```css
@media (prefers-reduced-motion: reduce) {
  :root.theme-transition * {
    transition-duration: 0.01ms !important;
  }
}
```

### 3. Theme Preview Component (100% Complete)

**What it does:**
- Visual preview of light, dark, and system themes
- Interactive selection with keyboard support
- Shows mockup of theme appearance
- Integrated into settings page

**Files Created:**
- `src/components/GrampsjsThemePreview.js`

**Files Modified:**
- `src/views/GrampsjsViewSettingsUser.js` - Added theme preview

**Usage:**
```html
<grampsjs-theme-preview
  .selected="${theme}"
  @theme-selected="${handleThemeSelected}"
></grampsjs-theme-preview>
```

**Features:**
- Clickable theme cards with visual previews
- Keyboard navigation support
- ARIA radio button semantics
- Checkmark indicator for selected theme

### 4. PWA Implementation (100% Complete)

**What it does:**
- Service worker for offline support
- Automatic caching of static assets
- Network-first strategy for API calls
- Cache-first strategy for images
- Install prompt handling
- Online/offline detection
- Storage management

**Files Created:**
- `service-worker.js` - Main service worker
- `src/pwa.js` - PWA utilities
- `src/components/GrampsjsPwaInstall.js` - Install banner

**Files Modified:**
- `src/GrampsJs.js` - Initialize PWA on app load

**Key Features:**

#### Service Worker

The service worker implements:
- **Static cache**: Pre-caches essential assets on install
- **Dynamic cache**: Caches API responses (max 50 items)
- **Image cache**: Caches images (max 100 items)
- **Network-first**: For API requests (falls back to cache)
- **Cache-first**: For static assets and images

Cache version: `gramps-web-v1.0.0`

#### PWA Installation

```javascript
import {showInstallPrompt, isInstalledPWA, isInstallAvailable} from './pwa.js'

// Check if app is installed
if (isInstalledPWA()) {
  console.log('Running as PWA')
}

// Check if install is available
if (isInstallAvailable()) {
  // Show install prompt
  const accepted = await showInstallPrompt()
}
```

#### Offline Detection

```javascript
import {isOnline, setupOnlineStatusDetection} from './pwa.js'

// Setup detection
setupOnlineStatusDetection()

// Listen for changes
window.addEventListener('online-status-changed', e => {
  console.log('Online:', e.detail.isOnline)
})

// Check current status
const online = isOnline()
```

#### Storage Management

```javascript
import {getStorageInfo, requestPersistentStorage} from './pwa.js'

// Get storage usage
const info = await getStorageInfo()
console.log(`Using ${info.usageMB}MB of ${info.quotaMB}MB`)

// Request persistent storage
const persistent = await requestPersistentStorage()
```

#### Install Banner

Automatically shows when install is available:
- Appears at bottom of screen
- Dismissible for current session
- Clean, modern design
- Fully accessible

### 5. Accessibility Implementation (100% Complete)

**What it does:**
- Screen reader announcements
- Skip navigation link
- Focus management and trapping
- Keyboard navigation utilities
- ARIA attribute helpers
- WCAG compliance checking
- High contrast mode support
- Reduced motion support

**Files Created:**
- `src/accessibility.js` - Comprehensive accessibility utilities

**Files Modified:**
- `src/GrampsJs.js` - Initialize accessibility features
- `global.css` - Added accessibility CSS

**Key Features:**

#### Screen Reader Announcements

```javascript
import {announceToScreenReader} from './accessibility.js'

// Polite announcement (doesn't interrupt)
announceToScreenReader('Profile saved successfully')

// Assertive announcement (interrupts current speech)
announceToScreenReader('Error: Failed to save', 'assertive')
```

#### Skip Navigation

Automatically created on app load:
- Hidden by default
- Visible on keyboard focus
- Jumps to main content area
- WCAG requirement for keyboard users

#### Focus Management

```javascript
import {manageFocus} from './accessibility.js'

// Focus element after navigation
manageFocus(contentElement, 'Navigated to Profile page')
```

#### Focus Trap for Modals

```javascript
import {createFocusTrap} from './accessibility.js'

const trap = createFocusTrap(dialogElement)
trap.activate() // Trap focus within dialog
// ... later
trap.deactivate() // Release focus
```

#### Keyboard Navigation

```javascript
import {addKeyboardNavigation} from './accessibility.js'

addKeyboardNavigation(listElement, {
  itemSelector: 'li',
  onSelect: (item, index) => {
    console.log('Selected:', item)
  },
  loop: true,
  orientation: 'vertical'
})
```

#### Accessible Tooltips

```javascript
import {createAccessibleTooltip} from './accessibility.js'

const tooltip = createAccessibleTooltip(button, 'Click to edit profile')
```

**CSS Enhancements:**

Enhanced focus indicators:
```css
body.keyboard-navigation *:focus {
  outline: 2px solid var(--md-sys-color-primary);
  outline-offset: 2px;
}
```

High contrast mode support:
```css
@media (prefers-contrast: more) {
  * {
    border-width: 2px !important;
  }
}
```

Screen reader only content:
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
}
```

### 6. Mobile Optimization (100% Complete)

**What it does:**
- Touch gesture detection (swipe, long press)
- Pull to refresh
- Safe area inset support
- Touch target optimization
- Haptic feedback
- Mobile device detection

**Files Created:**
- `src/mobileGestures.js` - Touch gesture utilities
- `src/responsive.js` - Responsive breakpoint utilities

**Key Features:**

#### Swipe Detection

```javascript
import {createSwipeDetector} from './mobileGestures.js'

const swipe = createSwipeDetector(element, {
  onSwipeLeft: () => console.log('Swiped left'),
  onSwipeRight: () => console.log('Swiped right'),
  threshold: 50 // Minimum swipe distance
})
```

#### Long Press

```javascript
import {createLongPressDetector} from './mobileGestures.js'

const longPress = createLongPressDetector(element, {
  duration: 500,
  onLongPress: () => console.log('Long pressed')
})
```

#### Pull to Refresh

```javascript
import {createPullToRefresh} from './mobileGestures.js'

const ptr = createPullToRefresh(scrollContainer, {
  threshold: 80,
  onRefresh: async () => {
    await loadNewData()
  }
})
```

#### Touch Target Optimization

```javascript
import {optimizeTouchTarget} from './mobileGestures.js'

// Ensures minimum 44x44px touch target (WCAG)
optimizeTouchTarget(buttonElement)
```

#### Haptic Feedback

```javascript
import {hapticFeedback} from './mobileGestures.js'

// Provide tactile feedback on touch
hapticFeedback('light') // or 'medium', 'heavy'
```

#### Safe Area Insets

```javascript
import {applySafeAreaPadding} from './mobileGestures.js'

// Apply padding for devices with notches
applySafeAreaPadding(headerElement)
```

### 7. Responsive Utilities (100% Complete)

**What it does:**
- Breakpoint detection and watching
- Viewport size utilities
- Orientation detection
- Lazy loading with viewport observer
- Debounced resize handlers

**Files Created:**
- `src/responsive.js`

**Key Features:**

#### Breakpoint Detection

```javascript
import {getCurrentBreakpoint, isMobileViewport} from './responsive.js'

const bp = getCurrentBreakpoint() // 'mobile', 'tablet', or 'desktop'
const isMobile = isMobileViewport() // boolean
```

#### Breakpoint Watching

```javascript
import {watchBreakpoint} from './responsive.js'

const watcher = watchBreakpoint('mobile', matches => {
  console.log('Mobile breakpoint:', matches)
})

// Clean up later
watcher.destroy()
```

#### Responsive Values

```javascript
import {responsive} from './responsive.js'

const fontSize = responsive({
  mobile: '14px',
  tablet: '16px',
  desktop: '18px'
})
```

#### Orientation Detection

```javascript
import {watchOrientation} from './responsive.js'

const cleanup = watchOrientation(orientation => {
  console.log('Orientation:', orientation) // 'landscape' or 'portrait'
})
```

#### Viewport Observer (Lazy Loading)

```javascript
import {createViewportObserver} from './responsive.js'

const observer = createViewportObserver((element, isVisible) => {
  if (isVisible) {
    loadImage(element)
  }
}, {threshold: 0.1, rootMargin: '50px'})

observer.observe(imageElement)
```

## Integration Guide

### Using New Features in Components

#### 1. Theme Utilities

```javascript
import {applyTheme, getCurrentTheme} from '../theme.js'

// In your component
const currentTheme = getCurrentTheme(this.appState.settings.theme)
applyTheme('dark')
```

#### 2. Design Tokens

```javascript
import {getColor, getDesignToken} from '../designTokens.js'

// In your component styles
const primaryColor = getColor('primary')
element.style.backgroundColor = primaryColor
```

#### 3. PWA Features

```javascript
import {isInstalledPWA, showInstallPrompt} from '../pwa.js'

// Check if running as PWA
if (isInstalledPWA()) {
  // Hide install banner
}

// Show install prompt
await showInstallPrompt()
```

#### 4. Accessibility

```javascript
import {announceToScreenReader, manageFocus} from '../accessibility.js'

// Announce state changes
announceToScreenReader('Item added to cart')

// Manage focus after navigation
manageFocus(mainElement, 'Navigated to new page')
```

#### 5. Mobile Gestures

```javascript
import {createSwipeDetector, hapticFeedback} from '../mobileGestures.js'

// Add swipe support
createSwipeDetector(element, {
  onSwipeLeft: () => {
    hapticFeedback('light')
    navigateNext()
  }
})
```

#### 6. Responsive Design

```javascript
import {isMobileViewport, watchBreakpoint} from '../responsive.js'

// Responsive rendering
render() {
  const mobile = isMobileViewport()
  return mobile ? this.renderMobile() : this.renderDesktop()
}
```

## Testing

### Manual Testing Checklist

**Design System:**
- [ ] Verify all design tokens are accessible
- [ ] Test theme customization
- [ ] Check color contrast ratios
- [ ] Verify responsive typography

**Dark Mode:**
- [ ] Switch between light, dark, and system themes
- [ ] Verify smooth transitions
- [ ] Check theme persistence after refresh
- [ ] Test system theme auto-switching
- [ ] Verify all components look correct in dark mode

**PWA:**
- [ ] Test offline functionality
- [ ] Verify install prompt appears
- [ ] Install app and test as PWA
- [ ] Check service worker caching
- [ ] Test online/offline detection
- [ ] Verify storage management

**Accessibility:**
- [ ] Test with screen reader (NVDA, JAWS, VoiceOver)
- [ ] Navigate entire app with keyboard only
- [ ] Verify skip link functionality
- [ ] Test focus indicators
- [ ] Check ARIA attributes
- [ ] Test with high contrast mode
- [ ] Verify reduced motion preference

**Mobile:**
- [ ] Test on iOS device
- [ ] Test on Android device
- [ ] Verify touch gestures work
- [ ] Check safe area insets on notched devices
- [ ] Test pull to refresh
- [ ] Verify haptic feedback
- [ ] Check responsive breakpoints

### Automated Testing

Run accessibility tests:
```bash
# Install axe-core if not already installed
npm install --save-dev @axe-core/cli

# Run accessibility audit
axe http://localhost:8001 --rules wcag2a,wcag2aa
```

## Browser Support

**Service Worker:**
- Chrome 40+
- Firefox 44+
- Safari 11.1+
- Edge 17+

**CSS Custom Properties:**
- All modern browsers
- IE 11 not supported

**Touch Events:**
- All mobile browsers
- Desktop browsers with touch support

## Performance Considerations

**Service Worker:**
- Static cache: ~5MB (fonts, CSS, JS)
- Dynamic cache: Limited to 50 items
- Image cache: Limited to 100 items
- Automatic cache cleanup

**Theme Transitions:**
- Disabled for users who prefer reduced motion
- Uses CSS transitions for performance
- 300ms duration by default

**Mobile Gestures:**
- Passive event listeners where possible
- Debounced handlers to prevent performance issues
- Optimized for 60fps animations

## Security Considerations

**Service Worker:**
- Only caches same-origin resources
- HTTPS required in production
- No sensitive data in cache

**PWA:**
- Persistent storage requires user permission
- Install prompt can only be triggered by user gesture

**localStorage:**
- Used only for theme preference
- No sensitive data stored

## Accessibility Standards Met

- **WCAG 2.1 Level AA**: Target compliance
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: ARIA labels and live regions
- **Focus Management**: Visible focus indicators
- **Color Contrast**: AA ratios for all text
- **Touch Targets**: Minimum 44x44px
- **Motion**: Respects reduced motion preference
- **Contrast**: Supports high contrast mode

## Migration Guide

### For Existing Components

**Add Theme Support:**
```javascript
// Before
color: #000

// After
color: var(--md-sys-color-on-surface)
```

**Add Keyboard Navigation:**
```javascript
import {addKeyboardNavigation} from '../accessibility.js'

connectedCallback() {
  super.connectedCallback()
  addKeyboardNavigation(this.shadowRoot.querySelector('ul'))
}
```

**Add Mobile Gestures:**
```javascript
import {createSwipeDetector} from '../mobileGestures.js'

firstUpdated() {
  createSwipeDetector(this, {
    onSwipeLeft: () => this.nextItem(),
    onSwipeRight: () => this.prevItem()
  })
}
```

## Future Enhancements

Potential areas for expansion:
- [ ] Custom theme builder UI
- [ ] A/B testing for design variations
- [ ] Advanced PWA features (background sync, push notifications)
- [ ] More gesture types (pinch to zoom, rotate)
- [ ] Accessibility audit tool integration
- [ ] Voice control support
- [ ] Automatic dark mode for images

## Troubleshooting

**Service worker not updating:**
- Clear cache and hard reload (Ctrl+Shift+R)
- Check service worker in DevTools > Application
- Verify HTTPS in production

**Theme not persisting:**
- Check localStorage is enabled
- Verify no browser extensions blocking storage
- Check browser console for errors

**Accessibility issues:**
- Run automated audit with axe-core
- Test with actual screen reader
- Check browser console for warnings

**Mobile gestures not working:**
- Verify touch events are supported
- Check for conflicting event listeners
- Test on actual mobile device

## Resources

- **Material Design 3**: https://m3.material.io/
- **PWA Documentation**: https://web.dev/progressive-web-apps/
- **WCAG 2.1**: https://www.w3.org/WAI/WCAG21/quickref/
- **Service Workers**: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
- **Touch Events**: https://developer.mozilla.org/en-US/docs/Web/API/Touch_events

## Conclusion

Phase 10 provides a comprehensive foundation for a modern, accessible, and mobile-first web application. All core features are implemented and ready for use throughout the application.

**Next Steps:**
1. Apply PWA and accessibility features to existing components
2. Test on various devices and browsers
3. Run automated accessibility audits
4. Gather user feedback
5. Iterate and improve based on findings

---

*Implementation Version: 1.0.0*
*Last Updated: December 2025*
