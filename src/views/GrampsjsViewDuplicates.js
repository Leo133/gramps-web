import {html, css} from 'lit'
import {GrampsjsView} from './GrampsjsView.js'
import '@material/mwc-button'

export class GrampsjsViewDuplicates extends GrampsjsView {
  static get styles() {
    return [
      super.styles,
      css`
        .duplicates-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .actions-bar {
          display: flex;
          gap: 1em;
          margin-bottom: 2em;
        }

        .suggestion-card {
          background: var(--grampsjs-color-shade-230);
          border-radius: 8px;
          padding: 1.5em;
          margin-bottom: 1.5em;
        }

        .suggestion-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1em;
          padding-bottom: 1em;
          border-bottom: 1px solid var(--grampsjs-color-shade-240);
        }

        .similarity-score {
          font-size: 24px;
          font-weight: 500;
          color: var(--grampsjs-primary-color);
        }

        .comparison-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2em;
        }

        .entity-info {
          background: var(--grampsjs-color-shade-240);
          padding: 1em;
          border-radius: 8px;
        }

        .entity-title {
          font-weight: 500;
          font-size: 18px;
          margin-bottom: 0.5em;
        }

        .entity-detail {
          margin-bottom: 0.5em;
          font-size: 14px;
        }

        .entity-label {
          color: var(--grampsjs-body-font-color-50);
        }

        .match-reasons {
          margin-top: 1em;
          padding-top: 1em;
          border-top: 1px solid var(--grampsjs-color-shade-240);
        }

        .match-reason {
          padding: 0.5em;
          margin-bottom: 0.5em;
          background: var(--grampsjs-color-shade-250);
          border-radius: 4px;
          font-size: 14px;
        }

        .match-type {
          font-weight: 500;
          color: var(--grampsjs-primary-color);
        }

        .suggestion-actions {
          display: flex;
          gap: 1em;
          margin-top: 1em;
        }
      `,
    ]
  }

  static get properties() {
    return {
      _suggestions: {type: Array},
      _loading: {type: Boolean},
      _scanning: {type: Boolean},
    }
  }

  constructor() {
    super()
    this._suggestions = []
    this._loading = false
    this._scanning = false
  }

  connectedCallback() {
    super.connectedCallback()
    this._loadSuggestions()
  }

  renderContent() {
    if (this._loading) {
      return html`<p>${this._('Loading...')}</p>`
    }

    return html`
      <div class="duplicates-container">
        <h2>${this._('Duplicate Detection')}</h2>

        <div class="actions-bar">
          <mwc-button
            raised
            @click="${this._handleScan}"
            ?disabled="${this._scanning}"
          >
            ${this._scanning ? this._('Scanning...') : this._('Scan for Duplicates')}
          </mwc-button>
          <mwc-button
            outlined
            @click="${this._loadSuggestions}"
            ?disabled="${this._loading}"
          >
            ${this._('Refresh')}
          </mwc-button>
        </div>

        ${this._suggestions.length === 0
          ? html`<p>${this._('No duplicate suggestions found')}</p>`
          : ''}

        ${this._suggestions.map(suggestion => this._renderSuggestion(suggestion))}
      </div>
    `
  }

  _renderSuggestion(suggestion) {
    const matchReasons = JSON.parse(suggestion.matchReasons)

    return html`
      <div class="suggestion-card">
        <div class="suggestion-header">
          <div>
            <h3>${this._('Possible Duplicate')} - ${suggestion.entityType}</h3>
          </div>
          <div class="similarity-score">
            ${Math.round(suggestion.similarityScore * 100)}% ${this._('Match')}
          </div>
        </div>

        <div class="comparison-grid">
          <div class="entity-info">
            <div class="entity-title">${this._('Entity 1')}</div>
            <div class="entity-detail">
              <span class="entity-label">${this._('Handle')}:</span>
              ${suggestion.entity1Handle}
            </div>
          </div>

          <div class="entity-info">
            <div class="entity-title">${this._('Entity 2')}</div>
            <div class="entity-detail">
              <span class="entity-label">${this._('Handle')}:</span>
              ${suggestion.entity2Handle}
            </div>
          </div>
        </div>

        <div class="match-reasons">
          <h4>${this._('Match Reasons')}</h4>
          ${matchReasons.map(
            reason => html`
              <div class="match-reason">
                <span class="match-type">${reason.type.replace(/_/g, ' ')}:</span>
                ${Math.round(reason.score * 100)}%
              </div>
            `
          )}
        </div>

        <div class="suggestion-actions">
          <mwc-button
            raised
            @click="${() => this._handleMerge(suggestion)}"
          >
            ${this._('Merge')}
          </mwc-button>
          <mwc-button
            outlined
            @click="${() => this._handleDismiss(suggestion)}"
          >
            ${this._('Dismiss')}
          </mwc-button>
        </div>
      </div>
    `
  }

  async _loadSuggestions() {
    this._loading = true
    try {
      const response = await fetch('/api/duplicates/pending', {
        headers: {
          Authorization: `Bearer ${this.appState.auth.token}`,
        },
      })

      if (response.ok) {
        this._suggestions = await response.json()
      }
    } catch (error) {
      console.error('Error loading suggestions:', error)
    } finally {
      this._loading = false
    }
  }

  async _handleScan() {
    this._scanning = true
    try {
      const response = await fetch('/api/duplicates/scan', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.appState.auth.token}`,
        },
      })

      if (response.ok) {
        await this._loadSuggestions()
      }
    } catch (error) {
      console.error('Error scanning:', error)
    } finally {
      this._scanning = false
    }
  }

  async _handleMerge(suggestion) {
    const keepHandle = prompt(
      this._('Which handle do you want to keep? Enter 1 or 2:')
    )

    if (keepHandle !== '1' && keepHandle !== '2') return

    const handle1 = suggestion.entity1Handle
    const handle2 = suggestion.entity2Handle
    const keep = keepHandle === '1' ? handle1 : handle2

    try {
      const response = await fetch('/api/duplicates/merge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.appState.auth.token}`,
        },
        body: JSON.stringify({
          handle1,
          handle2,
          keepHandle: keep,
        }),
      })

      if (response.ok) {
        // Update suggestion status
        await this._updateSuggestionStatus(suggestion.id, 'merged')
        await this._loadSuggestions()
      }
    } catch (error) {
      console.error('Error merging:', error)
    }
  }

  async _handleDismiss(suggestion) {
    try {
      await this._updateSuggestionStatus(suggestion.id, 'dismissed')
      await this._loadSuggestions()
    } catch (error) {
      console.error('Error dismissing:', error)
    }
  }

  async _updateSuggestionStatus(id, status) {
    const response = await fetch(`/api/duplicates/${id}/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.appState.auth.token}`,
      },
      body: JSON.stringify({ status }),
    })

    return response.ok
  }
}

window.customElements.define('grampsjs-view-duplicates', GrampsjsViewDuplicates)
