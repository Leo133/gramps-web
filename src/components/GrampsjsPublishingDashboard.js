/**
 * Gramps.js Publishing Dashboard Component
 *
 * Phase 16: Publishing, Sharing & External Integration
 *
 * Main dashboard for all publishing features including:
 * - Site generation and management
 * - Share link creation
 * - Export management
 * - API key management
 * - Webhook configuration
 */

/* eslint-disable class-methods-use-this */

import {LitElement, css, html} from 'lit'
import {sharedStyles} from '../SharedStyles.js'
import {GrampsjsAppStateMixin} from '../mixins/GrampsjsAppStateMixin.js'

export class GrampsjsPublishingDashboard extends GrampsjsAppStateMixin(
  LitElement
) {
  static get styles() {
    return [
      sharedStyles,
      css`
        :host {
          display: block;
          padding: var(--spacing-4, 16px);
        }

        .dashboard-header {
          margin-bottom: var(--spacing-6, 24px);
        }

        .dashboard-header h1 {
          font-size: var(--type-headline-medium-size, 28px);
          font-weight: var(--font-weight-medium, 500);
          margin: 0 0 var(--spacing-2, 8px) 0;
          color: var(--md-sys-color-on-surface);
        }

        .dashboard-header p {
          font-size: var(--type-body-large-size, 16px);
          color: var(--md-sys-color-on-surface-variant);
          margin: 0;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: var(--spacing-4, 16px);
        }

        .card {
          background: var(--md-sys-color-surface);
          border-radius: var(--radius-lg, 12px);
          border: 1px solid var(--md-sys-color-outline-variant);
          padding: var(--spacing-5, 20px);
          transition: var(--transition-all);
        }

        .card:hover {
          box-shadow: var(--elevation-1);
          transform: translateY(-2px);
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: var(--spacing-3, 12px);
          margin-bottom: var(--spacing-4, 16px);
        }

        .card-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md, 8px);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .card-icon.sites {
          background: var(--md-sys-color-primary-container);
          color: var(--md-sys-color-on-primary-container);
        }

        .card-icon.shares {
          background: var(--md-sys-color-secondary-container);
          color: var(--md-sys-color-on-secondary-container);
        }

        .card-icon.exports {
          background: var(--md-sys-color-tertiary-container);
          color: var(--md-sys-color-on-tertiary-container);
        }

        .card-icon.api-keys {
          background: #e8f5e9;
          color: #2e7d32;
        }

        .card-icon.webhooks {
          background: #fff3e0;
          color: #f57c00;
        }

        .card-icon.social {
          background: #e3f2fd;
          color: #1976d2;
        }

        .card-title {
          font-size: var(--type-title-large-size, 22px);
          font-weight: var(--font-weight-medium, 500);
          margin: 0;
          color: var(--md-sys-color-on-surface);
        }

        .card-description {
          font-size: var(--type-body-medium-size, 14px);
          color: var(--md-sys-color-on-surface-variant);
          margin: 0 0 var(--spacing-4, 16px) 0;
          line-height: 1.5;
        }

        .card-stats {
          display: flex;
          gap: var(--spacing-4, 16px);
          margin-bottom: var(--spacing-4, 16px);
          padding: var(--spacing-3, 12px);
          background: var(--md-sys-color-surface-variant);
          border-radius: var(--radius-md, 8px);
        }

        .stat {
          text-align: center;
          flex: 1;
        }

        .stat-value {
          font-size: var(--type-headline-small-size, 24px);
          font-weight: var(--font-weight-semibold, 600);
          color: var(--md-sys-color-primary);
        }

        .stat-label {
          font-size: var(--type-body-small-size, 12px);
          color: var(--md-sys-color-on-surface-variant);
        }

        .card-actions {
          display: flex;
          gap: var(--spacing-2, 8px);
        }

        button {
          flex: 1;
          padding: var(--spacing-3, 12px) var(--spacing-4, 16px);
          border: none;
          border-radius: var(--radius-md, 8px);
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

        .button-secondary {
          background: var(--md-sys-color-surface-variant);
          color: var(--md-sys-color-on-surface-variant);
        }

        .button-secondary:hover {
          background: var(--md-sys-color-surface);
        }

        .quick-actions {
          margin-top: var(--spacing-6, 24px);
          padding: var(--spacing-4, 16px);
          background: var(--md-sys-color-surface-variant);
          border-radius: var(--radius-lg, 12px);
        }

        .quick-actions h2 {
          font-size: var(--type-title-medium-size, 16px);
          font-weight: var(--font-weight-medium, 500);
          margin: 0 0 var(--spacing-3, 12px) 0;
        }

        .quick-action-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-2, 8px);
        }

        .quick-action {
          display: inline-flex;
          align-items: center;
          gap: var(--spacing-2, 8px);
          padding: var(--spacing-2, 8px) var(--spacing-3, 12px);
          background: var(--md-sys-color-surface);
          border: 1px solid var(--md-sys-color-outline-variant);
          border-radius: var(--radius-full);
          font-size: var(--type-body-small-size, 12px);
          cursor: pointer;
          transition: var(--transition-all);
        }

        .quick-action:hover {
          background: var(--md-sys-color-primary-container);
          border-color: var(--md-sys-color-primary);
        }

        @media (max-width: 768px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }

          .card-stats {
            flex-wrap: wrap;
          }

          .stat {
            min-width: 80px;
          }
        }
      `,
    ]
  }

  static get properties() {
    return {
      sites: {type: Array},
      shareLinks: {type: Array},
      exports: {type: Array},
      apiKeys: {type: Array},
      webhooks: {type: Array},
      loading: {type: Boolean},
    }
  }

  constructor() {
    super()
    this.sites = []
    this.shareLinks = []
    this.exports = []
    this.apiKeys = []
    this.webhooks = []
    this.loading = true
  }

  async connectedCallback() {
    super.connectedCallback()
    await this._loadData()
  }

  async _loadData() {
    this.loading = true
    try {
      const [sites, shares, exports, apiKeys, webhooks] = await Promise.all([
        this._fetchSites(),
        this._fetchShareLinks(),
        this._fetchExports(),
        this._fetchApiKeys(),
        this._fetchWebhooks(),
      ])
      this.sites = sites
      this.shareLinks = shares
      this.exports = exports
      this.apiKeys = apiKeys
      this.webhooks = webhooks
    } catch (error) {
      console.error('Error loading publishing data:', error)
    }
    this.loading = false
  }

  async _fetchSites() {
    try {
      const response = await fetch('/api/publishing/sites')
      return response.ok ? await response.json() : []
    } catch {
      return []
    }
  }

  async _fetchShareLinks() {
    try {
      const response = await fetch('/api/publishing/shares')
      return response.ok ? await response.json() : []
    } catch {
      return []
    }
  }

  async _fetchExports() {
    try {
      const response = await fetch('/api/publishing/exports')
      return response.ok ? await response.json() : []
    } catch {
      return []
    }
  }

  async _fetchApiKeys() {
    try {
      const response = await fetch('/api/publishing/api-keys')
      return response.ok ? await response.json() : []
    } catch {
      return []
    }
  }

  async _fetchWebhooks() {
    try {
      const response = await fetch('/api/publishing/webhooks')
      return response.ok ? await response.json() : []
    } catch {
      return []
    }
  }

  _navigateTo(path) {
    this.dispatchEvent(
      new CustomEvent('nav', {
        detail: {path},
        bubbles: true,
        composed: true,
      })
    )
  }

  render() {
    if (this.loading) {
      return html`
        <div class="loading">
          <p>${this._('Loading')}...</p>
        </div>
      `
    }

    return html`
      <div class="dashboard-header">
        <h1>${this._('Publishing & Sharing')}</h1>
        <p>
          ${this._(
            'Share your family history with the world through websites, links, and integrations'
          )}
        </p>
      </div>

      <div class="dashboard-grid">
        ${this._renderSitesCard()} ${this._renderSharesCard()}
        ${this._renderExportsCard()} ${this._renderApiKeysCard()}
        ${this._renderWebhooksCard()} ${this._renderSocialCard()}
      </div>

      ${this._renderQuickActions()}
    `
  }

  _renderSitesCard() {
    const publishedCount = this.sites.filter(s => s.status === 'published')
      .length
    const draftCount = this.sites.filter(s => s.status === 'draft').length

    return html`
      <div class="card">
        <div class="card-header">
          <div class="card-icon sites">🌐</div>
          <h2 class="card-title">${this._('Family Websites')}</h2>
        </div>
        <p class="card-description">
          ${this._(
            'Create and publish standalone family history websites with customizable themes'
          )}
        </p>
        <div class="card-stats">
          <div class="stat">
            <div class="stat-value">${publishedCount}</div>
            <div class="stat-label">${this._('Published')}</div>
          </div>
          <div class="stat">
            <div class="stat-value">${draftCount}</div>
            <div class="stat-label">${this._('Drafts')}</div>
          </div>
        </div>
        <div class="card-actions">
          <button
            class="button-primary"
            @click="${() => this._navigateTo('/publishing/sites/new')}"
          >
            ${this._('Create Site')}
          </button>
          <button
            class="button-secondary"
            @click="${() => this._navigateTo('/publishing/sites')}"
          >
            ${this._('Manage')}
          </button>
        </div>
      </div>
    `
  }

  _renderSharesCard() {
    const activeCount = this.shareLinks.filter(s => s.enabled).length
    const totalViews = this.shareLinks.reduce(
      (sum, s) => sum + (s.viewCount || 0),
      0
    )

    return html`
      <div class="card">
        <div class="card-header">
          <div class="card-icon shares">🔗</div>
          <h2 class="card-title">${this._('Share Links')}</h2>
        </div>
        <p class="card-description">
          ${this._(
            'Create secure, privacy-filtered links to share specific branches with family'
          )}
        </p>
        <div class="card-stats">
          <div class="stat">
            <div class="stat-value">${activeCount}</div>
            <div class="stat-label">${this._('Active Links')}</div>
          </div>
          <div class="stat">
            <div class="stat-value">${totalViews}</div>
            <div class="stat-label">${this._('Total Views')}</div>
          </div>
        </div>
        <div class="card-actions">
          <button
            class="button-primary"
            @click="${() => this._navigateTo('/publishing/shares/new')}"
          >
            ${this._('Create Link')}
          </button>
          <button
            class="button-secondary"
            @click="${() => this._navigateTo('/publishing/shares')}"
          >
            ${this._('Manage')}
          </button>
        </div>
      </div>
    `
  }

  _renderExportsCard() {
    const completedCount = this.exports.filter(
      e => e.status === 'completed'
    ).length
    const pendingCount = this.exports.filter(e =>
      ['pending', 'processing'].includes(e.status)
    ).length

    return html`
      <div class="card">
        <div class="card-header">
          <div class="card-icon exports">📚</div>
          <h2 class="card-title">${this._('Books & Reports')}</h2>
        </div>
        <p class="card-description">
          ${this._(
            'Generate PDF family books, reports, and printable materials'
          )}
        </p>
        <div class="card-stats">
          <div class="stat">
            <div class="stat-value">${completedCount}</div>
            <div class="stat-label">${this._('Completed')}</div>
          </div>
          <div class="stat">
            <div class="stat-value">${pendingCount}</div>
            <div class="stat-label">${this._('In Progress')}</div>
          </div>
        </div>
        <div class="card-actions">
          <button
            class="button-primary"
            @click="${() => this._navigateTo('/publishing/exports/new')}"
          >
            ${this._('Create Export')}
          </button>
          <button
            class="button-secondary"
            @click="${() => this._navigateTo('/publishing/exports')}"
          >
            ${this._('Downloads')}
          </button>
        </div>
      </div>
    `
  }

  _renderApiKeysCard() {
    const activeCount = this.apiKeys.filter(k => k.enabled).length

    return html`
      <div class="card">
        <div class="card-header">
          <div class="card-icon api-keys">🔑</div>
          <h2 class="card-title">${this._('API Keys')}</h2>
        </div>
        <p class="card-description">
          ${this._(
            'Create API keys for third-party integrations and mobile apps'
          )}
        </p>
        <div class="card-stats">
          <div class="stat">
            <div class="stat-value">${activeCount}</div>
            <div class="stat-label">${this._('Active Keys')}</div>
          </div>
          <div class="stat">
            <div class="stat-value">${this.apiKeys.length}</div>
            <div class="stat-label">${this._('Total Keys')}</div>
          </div>
        </div>
        <div class="card-actions">
          <button
            class="button-primary"
            @click="${() => this._navigateTo('/publishing/api-keys/new')}"
          >
            ${this._('Create Key')}
          </button>
          <button
            class="button-secondary"
            @click="${() => this._navigateTo('/publishing/api-keys')}"
          >
            ${this._('Manage')}
          </button>
        </div>
      </div>
    `
  }

  _renderWebhooksCard() {
    const activeCount = this.webhooks.filter(w => w.enabled).length

    return html`
      <div class="card">
        <div class="card-header">
          <div class="card-icon webhooks">📡</div>
          <h2 class="card-title">${this._('Webhooks')}</h2>
        </div>
        <p class="card-description">
          ${this._(
            'Configure webhooks to receive real-time notifications of changes'
          )}
        </p>
        <div class="card-stats">
          <div class="stat">
            <div class="stat-value">${activeCount}</div>
            <div class="stat-label">${this._('Active')}</div>
          </div>
          <div class="stat">
            <div class="stat-value">${this.webhooks.length}</div>
            <div class="stat-label">${this._('Total')}</div>
          </div>
        </div>
        <div class="card-actions">
          <button
            class="button-primary"
            @click="${() => this._navigateTo('/publishing/webhooks/new')}"
          >
            ${this._('Create Webhook')}
          </button>
          <button
            class="button-secondary"
            @click="${() => this._navigateTo('/publishing/webhooks')}"
          >
            ${this._('Manage')}
          </button>
        </div>
      </div>
    `
  }

  _renderSocialCard() {
    return html`
      <div class="card">
        <div class="card-header">
          <div class="card-icon social">📱</div>
          <h2 class="card-title">${this._('Social & Calendar')}</h2>
        </div>
        <p class="card-description">
          ${this._(
            'Share to social media, embed widgets, and export calendars'
          )}
        </p>
        <div class="card-stats">
          <div class="stat">
            <div class="stat-value">6</div>
            <div class="stat-label">${this._('Widget Types')}</div>
          </div>
          <div class="stat">
            <div class="stat-value">5</div>
            <div class="stat-label">${this._('Platforms')}</div>
          </div>
        </div>
        <div class="card-actions">
          <button
            class="button-primary"
            @click="${() => this._navigateTo('/publishing/embed')}"
          >
            ${this._('Embed Widget')}
          </button>
          <button
            class="button-secondary"
            @click="${() => this._navigateTo('/publishing/calendar')}"
          >
            ${this._('Calendar')}
          </button>
        </div>
      </div>
    `
  }

  _renderQuickActions() {
    return html`
      <div class="quick-actions">
        <h2>${this._('Quick Actions')}</h2>
        <div class="quick-action-buttons">
          <button
            class="quick-action"
            @click="${() => this._navigateTo('/publishing/sites/new')}"
          >
            🌐 ${this._('New Website')}
          </button>
          <button
            class="quick-action"
            @click="${() => this._navigateTo('/publishing/shares/new')}"
          >
            🔗 ${this._('Share Branch')}
          </button>
          <button
            class="quick-action"
            @click="${() => this._navigateTo('/publishing/exports/new')}"
          >
            📄 ${this._('Generate PDF')}
          </button>
          <button
            class="quick-action"
            @click="${() => this._navigateTo('/publishing/embed')}"
          >
            📊 ${this._('Embed Chart')}
          </button>
          <button
            class="quick-action"
            @click="${() => this._navigateTo('/publishing/calendar')}"
          >
            📅 ${this._('Export Calendar')}
          </button>
        </div>
      </div>
    `
  }
}

customElements.define('grampsjs-publishing-dashboard', GrampsjsPublishingDashboard)
