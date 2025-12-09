/**
 * Gramps Web Design Tokens
 *
 * This file defines the design tokens for the Gramps Web application.
 * Design tokens are the visual design atoms of the design system - specifically,
 * they are named entities that store visual design attributes.
 *
 * Phase 10: UI/UX Overhaul - Design System Foundation
 */

import {css} from 'lit'

/**
 * Design tokens as CSS custom properties
 * These tokens provide a consistent design language across the application
 */
export const designTokens = css`
  :host {
    /* =====================================================
       SPACING SYSTEM
       ===================================================== */
    --spacing-0: 0;
    --spacing-1: 4px; /* 0.25rem */
    --spacing-2: 8px; /* 0.5rem */
    --spacing-3: 12px; /* 0.75rem */
    --spacing-4: 16px; /* 1rem - Base unit */
    --spacing-5: 20px; /* 1.25rem */
    --spacing-6: 24px; /* 1.5rem */
    --spacing-7: 28px; /* 1.75rem */
    --spacing-8: 32px; /* 2rem */
    --spacing-10: 40px; /* 2.5rem */
    --spacing-12: 48px; /* 3rem */
    --spacing-16: 64px; /* 4rem */
    --spacing-20: 80px; /* 5rem */
    --spacing-24: 96px; /* 6rem */

    /* Semantic spacing */
    --spacing-component-padding: var(--spacing-4);
    --spacing-section-margin: var(--spacing-8);
    --spacing-page-margin: var(--spacing-6);
    --spacing-list-item-gap: var(--spacing-2);
    --spacing-card-padding: var(--spacing-6);
    --spacing-button-padding: var(--spacing-3) var(--spacing-6);

    /* =====================================================
       TYPOGRAPHY SCALE
       Based on Material Design 3 and optimized for readability
       ===================================================== */

    /* Font families */
    --font-family-body: 'Inter var', -apple-system, BlinkMacSystemFont,
      'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    --font-family-heading: 'Inter var', -apple-system, BlinkMacSystemFont,
      'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    --font-family-mono: 'Commit Mono', 'SF Mono', 'Monaco', 'Inconsolata',
      'Fira Code', 'Droid Sans Mono', 'Source Code Pro', monospace;

    /* Font weights */
    --font-weight-light: 300;
    --font-weight-regular: 400;
    --font-weight-medium: 500;
    --font-weight-semibold: 600;
    --font-weight-bold: 700;

    /* Type scale - Display */
    --type-display-large-size: 57px;
    --type-display-large-line-height: 64px;
    --type-display-large-weight: var(--font-weight-regular);
    --type-display-large-tracking: -0.25px;

    --type-display-medium-size: 45px;
    --type-display-medium-line-height: 52px;
    --type-display-medium-weight: var(--font-weight-regular);
    --type-display-medium-tracking: 0;

    --type-display-small-size: 36px;
    --type-display-small-line-height: 44px;
    --type-display-small-weight: var(--font-weight-regular);
    --type-display-small-tracking: 0;

    /* Type scale - Headline */
    --type-headline-large-size: 32px;
    --type-headline-large-line-height: 40px;
    --type-headline-large-weight: var(--font-weight-regular);
    --type-headline-large-tracking: 0;

    --type-headline-medium-size: 28px;
    --type-headline-medium-line-height: 36px;
    --type-headline-medium-weight: var(--font-weight-regular);
    --type-headline-medium-tracking: 0;

    --type-headline-small-size: 24px;
    --type-headline-small-line-height: 32px;
    --type-headline-small-weight: var(--font-weight-regular);
    --type-headline-small-tracking: 0;

    /* Type scale - Title */
    --type-title-large-size: 22px;
    --type-title-large-line-height: 28px;
    --type-title-large-weight: var(--font-weight-regular);
    --type-title-large-tracking: 0;

    --type-title-medium-size: 16px;
    --type-title-medium-line-height: 24px;
    --type-title-medium-weight: var(--font-weight-medium);
    --type-title-medium-tracking: 0.15px;

    --type-title-small-size: 14px;
    --type-title-small-line-height: 20px;
    --type-title-small-weight: var(--font-weight-medium);
    --type-title-small-tracking: 0.1px;

    /* Type scale - Body */
    --type-body-large-size: 16px;
    --type-body-large-line-height: 24px;
    --type-body-large-weight: var(--font-weight-regular);
    --type-body-large-tracking: 0.5px;

    --type-body-medium-size: 14px;
    --type-body-medium-line-height: 20px;
    --type-body-medium-weight: var(--font-weight-regular);
    --type-body-medium-tracking: 0.25px;

    --type-body-small-size: 12px;
    --type-body-small-line-height: 16px;
    --type-body-small-weight: var(--font-weight-regular);
    --type-body-small-tracking: 0.4px;

    /* Type scale - Label */
    --type-label-large-size: 14px;
    --type-label-large-line-height: 20px;
    --type-label-large-weight: var(--font-weight-medium);
    --type-label-large-tracking: 0.1px;

    --type-label-medium-size: 12px;
    --type-label-medium-line-height: 16px;
    --type-label-medium-weight: var(--font-weight-medium);
    --type-label-medium-tracking: 0.5px;

    --type-label-small-size: 11px;
    --type-label-small-line-height: 16px;
    --type-label-small-weight: var(--font-weight-medium);
    --type-label-small-tracking: 0.5px;

    /* =====================================================
       BORDER RADIUS SYSTEM
       ===================================================== */
    --radius-none: 0;
    --radius-xs: 2px;
    --radius-sm: 4px;
    --radius-md: 8px;
    --radius-lg: 12px;
    --radius-xl: 16px;
    --radius-2xl: 24px;
    --radius-3xl: 32px;
    --radius-full: 9999px;

    /* Semantic border radius */
    --radius-button: var(--radius-full);
    --radius-card: var(--radius-lg);
    --radius-dialog: var(--radius-xl);
    --radius-chip: var(--radius-full);
    --radius-input: var(--radius-sm);
    --radius-avatar: var(--radius-full);

    /* =====================================================
       ELEVATION (BOX SHADOW) SYSTEM
       Based on Material Design 3 elevation levels
       ===================================================== */
    --elevation-0: none;
    --elevation-1: 0px 1px 2px 0px rgba(0, 0, 0, 0.3),
      0px 1px 3px 1px rgba(0, 0, 0, 0.15);
    --elevation-2: 0px 1px 2px 0px rgba(0, 0, 0, 0.3),
      0px 2px 6px 2px rgba(0, 0, 0, 0.15);
    --elevation-3: 0px 4px 8px 3px rgba(0, 0, 0, 0.15),
      0px 1px 3px 0px rgba(0, 0, 0, 0.3);
    --elevation-4: 0px 6px 10px 4px rgba(0, 0, 0, 0.15),
      0px 2px 3px 0px rgba(0, 0, 0, 0.3);
    --elevation-5: 0px 8px 12px 6px rgba(0, 0, 0, 0.15),
      0px 4px 4px 0px rgba(0, 0, 0, 0.3);

    /* Dark mode elevation overlays */
    --elevation-dark-1: 0.05;
    --elevation-dark-2: 0.08;
    --elevation-dark-3: 0.11;
    --elevation-dark-4: 0.12;
    --elevation-dark-5: 0.14;

    /* Semantic elevation */
    --elevation-card: var(--elevation-1);
    --elevation-dialog: var(--elevation-3);
    --elevation-drawer: var(--elevation-1);
    --elevation-fab: var(--elevation-3);
    --elevation-menu: var(--elevation-2);
    --elevation-app-bar: var(--elevation-0);

    /* =====================================================
       TRANSITIONS & ANIMATIONS
       Based on Material Design motion principles
       ===================================================== */
    --duration-instant: 0ms;
    --duration-short-1: 50ms;
    --duration-short-2: 100ms;
    --duration-short-3: 150ms;
    --duration-short-4: 200ms;
    --duration-medium-1: 250ms;
    --duration-medium-2: 300ms;
    --duration-medium-3: 350ms;
    --duration-medium-4: 400ms;
    --duration-long-1: 450ms;
    --duration-long-2: 500ms;
    --duration-long-3: 550ms;
    --duration-long-4: 600ms;
    --duration-extra-long-1: 700ms;
    --duration-extra-long-2: 800ms;
    --duration-extra-long-3: 900ms;
    --duration-extra-long-4: 1000ms;

    /* Easing curves */
    --easing-standard: cubic-bezier(0.2, 0, 0, 1);
    --easing-emphasized: cubic-bezier(0.2, 0, 0, 1);
    --easing-emphasized-decelerate: cubic-bezier(0.05, 0.7, 0.1, 1);
    --easing-emphasized-accelerate: cubic-bezier(0.3, 0, 0.8, 0.15);
    --easing-linear: linear;

    /* Common transitions */
    --transition-fade: opacity var(--duration-short-4) var(--easing-standard);
    --transition-scale: transform var(--duration-medium-2)
      var(--easing-emphasized);
    --transition-slide: transform var(--duration-medium-2)
      var(--easing-emphasized);
    --transition-color: background-color var(--duration-short-2)
        var(--easing-standard),
      color var(--duration-short-2) var(--easing-standard);

    /* =====================================================
       Z-INDEX SYSTEM
       Ensures consistent layering across the application
       ===================================================== */
    --z-index-base: 0;
    --z-index-dropdown: 1000;
    --z-index-sticky: 1020;
    --z-index-fixed: 1030;
    --z-index-modal-backdrop: 1040;
    --z-index-modal: 1050;
    --z-index-popover: 1060;
    --z-index-tooltip: 1070;
    --z-index-notification: 1080;
    --z-index-top: 9999;

    /* =====================================================
       BREAKPOINTS
       Mobile-first responsive design breakpoints
       ===================================================== */
    --breakpoint-xs: 320px;
    --breakpoint-sm: 640px;
    --breakpoint-md: 768px;
    --breakpoint-lg: 1024px;
    --breakpoint-xl: 1280px;
    --breakpoint-2xl: 1536px;

    /* Container max widths */
    --container-sm: 640px;
    --container-md: 768px;
    --container-lg: 1024px;
    --container-xl: 1280px;
    --container-2xl: 1536px;

    /* =====================================================
       COMPONENT-SPECIFIC TOKENS
       ===================================================== */

    /* Buttons */
    --button-height-small: 32px;
    --button-height-medium: 40px;
    --button-height-large: 48px;
    --button-min-width: 64px;
    --button-padding-horizontal: var(--spacing-6);
    --button-padding-vertical: var(--spacing-3);
    --button-icon-size: 18px;
    --button-icon-gap: var(--spacing-2);

    /* Input fields */
    --input-height-small: 40px;
    --input-height-medium: 48px;
    --input-height-large: 56px;
    --input-padding-horizontal: var(--spacing-4);
    --input-border-width: 1px;
    --input-border-width-focused: 2px;

    /* Cards */
    --card-padding: var(--spacing-6);
    --card-gap: var(--spacing-4);

    /* Lists */
    --list-item-height-small: 40px;
    --list-item-height-medium: 56px;
    --list-item-height-large: 72px;
    --list-item-padding-horizontal: var(--spacing-4);
    --list-item-padding-vertical: var(--spacing-2);

    /* Avatar sizes */
    --avatar-size-xs: 24px;
    --avatar-size-sm: 32px;
    --avatar-size-md: 40px;
    --avatar-size-lg: 48px;
    --avatar-size-xl: 64px;
    --avatar-size-2xl: 96px;

    /* Icon sizes */
    --icon-size-xs: 16px;
    --icon-size-sm: 20px;
    --icon-size-md: 24px;
    --icon-size-lg: 32px;
    --icon-size-xl: 48px;

    /* =====================================================
       ACCESSIBILITY
       ===================================================== */

    /* Focus indicators */
    --focus-ring-width: 2px;
    --focus-ring-offset: 2px;
    --focus-ring-color: var(--md-sys-color-primary);
    --focus-ring: 0 0 0 var(--focus-ring-offset) var(--md-sys-color-background),
      0 0 0 calc(var(--focus-ring-offset) + var(--focus-ring-width))
        var(--focus-ring-color);

    /* Touch targets - minimum 48x48px for WCAG compliance */
    --touch-target-min-size: 48px;

    /* High contrast mode support */
    --high-contrast-border-width: 2px;

    /* =====================================================
       MOBILE OPTIMIZATIONS
       ===================================================== */

    /* Mobile touch optimizations */
    --mobile-tap-highlight-color: transparent;
    --mobile-scroll-behavior: smooth;

    /* Safe area insets for notched devices */
    --safe-area-inset-top: env(safe-area-inset-top);
    --safe-area-inset-right: env(safe-area-inset-right);
    --safe-area-inset-bottom: env(safe-area-inset-bottom);
    --safe-area-inset-left: env(safe-area-inset-left);
  }

  /* =====================================================
     RESPONSIVE TYPOGRAPHY
     Fluid typography that scales based on viewport
     ===================================================== */
  @media (max-width: 768px) {
    :host {
      /* Scale down typography on mobile */
      --type-display-large-size: 40px;
      --type-display-medium-size: 32px;
      --type-display-small-size: 28px;
      --type-headline-large-size: 28px;
      --type-headline-medium-size: 24px;
      --type-headline-small-size: 20px;

      /* Reduce spacing on mobile */
      --spacing-page-margin: var(--spacing-4);
      --spacing-section-margin: var(--spacing-6);
      --card-padding: var(--spacing-4);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    :host {
      /* Reduce or remove animations for users who prefer reduced motion */
      --duration-instant: 0ms;
      --duration-short-1: 0ms;
      --duration-short-2: 0ms;
      --duration-short-3: 0ms;
      --duration-short-4: 0ms;
      --duration-medium-1: 0ms;
      --duration-medium-2: 0ms;
      --duration-medium-3: 0ms;
      --duration-medium-4: 0ms;
      --duration-long-1: 0ms;
      --duration-long-2: 0ms;
      --duration-long-3: 0ms;
      --duration-long-4: 0ms;
      --easing-standard: linear;
      --easing-emphasized: linear;
    }
  }
`
