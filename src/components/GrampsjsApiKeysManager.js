/**
 * Gramps.js API Keys Manager Component
 *
 * Phase 16: Publishing, Sharing & External Integration
 *
 * Component for managing API keys for third-party integrations.
 */

/* eslint-disable no-alert, no-restricted-globals */

import {LitElement, css, html} from 'lit'
import {sharedStyles} from '../SharedStyles.js'
import {GrampsjsAppStateMixin} from '../mixins/GrampsjsAppStateMixin.js'

export class GrampsjsApiKeysManager extends GrampsjsAppStateMixin(LitElement) {
  static get styles() {
    return [
      sharedStyles,
      css`
        :host {
          display: block;
          padding: var(--spacing-4, 16px);
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-6, 24px);
        }

        .header h1 {
          font-size: var(--type-headline-medium-size, 28px);
          font-weight: var(--font-weight-medium, 500);
          margin: 0;
          color: var(--md-sys-color-on-surface);
        }

        .create-button {
          padding: var(--spacing-3, 12px) var(--spacing-5, 20px);
          background: var(--md-sys-color-primary);
          color: var(--md-sys-color-on-primary);
          border: none;
          border-radius: var(--radius-full);
          font-size: var(--type-label-large-size, 14px);
          font-weight: var(--font-weight-medium, 500);
          cursor: pointer;
          font-family: inherit;
        }

        .create-button:hover {
          opacity: 0.9;
        }

        .api-keys-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-3, 12px);
        }

        .api-key-card {
          background: var(--md-sys-color-surface);
          border: 1px solid var(--md-sys-color-outline-variant);
          border-radius: var(--radius-lg, 12px);
          padding: var(--spacing-4, 16px);
        }

        .api-key-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--spacing-3, 12px);
        }

        .api-key-name {
          font-size: var(--type-title-medium-size, 16px);
          font-weight: var(--font-weight-medium, 500);
          margin: 0;
          color: var(--md-sys-color-on-surface);
        }

        .api-key-prefix {
          font-family: monospace;
          font-size: var(--type-body-small-size, 12px);
          color: var(--md-sys-color-on-surface-variant);
          background: var(--md-sys-color-surface-variant);
          padding: var(--spacing-1, 4px) var(--spacing-2, 8px);
          border-radius: var(--radius-sm, 4px);
          margin-top: var(--spacing-1, 4px);
        }

        .api-key-status {
          display: inline-flex;
          align-items: center;
          gap: var(--spacing-1, 4px);
          padding: var(--spacing-1, 4px) var(--spacing-2, 8px);
          border-radius: var(--radius-full);
          font-size: var(--type-body-small-size, 12px);
          font-weight: var(--font-weight-medium, 500);
        }

        .status-active {
          background: #e8f5e9;
          color: #2e7d32;
        }

        .status-disabled {
          background: #ffebee;
          color: #c62828;
        }

        .api-key-info {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-4, 16px);
          margin-bottom: var(--spacing-3, 12px);
        }

        .info-item {
          font-size: var(--type-body-small-size, 12px);
          color: var(--md-sys-color-on-surface-variant);
        }

        .info-label {
          font-weight: var(--font-weight-medium, 500);
        }

        .permissions-list {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-1, 4px);
        }

        .permission-badge {
          font-size: 10px;
          padding: 2px 6px;
          background: var(--md-sys-color-secondary-container);
          color: var(--md-sys-color-on-secondary-container);
          border-radius: var(--radius-sm, 4px);
        }

        .api-key-actions {
          display: flex;
          gap: var(--spacing-2, 8px);
          margin-top: var(--spacing-3, 12px);
          padding-top: var(--spacing-3, 12px);
          border-top: 1px solid var(--md-sys-color-outline-variant);
        }

        .action-button {
          padding: var(--spacing-2, 8px) var(--spacing-3, 12px);
          border: 1px solid var(--md-sys-color-outline);
          background: transparent;
          border-radius: var(--radius-md, 8px);
          font-size: var(--type-body-small-size, 12px);
          cursor: pointer;
          font-family: inherit;
          color: var(--md-sys-color-on-surface);
        }

        .action-button:hover {
          background: var(--md-sys-color-surface-variant);
        }

        .action-button.danger {
          color: #c62828;
          border-color: #c62828;
        }

        .action-button.danger:hover {
          background: #ffebee;
        }

        .empty-state {
          text-align: center;
          padding: var(--spacing-8, 32px);
          background: var(--md-sys-color-surface);
          border: 1px dashed var(--md-sys-color-outline);
          border-radius: var(--radius-lg, 12px);
        }

        .empty-state-icon {
          font-size: 48px;
          margin-bottom: var(--spacing-3, 12px);
        }

        .empty-state-title {
          font-size: var(--type-title-medium-size, 16px);
          font-weight: var(--font-weight-medium, 500);
          margin: 0 0 var(--spacing-2, 8px);
        }

        .empty-state-description {
          font-size: var(--type-body-medium-size, 14px);
          color: var(--md-sys-color-on-surface-variant);
          margin: 0;
        }

        /* Create Dialog */
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
        }

        .dialog {
          background: var(--md-sys-color-surface);
          border-radius: var(--radius-xl, 16px);
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: var(--elevation-3);
        }

        .dialog-header {
          padding: var(--spacing-5, 20px);
          border-bottom: 1px solid var(--md-sys-color-outline-variant);
        }

        .dialog-header h2 {
          font-size: var(--type-headline-small-size, 24px);
          margin: 0;
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
          box-sizing: border-box;
        }

        .checkbox-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--spacing-2, 8px);
        }

        .checkbox-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-2, 8px);
          font-size: var(--type-body-small-size, 12px);
        }

        .checkbox-item input {
          width: auto;
        }

        .dialog-footer {
          padding: var(--spacing-4, 16px) var(--spacing-5, 20px);
          border-top: 1px solid var(--md-sys-color-outline-variant);
          display: flex;
          justify-content: flex-end;
          gap: var(--spacing-2, 8px);
        }

        .button-secondary {
          padding: var(--spacing-3, 12px) var(--spacing-5, 20px);
          background: transparent;
          color: var(--md-sys-color-primary);
          border: none;
          border-radius: var(--radius-full);
          cursor: pointer;
          font-family: inherit;
        }

        .button-primary {
          padding: var(--spacing-3, 12px) var(--spacing-5, 20px);
          background: var(--md-sys-color-primary);
          color: var(--md-sys-color-on-primary);
          border: none;
          border-radius: var(--radius-full);
          cursor: pointer;
          font-family: inherit;
        }

        /* Success Dialog */
        .success-content {
          text-align: center;
        }

        .success-icon {
          font-size: 64px;
          margin-bottom: var(--spacing-3, 12px);
        }

        .key-display {
          background: #1e1e1e;
          color: #d4d4d4;
          padding: var(--spacing-4, 16px);
          border-radius: var(--radius-md, 8px);
          font-family: monospace;
          font-size: 14px;
          word-break: break-all;
          margin: var(--spacing-4, 16px) 0;
        }

        .warning-text {
          font-size: var(--type-body-small-size, 12px);
          color: #c62828;
          background: #ffebee;
          padding: var(--spacing-3, 12px);
          border-radius: var(--radius-md, 8px);
          margin-top: var(--spacing-3, 12px);
        }
      `,
    ]
  }

  static get properties() {
    return {
      apiKeys: {type: Array},
      loading: {type: Boolean},
      showCreateDialog: {type: Boolean},
      showSuccessDialog: {type: Boolean},
      newKey: {type: Object},
      formData: {type: Object},
      availablePermissions: {type: Array},
    }
  }

  constructor() {
    super()
    this.apiKeys = []
    this.loading = true
    this.showCreateDialog = false
    this.showSuccessDialog = false
    this.newKey = null
    this.formData = {
      name: '',
      permissions: [],
      rateLimit: 1000,
      expiresAt: '',
    }
    this.availablePermissions = [
      'read:people',
      'read:families',
      'read:events',
      'read:places',
      'read:media',
      'read:sources',
      'write:people',
      'write:families',
      'visualizations',
      'search',
      'export',
    ]
  }

  async connectedCallback() {
    super.connectedCallback()
    await this._loadApiKeys()
  }

  async _loadApiKeys() {
    this.loading = true
    try {
      const response = await fetch('/api/publishing/api-keys')
      if (response.ok) {
        this.apiKeys = await response.json()
      }
    } catch (error) {
      console.error('Error loading API keys:', error)
    }
    this.loading = false
  }

  _openCreateDialog() {
    this.formData = {
      name: '',
      permissions: ['read:people', 'read:families'],
      rateLimit: 1000,
      expiresAt: '',
    }
    this.showCreateDialog = true
  }

  _closeDialog() {
    this.showCreateDialog = false
    this.showSuccessDialog = false
    this.newKey = null
  }

  _togglePermission(permission) {
    if (this.formData.permissions.includes(permission)) {
      this.formData = {
        ...this.formData,
        permissions: this.formData.permissions.filter(p => p !== permission),
      }
    } else {
      this.formData = {
        ...this.formData,
        permissions: [...this.formData.permissions, permission],
      }
    }
    this.requestUpdate()
  }

  async _createApiKey() {
    try {
      const response = await fetch('/api/publishing/api-keys', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(this.formData),
      })

      if (!response.ok) {
        throw new Error('Failed to create API key')
      }

      const data = await response.json()
      this.newKey = data
      this.showCreateDialog = false
      this.showSuccessDialog = true
      await this._loadApiKeys()
    } catch (error) {
      console.error('Error creating API key:', error)
      alert(this._('Failed to create API key'))
    }
  }

  async _toggleKeyStatus(keyId, enabled) {
    try {
      const endpoint = enabled ? 'enable' : 'disable'
      await fetch(`/api/publishing/api-keys/${keyId}/${endpoint}`, {
        method: 'POST',
      })
      await this._loadApiKeys()
    } catch (error) {
      console.error('Error toggling API key:', error)
    }
  }

  async _revokeKey(keyId) {
    if (!confirm(this._('Are you sure you want to revoke this API key?'))) {
      return
    }

    try {
      await fetch(`/api/publishing/api-keys/${keyId}`, {
        method: 'DELETE',
      })
      await this._loadApiKeys()
    } catch (error) {
      console.error('Error revoking API key:', error)
    }
  }

  _copyKey() {
    navigator.clipboard.writeText(this.newKey.key)
    alert(this._('API key copied to clipboard'))
  }

  render() {
    if (this.loading) {
      return html`<p>${this._('Loading')}...</p>`
    }

    return html`
      <div class="header">
        <h1>${this._('API Keys')}</h1>
        <button class="create-button" @click="${this._openCreateDialog}">
          ${this._('Create API Key')}
        </button>
      </div>

      ${this.apiKeys.length === 0
        ? this._renderEmptyState()
        : this._renderApiKeysList()}
      ${this.showCreateDialog ? this._renderCreateDialog() : ''}
      ${this.showSuccessDialog ? this._renderSuccessDialog() : ''}
    `
  }

  _renderEmptyState() {
    return html`
      <div class="empty-state">
        <div class="empty-state-icon">🔑</div>
        <p class="empty-state-title">${this._('No API Keys Yet')}</p>
        <p class="empty-state-description">
          ${this._('Create an API key to enable third-party integrations')}
        </p>
      </div>
    `
  }

  _renderApiKeysList() {
    return html`
      <div class="api-keys-list">
        ${this.apiKeys.map(key => this._renderApiKeyCard(key))}
      </div>
    `
  }

  _renderApiKeyCard(key) {
    return html`
      <div class="api-key-card">
        <div class="api-key-header">
          <div>
            <h3 class="api-key-name">${key.name}</h3>
            <div class="api-key-prefix">${key.keyPrefix}</div>
          </div>
          <span class="api-key-status ${key.enabled ? 'status-active' : 'status-disabled'}">
            ${key.enabled ? '✓ Active' : '✕ Disabled'}
          </span>
        </div>

        <div class="api-key-info">
          <div class="info-item">
            <span class="info-label">${this._('Rate Limit')}:</span>
            ${key.rateLimit}/hr
          </div>
          <div class="info-item">
            <span class="info-label">${this._('Last Used')}:</span>
            ${key.lastUsed
              ? new Date(key.lastUsed).toLocaleDateString()
              : 'Never'}
          </div>
          <div class="info-item">
            <span class="info-label">${this._('Created')}:</span>
            ${new Date(key.createdAt).toLocaleDateString()}
          </div>
        </div>

        <div class="permissions-list">
          ${(key.permissions || []).map(
            perm => html`<span class="permission-badge">${perm}</span>`
          )}
        </div>

        <div class="api-key-actions">
          <button
            class="action-button"
            @click="${() => this._toggleKeyStatus(key.id, !key.enabled)}"
          >
            ${key.enabled ? this._('Disable') : this._('Enable')}
          </button>
          <button
            class="action-button danger"
            @click="${() => this._revokeKey(key.id)}"
          >
            ${this._('Revoke')}
          </button>
        </div>
      </div>
    `
  }

  _renderCreateDialog() {
    return html`
      <div class="dialog-overlay" @click="${e => e.target === e.currentTarget && this._closeDialog()}">
        <div class="dialog">
          <div class="dialog-header">
            <h2>${this._('Create API Key')}</h2>
          </div>

          <div class="dialog-body">
            <div class="form-group">
              <label>${this._('Name')}</label>
              <input
                type="text"
                .value="${this.formData.name}"
                @input="${e => (this.formData = {...this.formData, name: e.target.value})}"
                placeholder="${this._('e.g., Mobile App')}"
              />
            </div>

            <div class="form-group">
              <label>${this._('Permissions')}</label>
              <div class="checkbox-grid">
                ${this.availablePermissions.map(
                  perm => html`
                    <div class="checkbox-item">
                      <input
                        type="checkbox"
                        .checked="${this.formData.permissions.includes(perm)}"
                        @change="${() => this._togglePermission(perm)}"
                      />
                      <span>${perm}</span>
                    </div>
                  `
                )}
              </div>
            </div>

            <div class="form-group">
              <label>${this._('Rate Limit (requests/hour)')}</label>
              <input
                type="number"
                .value="${this.formData.rateLimit}"
                @input="${e => (this.formData = {...this.formData, rateLimit: parseInt(e.target.value, 10)})}"
                min="100"
                max="100000"
              />
            </div>

            <div class="form-group">
              <label>${this._('Expiration Date (Optional)')}</label>
              <input
                type="date"
                .value="${this.formData.expiresAt}"
                @input="${e => (this.formData = {...this.formData, expiresAt: e.target.value})}"
              />
            </div>
          </div>

          <div class="dialog-footer">
            <button class="button-secondary" @click="${this._closeDialog}">
              ${this._('Cancel')}
            </button>
            <button
              class="button-primary"
              @click="${this._createApiKey}"
              ?disabled="${!this.formData.name}"
            >
              ${this._('Create')}
            </button>
          </div>
        </div>
      </div>
    `
  }

  _renderSuccessDialog() {
    if (!this.newKey) return ''

    return html`
      <div class="dialog-overlay" @click="${e => e.target === e.currentTarget && this._closeDialog()}">
        <div class="dialog">
          <div class="dialog-header">
            <h2>${this._('API Key Created')}</h2>
          </div>

          <div class="dialog-body">
            <div class="success-content">
              <div class="success-icon">🔑</div>
              <p>${this._('Your API key has been created successfully.')}</p>

              <div class="key-display">${this.newKey.key}</div>

              <button class="button-primary" @click="${this._copyKey}">
                ${this._('Copy Key')}
              </button>

              <div class="warning-text">
                ⚠️ ${this._('Save this key now! It will not be shown again.')}
              </div>
            </div>
          </div>

          <div class="dialog-footer">
            <button class="button-primary" @click="${this._closeDialog}">
              ${this._('Done')}
            </button>
          </div>
        </div>
      </div>
    `
  }
}

customElements.define('grampsjs-api-keys-manager', GrampsjsApiKeysManager)
