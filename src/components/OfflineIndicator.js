import {LitElement, html, css} from 'lit'

/**
 * Offline Indicator Component
 * Phase 11: Shows when the app is offline
 */
export class OfflineIndicator extends LitElement {
  static get properties() {
    return {
      offline: {type: Boolean},
    }
  }

  static styles = css`
    :host {
      display: block;
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 9999;
    }

    .indicator {
      background: #f44336;
      color: white;
      padding: 12px 24px;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      display: flex;
      align-items: center;
      gap: 12px;
      opacity: 0;
      transform: translateY(100px);
      transition: all 0.3s ease;
    }

    .indicator.visible {
      opacity: 1;
      transform: translateY(0);
    }

    .indicator.online {
      background: #4caf50;
    }

    .icon {
      width: 24px;
      height: 24px;
    }

    .message {
      font-size: 14px;
      font-weight: 500;
    }
  `

  constructor() {
    super()
    this.offline = false
    this.handleOnline = this.handleOnline.bind(this)
    this.handleOffline = this.handleOffline.bind(this)
  }

  connectedCallback() {
    super.connectedCallback()
    this.offline = !navigator.onLine
    window.addEventListener('online', this.handleOnline)
    window.addEventListener('offline', this.handleOffline)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    window.removeEventListener('online', this.handleOnline)
    window.removeEventListener('offline', this.handleOffline)
  }

  handleOnline() {
    this.offline = false
    // Auto-hide after 3 seconds when coming online
    setTimeout(() => {
      this.offline = false
    }, 3000)
  }

  handleOffline() {
    this.offline = true
  }

  render() {
    if (!this.offline && !navigator.onLine) {
      return html``
    }

    const isOnline = !this.offline && navigator.onLine

    return html`
      <div
        class="indicator ${this.offline || isOnline ? 'visible' : ''} ${isOnline
          ? 'online'
          : ''}"
      >
        <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
          ${this.offline
            ? html`
                <path
                  d="M23.64 7c-.45-.34-4.93-4-11.64-4-1.5 0-2.89.19-4.15.48L18.18 13.8 23.64 7zm-6.6 8.22L3.27 1.44 2 2.72l2.05 2.06C1.91 5.76.59 6.82.36 7l11.63 14.49.01.01.01-.01 3.9-4.86 3.32 3.32 1.27-1.27-3.46-3.46z"
                ></path>
              `
            : html`
                <path
                  d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"
                ></path>
              `}
        </svg>
        <span class="message">
          ${this.offline
            ? 'You are offline. Viewing cached data.'
            : 'Back online!'}
        </span>
      </div>
    `
  }
}

customElements.define('offline-indicator', OfflineIndicator)
