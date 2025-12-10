import {LitElement, html, css} from 'lit'

/**
 * Offline Indicator Component
 * Phase 11: Shows when the app is offline
 */
export class OfflineIndicator extends LitElement {
  static get properties() {
    return {
      offline: {type: Boolean},
      message: {type: String},
      type: {type: String}, // 'network' or 'server'
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

    button {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
    }

    button:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  `

  constructor() {
    super()
    this.offline = false
    this.message = ''
    this.type = ''
    this.handleOnline = this.handleOnline.bind(this)
    this.handleOffline = this.handleOffline.bind(this)
    this.handleApiError = this.handleApiError.bind(this)
  }

  connectedCallback() {
    super.connectedCallback()
    this.offline = !navigator.onLine
    window.addEventListener('online', this.handleOnline)
    window.addEventListener('offline', this.handleOffline)
    window.addEventListener('api:error', this.handleApiError)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    window.removeEventListener('online', this.handleOnline)
    window.removeEventListener('offline', this.handleOffline)
    window.removeEventListener('api:error', this.handleApiError)
  }

  handleOnline() {
    this.offline = false
    this.message = 'Back online'
    this.type = 'network'
    // Auto-hide after 3 seconds when coming online
    setTimeout(() => {
      this.offline = false
      this.message = ''
    }, 3000)
  }

  handleOffline() {
    this.offline = true
    this.message = 'You are offline'
    this.type = 'network'
  }

  handleApiError(e) {
    this.offline = true
    this.message = e.detail.error
    this.type = e.detail.type
  }

  // eslint-disable-next-line class-methods-use-this
  reload() {
    window.location.reload()
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
          ${isOnline
            ? html`<path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
              ></path>`
            : html`<path
                d="M23.64 7c-.45-.34-4.93-4-11.64-4-1.5 0-2.89.19-4.15.48L18.18 13.8 23.64 7zm-6.6 8.22L3.27 1.44 2 2.72l2.05 2.06C1.91 5.76.59 6.82.36 7l11.63 14.49.01.01.01-.01 3.9-4.86 3.32 3.32 1.27-1.27-3.46-3.46z"
              ></path>`}
        </svg>
        <span class="message"
          >${this.message ||
          (this.offline ? 'You are offline' : 'Back online')}</span
        >
        ${this.offline && this.type === 'server'
          ? html`<button @click=${this.reload}>Retry</button>`
          : ''}
      </div>
    `
  }
}

customElements.define('offline-indicator', OfflineIndicator)
