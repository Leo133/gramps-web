/**
 * @fileoverview Activity Feed View
 * @author Gramps Web contributors
 */
import {html, css} from 'lit'
import {GrampsjsView} from './GrampsjsView.js'
import '../components/GrampsjsActivityFeedItem.js'
import '@material/mwc-button'
import '@material/mwc-circular-progress'

export class GrampsjsViewActivityFeed extends GrampsjsView {
  static get styles() {
    return [
      super.styles,
      css`
        :host {
          display: block;
        }

        .container {
          max-width: 800px;
          margin: 0 auto;
        }

        h2 {
          margin: var(--spacing-6, 2em) 0 var(--spacing-4, 1em) 0;
          color: var(--grampsjs-color-on-surface);
        }

        .feed {
          background-color: var(--grampsjs-color-surface);
          border-radius: var(--radius-lg, 16px);
          border: 1px solid var(--grampsjs-color-outline);
          overflow: hidden;
        }

        .empty-state {
          padding: var(--spacing-8, 3em);
          text-align: center;
          color: var(--grampsjs-body-font-color-60);
        }

        .load-more {
          text-align: center;
          padding: var(--spacing-4, 1em);
        }

        .loading {
          text-align: center;
          padding: var(--spacing-6, 2em);
        }
      `,
    ]
  }

  static get properties() {
    return {
      _activities: {type: Array},
      _loading: {type: Boolean},
      _page: {type: Number},
      _hasMore: {type: Boolean},
    }
  }

  constructor() {
    super()
    this._activities = []
    this._loading = false
    this._page = 1
    this._hasMore = true
  }

  connectedCallback() {
    super.connectedCallback()
    this._loadActivities()
  }

  async _loadActivities(append = false) {
    if (this._loading) return

    this._loading = true

    try {
      const params = new URLSearchParams({
        page: this._page,
        pagesize: 20,
      })

      const url = `/api/activity/feed?${params.toString()}`
      const response = await this.appState.apiGet(url)

      if (response && response.data) {
        if (append) {
          this._activities = [...this._activities, ...response.data]
        } else {
          this._activities = response.data
        }

        this._hasMore = response.data.length === 20
      }
    } catch (error) {
      console.error('Failed to load activity feed:', error)
      this.dispatchEvent(
        new CustomEvent('grampsjs:error', {
          bubbles: true,
          composed: true,
          detail: {message: this._('Failed to load activity feed')},
        })
      )
    } finally {
      this._loading = false
    }
  }

  _handleLoadMore() {
    this._page += 1
    this._loadActivities(true)
  }

  renderContent() {
    return html`
      <div class="container">
        <h2>${this._('Recent Activity')}</h2>

        <div class="feed">
          ${this._activities.length === 0 && !this._loading
            ? html`
                <div class="empty-state">
                  <p>${this._('No recent activity to display')}</p>
                </div>
              `
            : ''}
          
          ${this._activities.map(
            activity => html`
              <grampsjs-activity-feed-item
                .activity="${activity}"
                .appState="${this.appState}"
              ></grampsjs-activity-feed-item>
            `
          )}

          ${this._hasMore && !this._loading && this._activities.length > 0
            ? html`
                <div class="load-more">
                  <mwc-button raised @click="${this._handleLoadMore}">
                    ${this._('Load More')}
                  </mwc-button>
                </div>
              `
            : ''}

          ${this._loading
            ? html`
                <div class="loading">
                  <mwc-circular-progress indeterminate></mwc-circular-progress>
                </div>
              `
            : ''}
        </div>
      </div>
    `
  }
}

window.customElements.define(
  'grampsjs-view-activity-feed',
  GrampsjsViewActivityFeed
)
