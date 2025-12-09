import {html, css} from 'lit'
import {GrampsjsView} from './GrampsjsView.js'
import '@material/mwc-button'
import '@material/mwc-linear-progress'

export class GrampsjsViewQualityDashboard extends GrampsjsView {
  static get styles() {
    return [
      super.styles,
      css`
        .dashboard-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5em;
          margin-bottom: 2em;
        }

        .metric-card {
          padding: 1.5em;
          background: var(--grampsjs-color-shade-230);
          border-radius: 12px;
        }

        .metric-title {
          font-size: 14px;
          color: var(--grampsjs-body-font-color-50);
          margin-bottom: 0.5em;
        }

        .metric-value {
          font-size: 32px;
          font-weight: 500;
          margin-bottom: 0.5em;
        }

        .metric-bar {
          margin-top: 1em;
        }

        .issues-section {
          margin-top: 2em;
        }

        .issue-list {
          list-style: none;
          padding: 0;
        }

        .issue-item {
          padding: 1em;
          margin-bottom: 0.5em;
          border-left: 4px solid;
          background: var(--grampsjs-color-shade-240);
          border-radius: 4px;
        }

        .issue-item.error {
          border-left-color: var(--grampsjs-alert-error-font-color);
        }

        .issue-item.warning {
          border-left-color: #ff9800;
        }

        .issue-item.info {
          border-left-color: #2196f3;
        }

        .issue-title {
          font-weight: 500;
          margin-bottom: 0.5em;
        }

        .issue-message {
          font-size: 14px;
          color: var(--grampsjs-body-font-color-70);
        }

        .stats-row {
          display: flex;
          gap: 2em;
          margin-bottom: 2em;
        }

        .stat-box {
          flex: 1;
          text-align: center;
          padding: 1em;
          background: var(--grampsjs-color-shade-240);
          border-radius: 8px;
        }

        .stat-number {
          font-size: 48px;
          font-weight: 500;
          color: var(--grampsjs-primary-color);
        }

        .stat-label {
          font-size: 14px;
          color: var(--grampsjs-body-font-color-50);
        }
      `,
    ]
  }

  static get properties() {
    return {
      _dashboard: {type: Object},
      _loading: {type: Boolean},
    }
  }

  constructor() {
    super()
    this._dashboard = null
    this._loading = false
  }

  connectedCallback() {
    super.connectedCallback()
    this._loadDashboard()
  }

  renderContent() {
    if (this._loading) {
      return html`<p>${this._('Loading...')}</p>`
    }

    if (!this._dashboard) {
      return html`<p>${this._('No data available')}</p>`
    }

    const {overall, issueCount, topIssues, recentlyChecked} = this._dashboard

    return html`
      <div class="dashboard-container">
        <h2>${this._('Data Quality Dashboard')}</h2>

        <div class="stats-row">
          <div class="stat-box">
            <div class="stat-number">${issueCount.errors}</div>
            <div class="stat-label">${this._('Errors')}</div>
          </div>
          <div class="stat-box">
            <div class="stat-number">${issueCount.warnings}</div>
            <div class="stat-label">${this._('Warnings')}</div>
          </div>
          <div class="stat-box">
            <div class="stat-number">${issueCount.info}</div>
            <div class="stat-label">${this._('Info')}</div>
          </div>
          <div class="stat-box">
            <div class="stat-number">${recentlyChecked}</div>
            <div class="stat-label">${this._('Records Checked')}</div>
          </div>
        </div>

        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-title">${this._('Completeness')}</div>
            <div class="metric-value">
              ${Math.round(overall.completeness * 100)}%
            </div>
            <div class="metric-bar">
              <mwc-linear-progress
                progress="${overall.completeness}"
              ></mwc-linear-progress>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-title">${this._('Consistency')}</div>
            <div class="metric-value">
              ${Math.round(overall.consistency * 100)}%
            </div>
            <div class="metric-bar">
              <mwc-linear-progress
                progress="${overall.consistency}"
              ></mwc-linear-progress>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-title">${this._('Accuracy')}</div>
            <div class="metric-value">
              ${Math.round(overall.accuracy * 100)}%
            </div>
            <div class="metric-bar">
              <mwc-linear-progress
                progress="${overall.accuracy}"
              ></mwc-linear-progress>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-title">${this._('Overall Score')}</div>
            <div class="metric-value">
              ${Math.round(overall.overall * 100)}%
            </div>
            <div class="metric-bar">
              <mwc-linear-progress
                progress="${overall.overall}"
              ></mwc-linear-progress>
            </div>
          </div>
        </div>

        <div class="issues-section">
          <h3>${this._('Top Issues')}</h3>
          ${topIssues.length === 0
            ? html`<p>${this._('No issues found')}</p>`
            : html`
                <ul class="issue-list">
                  ${topIssues.map(
                    issue => html`
                      <li class="issue-item ${issue.severity}">
                        <div class="issue-title">
                          ${issue.type.replace(/_/g, ' ')}
                        </div>
                        <div class="issue-message">${issue.message}</div>
                      </li>
                    `
                  )}
                </ul>
              `}
        </div>

        <div style="margin-top: 2em;">
          <mwc-button raised @click="${this._handleRefresh}">
            ${this._('Refresh Dashboard')}
          </mwc-button>
        </div>
      </div>
    `
  }

  async _loadDashboard() {
    this._loading = true
    try {
      const response = await fetch('/api/quality/dashboard', {
        headers: {
          Authorization: `Bearer ${this.appState.auth.token}`,
        },
      })

      if (response.ok) {
        this._dashboard = await response.json()
      }
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      this._loading = false
    }
  }

  _handleRefresh() {
    this._loadDashboard()
  }
}

window.customElements.define(
  'grampsjs-view-quality-dashboard',
  GrampsjsViewQualityDashboard
)
