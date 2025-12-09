/**
 * Gramps.js PWA Install Prompt Component
 *
 * Phase 10: UI/UX Overhaul - PWA Enhancement
 *
 * Displays a prompt to install the app as a PWA when available.
 */

import {LitElement, css, html} from 'lit'
import {showInstallPrompt} from '../pwa.js'

export class GrampsjsInstallPrompt extends LitElement {
  static get styles() {
    return css`
      :host {
        display: block;
      }

      .install-banner {
        background: var(--md-sys-color-primary-container);
        color: var(--md-sys-color-on-primary-container);
        padding: var(--spacing-4, 16px);
        border-radius: var(--radius-lg, 12px);
        display: flex;
        align-items: center;
        gap: var(--spacing-4, 16px);
        margin: var(--spacing-4, 16px);
        animation: fadeIn var(--duration-medium-2, 300ms)
          var(--easing-emphasized);
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .icon {
        flex-shrink: 0;
        width: 48px;
        height: 48px;
        border-radius: var(--radius-md, 8px);
        background: var(--md-sys-color-surface);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .icon img {
        width: 40px;
        height: 40px;
        border-radius: var(--radius-sm, 4px);
      }

      .content {
        flex: 1;
        min-width: 0;
      }

      .title {
        font-size: var(--type-title-medium-size, 16px);
        font-weight: var(--font-weight-semibold, 600);
        line-height: var(--type-title-medium-line-height, 24px);
        margin: 0 0 var(--spacing-1, 4px) 0;
      }

      .description {
        font-size: var(--type-body-small-size, 12px);
        line-height: var(--type-body-small-line-height, 16px);
        opacity: 0.9;
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

      .button-install {
        background: var(--md-sys-color-primary);
        color: var(--md-sys-color-on-primary);
      }

      .button-install:hover {
        opacity: 0.9;
      }

      .button-install:focus {
        outline: var(--focus-ring-width, 2px) solid
          var(--md-sys-color-on-primary-container);
        outline-offset: var(--focus-ring-offset, 2px);
      }

      .button-close {
        background: transparent;
        color: currentColor;
        padding: var(--spacing-2, 8px);
        min-width: auto;
      }

      .button-close:hover {
        background: var(--md-sys-color-surface-variant);
      }

      .button-close:focus {
        outline: var(--focus-ring-width, 2px) solid
          var(--md-sys-color-on-primary-container);
        outline-offset: var(--focus-ring-offset, 2px);
      }

      @media (max-width: 768px) {
        .install-banner {
          flex-direction: column;
          text-align: center;
          padding: var(--spacing-3, 12px);
        }

        .actions {
          width: 100%;
          justify-content: center;
        }

        .button-install {
          flex: 1;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .install-banner {
          animation: none;
        }
      }
    `
  }

  static get properties() {
    return {
      visible: {type: Boolean},
      dismissed: {type: Boolean},
    }
  }

  constructor() {
    super()
    this.visible = false
    this.dismissed = false
  }

  connectedCallback() {
    super.connectedCallback()

    // Check if user previously dismissed
    this.dismissed = localStorage.getItem('pwa-install-dismissed') === 'true'

    // Listen for installable event
    window.addEventListener(
      'app-installable',
      this._handleInstallable.bind(this)
    )

    // Listen for installed event
    window.addEventListener('app-installed', this._handleInstalled.bind(this))
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    window.removeEventListener(
      'app-installable',
      this._handleInstallable.bind(this)
    )
    window.removeEventListener(
      'app-installed',
      this._handleInstalled.bind(this)
    )
  }

  _handleInstallable() {
    if (!this.dismissed) {
      this.visible = true
    }
  }

  _handleInstalled() {
    this.visible = false
  }

  async _handleInstall() {
    const accepted = await showInstallPrompt()
    if (accepted) {
      this.visible = false
    }
  }

  _handleDismiss() {
    this.visible = false
    this.dismissed = true
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  render() {
    if (!this.visible) {
      return html``
    }

    return html`
      <div class="install-banner" role="region" aria-label="Install app prompt">
        <div class="icon" aria-hidden="true">
          <img src="/images/icon192.png" alt="Gramps Web icon" />
        </div>

        <div class="content">
          <p class="title">Install Gramps Web</p>
          <p class="description">
            Install the app for a faster, more reliable experience with offline
            access
          </p>
        </div>

        <div class="actions">
          <button
            class="button-install"
            @click="${this._handleInstall}"
            aria-label="Install Gramps Web app"
          >
            Install
          </button>
          <button
            class="button-close"
            @click="${this._handleDismiss}"
            aria-label="Dismiss install prompt"
          >
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
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    `
  }
}

customElements.define('grampsjs-install-prompt', GrampsjsInstallPrompt)
