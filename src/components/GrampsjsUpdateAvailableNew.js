/**
 * Gramps.js Update Available Component
 * 
 * Phase 10: UI/UX Overhaul - PWA Enhancement
 * 
 * Displays a notification when a new version of the app is available,
 * with an option to update immediately.
 */

import {LitElement, css, html} from 'lit'
import {updateServiceWorker} from './pwa.js'

export class GrampsjsUpdateAvailableNew extends LitElement {
  static get styles() {
    return css`
      :host {
        display: block;
        position: fixed;
        bottom: var(--spacing-4, 16px);
        left: var(--spacing-4, 16px);
        right: var(--spacing-4, 16px);
        z-index: var(--z-index-notification, 1080);
        max-width: 500px;
        margin: 0 auto;
      }

      .notification {
        background: var(--md-sys-color-surface-container-high);
        color: var(--md-sys-color-on-surface);
        padding: var(--spacing-4, 16px) var(--spacing-5, 20px);
        border-radius: var(--radius-lg, 12px);
        box-shadow: var(--elevation-5);
        display: flex;
        align-items: center;
        gap: var(--spacing-4, 16px);
        animation: slideUp var(--duration-medium-2, 300ms) var(--easing-emphasized);
        border: 1px solid var(--md-sys-color-outline-variant);
      }

      @keyframes slideUp {
        from {
          transform: translateY(100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      .icon {
        flex-shrink: 0;
        width: 40px;
        height: 40px;
        border-radius: var(--radius-full);
        background: var(--md-sys-color-primary-container);
        color: var(--md-sys-color-on-primary-container);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .content {
        flex: 1;
        min-width: 0;
      }

      .title {
        font-size: var(--type-title-medium-size, 16px);
        font-weight: var(--font-weight-medium, 500);
        line-height: var(--type-title-medium-line-height, 24px);
        margin: 0 0 var(--spacing-1, 4px) 0;
      }

      .message {
        font-size: var(--type-body-small-size, 12px);
        line-height: var(--type-body-small-line-height, 16px);
        color: var(--md-sys-color-on-surface-variant);
        margin: 0;
      }

      .actions {
        display: flex;
        gap: var(--spacing-2, 8px);
        flex-shrink: 0;
      }

      button {
        min-height: var(--button-height-small, 32px);
        padding: var(--spacing-2, 8px) var(--spacing-4, 16px);
        border: none;
        border-radius: var(--radius-full);
        font-size: var(--type-label-large-size, 14px);
        font-weight: var(--font-weight-medium, 500);
        cursor: pointer;
        transition: var(--transition-color);
        font-family: inherit;
      }

      .button-primary {
        background: var(--md-sys-color-primary);
        color: var(--md-sys-color-on-primary);
      }

      .button-primary:hover {
        background: var(--md-sys-color-primary);
        opacity: 0.9;
      }

      .button-primary:focus {
        outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color);
        outline-offset: var(--focus-ring-offset, 2px);
      }

      .button-text {
        background: transparent;
        color: var(--md-sys-color-primary);
      }

      .button-text:hover {
        background: var(--md-sys-color-primary-container);
      }

      .button-text:focus {
        outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color);
        outline-offset: var(--focus-ring-offset, 2px);
      }

      @media (max-width: 768px) {
        :host {
          bottom: var(--safe-area-inset-bottom, var(--spacing-4, 16px));
          left: var(--safe-area-inset-left, var(--spacing-2, 8px));
          right: var(--safe-area-inset-right, var(--spacing-2, 8px));
        }

        .notification {
          flex-direction: column;
          align-items: stretch;
          padding: var(--spacing-3, 12px);
        }

        .actions {
          justify-content: flex-end;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .notification {
          animation: none;
        }
      }
    `
  }

  static get properties() {
    return {
      visible: {type: Boolean},
      message: {type: String},
    }
  }

  constructor() {
    super()
    this.visible = false
    this.message = 'A new version is available'
  }

  connectedCallback() {
    super.connectedCallback()
    
    // Listen for update available event
    window.addEventListener('app-update-available', this._handleUpdateAvailable.bind(this))
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    window.removeEventListener('app-update-available', this._handleUpdateAvailable.bind(this))
  }

  _handleUpdateAvailable(event) {
    this.visible = true
    if (event.detail?.message) {
      this.message = event.detail.message
    }
  }

  _handleUpdate() {
    // Update the service worker
    updateServiceWorker()
  }

  _handleDismiss() {
    this.visible = false
  }

  render() {
    if (!this.visible) {
      return html``
    }

    return html`
      <div class="notification" role="alert" aria-live="polite">
        <div class="icon" aria-hidden="true">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M16 16h5v5" />
          </svg>
        </div>
        
        <div class="content">
          <p class="title">Update Available</p>
          <p class="message">${this.message}</p>
        </div>
        
        <div class="actions">
          <button
            class="button-text"
            @click="${this._handleDismiss}"
            aria-label="Dismiss update notification"
          >
            Later
          </button>
          <button
            class="button-primary"
            @click="${this._handleUpdate}"
            aria-label="Update app now"
          >
            Update
          </button>
        </div>
      </div>
    `
  }
}

customElements.define('grampsjs-update-available-new', GrampsjsUpdateAvailableNew)
