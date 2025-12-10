import {LitElement, html, css} from 'lit'
import {io} from 'socket.io-client'
import {designTokens} from '../design-tokens.js'

export class GrampsjsWebSocketStatus extends LitElement {
  static get styles() {
    return [
      designTokens,
      css`
        :host {
          display: block;
          padding: 8px;
        }
        .status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.875rem;
        }
        .indicator {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: var(--color-error, #f44336);
        }
        .indicator.connected {
          background-color: var(--color-success, #4caf50);
        }
      `,
    ]
  }

  static get properties() {
    return {
      connected: {type: Boolean},
      url: {type: String},
    }
  }

  constructor() {
    super()
    this.connected = false
    this.url = 'http://localhost:3000'
    this.socket = null
  }

  firstUpdated() {
    this.connect()
  }

  connect() {
    if (this.socket) {
      this.socket.disconnect()
    }

    this.socket = io(this.url)

    this.socket.on('connect', () => {
      this.connected = true
      this.dispatchEvent(new CustomEvent('connected'))
    })

    this.socket.on('disconnect', () => {
      this.connected = false
      this.dispatchEvent(new CustomEvent('disconnected'))
    })
  }

  render() {
    return html`
      <div class="status">
        <div class="indicator ${this.connected ? 'connected' : ''}"></div>
        <span>${this.connected ? 'Connected' : 'Disconnected'}</span>
      </div>
    `
  }
}

customElements.define('grampsjs-websocket-status', GrampsjsWebSocketStatus)
