/**
 * Gramps.js Share Dialog Component
 *
 * Phase 16: Publishing, Sharing & External Integration
 *
 * Dialog for creating and managing share links for family branches.
 */

/* eslint-disable no-alert */

import {LitElement, css, html} from 'lit'
import {sharedStyles} from '../SharedStyles.js'
import {GrampsjsAppStateMixin} from '../mixins/GrampsjsAppStateMixin.js'
import {clickKeyHandler} from '../util.js'

export class GrampsjsShareDialog extends GrampsjsAppStateMixin(LitElement) {
  static get styles() {
    return [
      sharedStyles,
      css`
        :host {
          display: block;
        }

        .dialog-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 200ms ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .dialog {
          background: var(--md-sys-color-surface);
          border-radius: var(--radius-xl, 16px);
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: var(--elevation-3);
          animation: slideUp 300ms ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dialog-header {
          padding: var(--spacing-5, 20px);
          border-bottom: 1px solid var(--md-sys-color-outline-variant);
        }

        .dialog-header h2 {
          font-size: var(--type-headline-small-size, 24px);
          font-weight: var(--font-weight-medium, 500);
          margin: 0;
          color: var(--md-sys-color-on-surface);
        }

        .dialog-header p {
          font-size: var(--type-body-medium-size, 14px);
          color: var(--md-sys-color-on-surface-variant);
          margin: var(--spacing-2, 8px) 0 0;
        }

        .dialog-body {
          padding: var(--spacing-5, 20px);
        }

        .form-group {
          margin-bottom: var(--spacing-4, 16px);
        }

        label {
          display: block;
          font-size: var(--type-body-medium-size, 14px);
          font-weight: var(--font-weight-medium, 500);
          color: var(--md-sys-color-on-surface);
          margin-bottom: var(--spacing-2, 8px);
        }

        input,
        select {
          width: 100%;
          padding: var(--spacing-3, 12px);
          border: 1px solid var(--md-sys-color-outline);
          border-radius: var(--radius-md, 8px);
          font-size: var(--type-body-medium-size, 14px);
          font-family: inherit;
          background: var(--md-sys-color-surface);
          color: var(--md-sys-color-on-surface);
          transition: var(--transition-all);
          box-sizing: border-box;
        }

        input:focus,
        select:focus {
          outline: none;
          border-color: var(--md-sys-color-primary);
          box-shadow: 0 0 0 2px var(--md-sys-color-primary-container);
        }

        .help-text {
          font-size: var(--type-body-small-size, 12px);
          color: var(--md-sys-color-on-surface-variant);
          margin-top: var(--spacing-1, 4px);
        }

        .checkbox-group {
          display: flex;
          align-items: center;
          gap: var(--spacing-2, 8px);
        }

        .checkbox-group input {
          width: auto;
        }

        .checkbox-group label {
          margin: 0;
          font-weight: normal;
        }

        .privacy-options {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--spacing-2, 8px);
        }

        .privacy-option {
          padding: var(--spacing-3, 12px);
          border: 2px solid var(--md-sys-color-outline-variant);
          border-radius: var(--radius-md, 8px);
          cursor: pointer;
          transition: var(--transition-all);
          text-align: center;
        }

        .privacy-option:hover {
          border-color: var(--md-sys-color-primary);
        }

        .privacy-option.selected {
          border-color: var(--md-sys-color-primary);
          background: var(--md-sys-color-primary-container);
        }

        .privacy-option-icon {
          font-size: 24px;
          margin-bottom: var(--spacing-1, 4px);
        }

        .privacy-option-label {
          font-size: var(--type-body-small-size, 12px);
          font-weight: var(--font-weight-medium, 500);
        }

        .dialog-footer {
          padding: var(--spacing-4, 16px) var(--spacing-5, 20px);
          border-top: 1px solid var(--md-sys-color-outline-variant);
          display: flex;
          justify-content: flex-end;
          gap: var(--spacing-2, 8px);
        }

        button {
          padding: var(--spacing-3, 12px) var(--spacing-5, 20px);
          border: none;
          border-radius: var(--radius-full);
          font-size: var(--type-label-large-size, 14px);
          font-weight: var(--font-weight-medium, 500);
          cursor: pointer;
          transition: var(--transition-all);
          font-family: inherit;
        }

        .button-primary {
          background: var(--md-sys-color-primary);
          color: var(--md-sys-color-on-primary);
        }

        .button-primary:hover {
          opacity: 0.9;
        }

        .button-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .button-secondary {
          background: transparent;
          color: var(--md-sys-color-primary);
        }

        .button-secondary:hover {
          background: var(--md-sys-color-primary-container);
        }

        .success-state {
          text-align: center;
          padding: var(--spacing-6, 24px);
        }

        .success-icon {
          font-size: 64px;
          margin-bottom: var(--spacing-4, 16px);
        }

        .share-url-container {
          background: var(--md-sys-color-surface-variant);
          padding: var(--spacing-3, 12px);
          border-radius: var(--radius-md, 8px);
          margin: var(--spacing-4, 16px) 0;
        }

        .share-url {
          font-family: monospace;
          font-size: var(--type-body-small-size, 12px);
          word-break: break-all;
          color: var(--md-sys-color-primary);
        }

        .copy-button {
          margin-top: var(--spacing-3, 12px);
          width: 100%;
        }

        @media (max-width: 480px) {
          .privacy-options {
            grid-template-columns: 1fr;
          }
        }
      `,
    ]
  }

  static get properties() {
    return {
      open: {type: Boolean},
      entityType: {type: String},
      entityId: {type: String},
      entityName: {type: String},
      loading: {type: Boolean},
      success: {type: Boolean},
      shareUrl: {type: String},
      formData: {type: Object},
    }
  }

  constructor() {
    super()
    this.open = false
    this.entityType = 'Person'
    this.entityId = ''
    this.entityName = ''
    this.loading = false
    this.success = false
    this.shareUrl = ''
    this.formData = {
      name: '',
      privacyLevel: 'public',
      maxGenerations: 5,
      expiresAt: '',
      password: '',
      usePassword: false,
      maxViews: null,
      useMaxViews: false,
    }
  }

  updated(changedProperties) {
    if (changedProperties.has('entityName') && this.entityName) {
      this.formData = {
        ...this.formData,
        name: `Share ${this.entityName}`,
      }
    }
  }

  _handleInput(field, value) {
    this.formData = {...this.formData, [field]: value}
    this.requestUpdate()
  }

  _selectPrivacy(level) {
    this.formData = {...this.formData, privacyLevel: level}
    this.requestUpdate()
  }

  _getPrivacyHelpText() {
    switch (this.formData.privacyLevel) {
      case 'public':
        return this._('Living persons will be hidden from view')
      case 'deceased':
        return this._('Only show deceased persons with full details')
      case 'living':
        return this._('Only show living persons')
      default:
        return this._('Show all persons with full details (use with caution)')
    }
  }

  async _handleSubmit() {
    this.loading = true

    try {
      const body = {
        name: this.formData.name || `Share ${this.entityName}`,
        entityType: this.entityType,
        entityId: this.entityId,
        privacyLevel: this.formData.privacyLevel,
        maxGenerations: parseInt(this.formData.maxGenerations, 10) || 5,
      }

      if (this.formData.expiresAt) {
        body.expiresAt = new Date(this.formData.expiresAt).toISOString()
      }

      if (this.formData.usePassword && this.formData.password) {
        body.password = this.formData.password
      }

      if (this.formData.useMaxViews && this.formData.maxViews) {
        body.maxViews = parseInt(this.formData.maxViews, 10)
      }

      const response = await fetch('/api/publishing/shares', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        throw new Error('Failed to create share link')
      }

      const data = await response.json()
      this.shareUrl = data.shareUrl
      this.success = true
    } catch (error) {
      console.error('Error creating share link:', error)
      alert(this._('Failed to create share link. Please try again.'))
    }

    this.loading = false
  }

  _copyUrl() {
    navigator.clipboard.writeText(this.shareUrl)
    const btn = this.renderRoot.querySelector('.copy-button')
    if (btn) {
      btn.textContent = this._('Copied!')
      setTimeout(() => {
        btn.textContent = this._('Copy Link')
      }, 2000)
    }
  }

  _close() {
    this.open = false
    this.success = false
    this.shareUrl = ''
    this.dispatchEvent(new CustomEvent('close'))
  }

  render() {
    if (!this.open) {
      return html``
    }

    return html`
      <div class="dialog-overlay" @click="${e => e.target === e.currentTarget && this._close()}" @keydown="${clickKeyHandler}">
        <div class="dialog" role="dialog" aria-labelledby="dialog-title">
          ${this.success ? this._renderSuccess() : this._renderForm()}
        </div>
      </div>
    `
  }

  _renderForm() {
    return html`
      <div class="dialog-header">
        <h2 id="dialog-title">${this._('Share')} ${this.entityName || this.entityType}</h2>
        <p>${this._('Create a shareable link for this branch of your family tree')}</p>
      </div>

      <div class="dialog-body">
        <div class="form-group">
          <label>${this._('Link Name')}</label>
          <input
            type="text"
            .value="${this.formData.name}"
            @input="${e => this._handleInput('name', e.target.value)}"
            placeholder="${this._('e.g., Share with Cousin Bob')}"
          />
          <div class="help-text">${this._('A name to help you identify this link later')}</div>
        </div>

        <div class="form-group">
          <label>${this._('Privacy Level')}</label>
          <div class="privacy-options">
            <div
              class="privacy-option ${this.formData.privacyLevel === 'public' ? 'selected' : ''}"
              @click="${() => this._selectPrivacy('public')}"
              @keydown="${clickKeyHandler}"
              tabindex="0"
              role="button"
            >
              <div class="privacy-option-icon">🌍</div>
              <div class="privacy-option-label">${this._('Public')}</div>
            </div>
            <div
              class="privacy-option ${this.formData.privacyLevel === 'deceased' ? 'selected' : ''}"
              @click="${() => this._selectPrivacy('deceased')}"
              @keydown="${clickKeyHandler}"
              tabindex="0"
              role="button"
            >
              <div class="privacy-option-icon">🔒</div>
              <div class="privacy-option-label">${this._('Deceased Only')}</div>
            </div>
            <div
              class="privacy-option ${this.formData.privacyLevel === 'living' ? 'selected' : ''}"
              @click="${() => this._selectPrivacy('living')}"
              @keydown="${clickKeyHandler}"
              tabindex="0"
              role="button"
            >
              <div class="privacy-option-icon">👥</div>
              <div class="privacy-option-label">${this._('Living Only')}</div>
            </div>
            <div
              class="privacy-option ${this.formData.privacyLevel === 'all' ? 'selected' : ''}"
              @click="${() => this._selectPrivacy('all')}"
              @keydown="${clickKeyHandler}"
              tabindex="0"
              role="button"
            >
              <div class="privacy-option-icon">👨‍👩‍👧‍👦</div>
              <div class="privacy-option-label">${this._('All Details')}</div>
            </div>
          </div>
          <div class="help-text">
            ${this._getPrivacyHelpText()}
          </div>
        </div>

        <div class="form-group">
          <label>${this._('Generations')}</label>
          <select
            .value="${this.formData.maxGenerations}"
            @change="${e => this._handleInput('maxGenerations', e.target.value)}"
          >
            <option value="2">2 ${this._('generations')}</option>
            <option value="3">3 ${this._('generations')}</option>
            <option value="4">4 ${this._('generations')}</option>
            <option value="5">5 ${this._('generations')}</option>
            <option value="7">7 ${this._('generations')}</option>
            <option value="10">10 ${this._('generations')}</option>
          </select>
        </div>

        <div class="form-group">
          <label>${this._('Expiration Date (Optional)')}</label>
          <input
            type="date"
            .value="${this.formData.expiresAt}"
            @input="${e => this._handleInput('expiresAt', e.target.value)}"
          />
          <div class="help-text">${this._('Leave empty for a permanent link')}</div>
        </div>

        <div class="form-group">
          <div class="checkbox-group">
            <input
              type="checkbox"
              id="usePassword"
              .checked="${this.formData.usePassword}"
              @change="${e => this._handleInput('usePassword', e.target.checked)}"
            />
            <label for="usePassword">${this._('Password protect this link')}</label>
          </div>
          ${this.formData.usePassword
            ? html`
                <input
                  type="password"
                  .value="${this.formData.password}"
                  @input="${e => this._handleInput('password', e.target.value)}"
                  placeholder="${this._('Enter password')}"
                  style="margin-top: 8px;"
                />
              `
            : ''}
        </div>

        <div class="form-group">
          <div class="checkbox-group">
            <input
              type="checkbox"
              id="useMaxViews"
              .checked="${this.formData.useMaxViews}"
              @change="${e => this._handleInput('useMaxViews', e.target.checked)}"
            />
            <label for="useMaxViews">${this._('Limit number of views')}</label>
          </div>
          ${this.formData.useMaxViews
            ? html`
                <input
                  type="number"
                  .value="${this.formData.maxViews}"
                  @input="${e => this._handleInput('maxViews', e.target.value)}"
                  placeholder="${this._('Max views')}"
                  min="1"
                  style="margin-top: 8px;"
                />
              `
            : ''}
        </div>
      </div>

      <div class="dialog-footer">
        <button class="button-secondary" @click="${this._close}">
          ${this._('Cancel')}
        </button>
        <button
          class="button-primary"
          @click="${this._handleSubmit}"
          ?disabled="${this.loading}"
        >
          ${this.loading ? this._('Creating...') : this._('Create Link')}
        </button>
      </div>
    `
  }

  _renderSuccess() {
    return html`
      <div class="dialog-header">
        <h2 id="dialog-title">${this._('Link Created!')}</h2>
      </div>

      <div class="dialog-body">
        <div class="success-state">
          <div class="success-icon">✅</div>
          <p>${this._('Your share link has been created successfully.')}</p>

          <div class="share-url-container">
            <div class="share-url">${this.shareUrl}</div>
          </div>

          <button class="button-primary copy-button" @click="${this._copyUrl}">
            ${this._('Copy Link')}
          </button>
        </div>
      </div>

      <div class="dialog-footer">
        <button class="button-primary" @click="${this._close}">
          ${this._('Done')}
        </button>
      </div>
    `
  }
}

customElements.define('grampsjs-share-dialog', GrampsjsShareDialog)
