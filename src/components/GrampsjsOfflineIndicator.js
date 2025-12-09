/**
 * Gramps.js Offline Indicator Component
 * 
 * Phase 10: UI/UX Overhaul - PWA Enhancement
 * 
 * Displays an indicator when the app is offline.
 */

import {LitElement, css, html} from 'lit'

export class GrampsjsOfflineIndicator extends LitElement {
  static get styles() {
    return css`
      :host {
        display: block;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: var(--z-index-notification, 1080);
      }

      .offline-bar {
        background: var(--md-sys-color-error-container);
        color: var(--md-sys-color-on-error-container);
        padding: var(--spacing-2, 8px) var(--spacing-4, 16px);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-2, 8px);
        font-size: var(--type-label-large-size, 14px);
        font-weight: var(--font-weight-medium, 500);
        animation: slideDown var(--duration-medium-2, 300ms) var(--easing-emphasized);
        box-shadow: var(--elevation-1);
      }

      @keyframes slideDown {
        from {
          transform: translateY(-100%);
        }
        to {
          transform: translateY(0);
        }
      }

      .online-bar {
        background: var(--md-sys-color-tertiary-container);
        color: var(--md-sys-color-on-tertiary-container);
        animation: slideDown var(--duration-medium-2, 300ms) var(--easing-emphasized);
      }

      .icon {
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .pulse {
        animation: pulse 2s ease-in-out infinite;
      }

      @keyframes pulse {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .offline-bar,
        .online-bar {
          animation: none;
        }

        .pulse {
          animation: none;
        }
      }

      @supports (padding: max(0px)) {
        .offline-bar,
        .online-bar {
          padding-top: max(var(--spacing-2, 8px), var(--safe-area-inset-top, 0));
          padding-left: max(var(--spacing-4, 16px), var(--safe-area-inset-left, 0));
          padding-right: max(var(--spacing-4, 16px), var(--safe-area-inset-right, 0));
        }
      }
    `
  }

  static get properties() {
    return {
      online: {type: Boolean},
      showOnline: {type: Boolean},
    }
  }

  constructor() {
    super()
    this.online = navigator.onLine
    this.showOnline = false
    this._onlineTimeout = null
  }

  connectedCallback() {
    super.connectedCallback()
    
    // Listen for online/offline events
    window.addEventListener('online-status-changed', this._handleStatusChange.bind(this))
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    window.removeEventListener('online-status-changed', this._handleStatusChange.bind(this))
    
    if (this._onlineTimeout) {
      clearTimeout(this._onlineTimeout)
    }
  }

  _handleStatusChange(event) {
    this.online = event.detail.online
    
    if (this.online) {
      // Show "back online" message temporarily
      this.showOnline = true
      
      // Hide after 3 seconds
      if (this._onlineTimeout) {
        clearTimeout(this._onlineTimeout)
      }
      this._onlineTimeout = setTimeout(() => {
        this.showOnline = false
      }, 3000)
    } else {
      // Show offline indicator immediately
      this.showOnline = false
      
      // Announce to screen readers
      this._announceOffline()
    }
  }

  _announceOffline() {
    const liveRegion = document.querySelector('[aria-live="polite"]')
    if (liveRegion) {
      liveRegion.textContent = 'You are now offline. Some features may not be available.'
      setTimeout(() => {
        liveRegion.textContent = ''
      }, 1000)
    }
  }

  render() {
    if (this.online && !this.showOnline) {
      return html``
    }

    if (!this.online) {
      return html`
        <div class="offline-bar" role="status" aria-live="polite">
          <div class="icon pulse" aria-hidden="true">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="1" y1="1" x2="23" y2="23"></line>
              <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
              <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
              <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
              <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
              <circle cx="12" cy="20" r="1"></circle>
            </svg>
          </div>
          <span>You're offline. Some features may not be available.</span>
        </div>
      `
    }

    return html`
      <div class="online-bar" role="status" aria-live="polite">
        <div class="icon" aria-hidden="true">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <span>Back online</span>
      </div>
    `
  }
}

customElements.define('grampsjs-offline-indicator', GrampsjsOfflineIndicator)
