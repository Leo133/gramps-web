import {html, css, LitElement} from 'lit'
import {sharedStyles} from '../SharedStyles.js'

/**
 * Theme Preview Component
 * 
 * Shows a visual preview of light and dark themes
 * to help users choose their preferred theme.
 */
export class GrampsjsThemePreview extends LitElement {
  static get styles() {
    return [
      sharedStyles,
      css`
        :host {
          display: block;
        }

        .preview-container {
          display: flex;
          gap: 16px;
          margin-top: 16px;
        }

        .preview-card {
          flex: 1;
          border: 2px solid var(--md-sys-color-outline-variant);
          border-radius: 8px;
          padding: 12px;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
        }

        .preview-card:hover {
          border-color: var(--md-sys-color-primary);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .preview-card.selected {
          border-color: var(--md-sys-color-primary);
          border-width: 3px;
          padding: 11px;
        }

        .preview-card.selected::after {
          content: '✓';
          position: absolute;
          top: 8px;
          right: 8px;
          background: var(--md-sys-color-primary);
          color: var(--md-sys-color-on-primary);
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: bold;
        }

        .preview-label {
          font-weight: 500;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .preview-mockup {
          border-radius: 4px;
          padding: 8px;
          min-height: 80px;
        }

        /* Light theme preview */
        .preview-light {
          background: #fff;
          color: rgba(0, 0, 0, 0.8);
        }

        .preview-light .mockup-header {
          background: rgb(109, 76, 65);
          color: white;
          padding: 4px 8px;
          border-radius: 2px;
          margin-bottom: 8px;
          font-size: 12px;
        }

        .preview-light .mockup-content {
          background: #f5f5f5;
          padding: 6px;
          border-radius: 2px;
          font-size: 11px;
          margin-bottom: 4px;
        }

        /* Dark theme preview */
        .preview-dark {
          background: rgb(20, 19, 19);
          color: rgba(255, 255, 255, 0.8);
        }

        .preview-dark .mockup-header {
          background: rgb(32, 31, 31);
          color: rgba(255, 255, 255, 0.9);
          padding: 4px 8px;
          border-radius: 2px;
          margin-bottom: 8px;
          font-size: 12px;
        }

        .preview-dark .mockup-content {
          background: rgb(32, 31, 31);
          padding: 6px;
          border-radius: 2px;
          font-size: 11px;
          margin-bottom: 4px;
        }

        /* System theme preview */
        .preview-system {
          background: linear-gradient(135deg, #fff 50%, rgb(20, 19, 19) 50%);
          position: relative;
        }

        .preview-system-content {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          padding: 8px;
          border-radius: 4px;
        }

        .preview-system-text {
          font-size: 11px;
          text-align: center;
          color: var(--md-sys-color-on-surface);
        }

        @media (max-width: 768px) {
          .preview-container {
            flex-direction: column;
          }
        }
      `,
    ]
  }

  static get properties() {
    return {
      selected: {type: String}, // 'light', 'dark', or 'system'
    }
  }

  constructor() {
    super()
    this.selected = 'system'
  }

  render() {
    return html`
      <div class="preview-container" role="radiogroup" aria-label="Theme selection">
        ${this._renderLightPreview()}
        ${this._renderDarkPreview()}
        ${this._renderSystemPreview()}
      </div>
    `
  }

  _renderLightPreview() {
    return html`
      <div
        class="preview-card ${this.selected === 'light' ? 'selected' : ''}"
        @click="${() => this._selectTheme('light')}"
        role="radio"
        aria-checked="${this.selected === 'light'}"
        tabindex="0"
        @keydown="${e => this._handleKeyDown(e, 'light')}"
      >
        <div class="preview-label">Light</div>
        <div class="preview-mockup preview-light">
          <div class="mockup-header">Header</div>
          <div class="mockup-content">Content</div>
          <div class="mockup-content">Content</div>
        </div>
      </div>
    `
  }

  _renderDarkPreview() {
    return html`
      <div
        class="preview-card ${this.selected === 'dark' ? 'selected' : ''}"
        @click="${() => this._selectTheme('dark')}"
        role="radio"
        aria-checked="${this.selected === 'dark'}"
        tabindex="0"
        @keydown="${e => this._handleKeyDown(e, 'dark')}"
      >
        <div class="preview-label">Dark</div>
        <div class="preview-mockup preview-dark">
          <div class="mockup-header">Header</div>
          <div class="mockup-content">Content</div>
          <div class="mockup-content">Content</div>
        </div>
      </div>
    `
  }

  _renderSystemPreview() {
    return html`
      <div
        class="preview-card ${this.selected === 'system' ? 'selected' : ''}"
        @click="${() => this._selectTheme('system')}"
        role="radio"
        aria-checked="${this.selected === 'system'}"
        tabindex="0"
        @keydown="${e => this._handleKeyDown(e, 'system')}"
      >
        <div class="preview-label">System</div>
        <div class="preview-mockup preview-system">
          <div class="preview-system-content">
            <div class="preview-system-text">
              Follows your device's theme preference
            </div>
          </div>
        </div>
      </div>
    `
  }

  _selectTheme(theme) {
    this.selected = theme
    this.dispatchEvent(
      new CustomEvent('theme-selected', {
        detail: {theme},
        bubbles: true,
        composed: true,
      })
    )
  }

  _handleKeyDown(e, theme) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      this._selectTheme(theme)
    }
  }
}

customElements.define('grampsjs-theme-preview', GrampsjsThemePreview)
