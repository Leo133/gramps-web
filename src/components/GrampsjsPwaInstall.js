import {html, css, LitElement} from 'lit'
import '@material/mwc-button'
import '@material/mwc-icon'
import '@material/mwc-icon-button'
import {sharedStyles} from '../SharedStyles.js'
import {showInstallPrompt, isInstalledPWA, isInstallAvailable} from '../pwa.js'

/**
 * PWA Install Banner Component
 * 
 * Shows a banner prompting users to install the app as a PWA
 * when the install prompt is available.
 */
export class GrampsjsPwaInstall extends LitElement {
  static get styles() {
    return [
      sharedStyles,
      css`
        :host {
          display: block;
        }

        .install-banner {
          position: fixed;
          bottom: 16px;
          left: 50%;
          transform: translateX(-50%);
          max-width: 500px;
          width: calc(100% - 32px);
          background: var(--md-sys-color-primary-container);
          color: var(--md-sys-color-on-primary-container);
          padding: 16px;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
          display: flex;
          align-items: center;
          gap: 12px;
          z-index: 1000;
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            transform: translateX(-50%) translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
        }

        .install-banner.hidden {
          display: none;
        }

        .banner-content {
          flex: 1;
        }

        .banner-title {
          font-weight: 500;
          font-size: 16px;
          margin-bottom: 4px;
        }

        .banner-text {
          font-size: 14px;
          opacity: 0.9;
        }

        .banner-actions {
          display: flex;
          gap: 8px;
        }

        mwc-icon {
          --mdc-icon-size: 24px;
        }

        @media (max-width: 768px) {
          .install-banner {
            bottom: 8px;
            width: calc(100% - 16px);
            padding: 12px;
          }

          .banner-title {
            font-size: 14px;
          }

          .banner-text {
            font-size: 13px;
          }
        }
      `,
    ]
  }

  static get properties() {
    return {
      _showBanner: {type: Boolean},
      _isInstalled: {type: Boolean},
    }
  }

  constructor() {
    super()
    this._showBanner = false
    this._isInstalled = false
  }

  connectedCallback() {
    super.connectedCallback()

    // Check if already installed
    this._isInstalled = isInstalledPWA()

    if (!this._isInstalled) {
      // Listen for install availability
      window.addEventListener('pwa-install-available', () => {
        this._showBanner = true
      })

      // Listen for successful installation
      window.addEventListener('pwa-installed', () => {
        this._isInstalled = true
        this._showBanner = false
      })

      // Check if install is available now
      if (isInstallAvailable()) {
        this._showBanner = true
      }
    }
  }

  render() {
    if (this._isInstalled || !this._showBanner) {
      return html``
    }

    return html`
      <div class="install-banner" role="dialog" aria-labelledby="install-title" aria-describedby="install-desc">
        <mwc-icon>download</mwc-icon>
        <div class="banner-content">
          <div class="banner-title" id="install-title">Install Gramps Web</div>
          <div class="banner-text" id="install-desc">
            Get quick access and work offline
          </div>
        </div>
        <div class="banner-actions">
          <mwc-button
            outlined
            label="Install"
            @click="${this._handleInstall}"
            aria-label="Install Gramps Web as an app"
          ></mwc-button>
          <mwc-icon-button
            icon="close"
            @click="${this._handleDismiss}"
            aria-label="Dismiss install prompt"
          ></mwc-icon-button>
        </div>
      </div>
    `
  }

  async _handleInstall() {
    const accepted = await showInstallPrompt()
    if (accepted) {
      this._showBanner = false
    }
  }

  _handleDismiss() {
    this._showBanner = false
    // Remember dismissal for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true')
  }
}

customElements.define('grampsjs-pwa-install', GrampsjsPwaInstall)
