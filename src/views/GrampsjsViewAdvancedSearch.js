import {html, css} from 'lit'
import {GrampsjsView} from './GrampsjsView.js'
import '../components/GrampsjsSearchResultList.js'
import '@material/mwc-textfield'
import '@material/mwc-button'
import '@material/mwc-checkbox'
import '@material/mwc-formfield'

export class GrampsjsViewAdvancedSearch extends GrampsjsView {
  static get styles() {
    return [
      super.styles,
      css`
        .search-container {
          max-width: 800px;
          margin: 0 auto;
        }

        .search-field-container {
          display: flex;
          gap: 1em;
          margin-bottom: 2em;
        }

        .search-options {
          display: flex;
          gap: 2em;
          margin-bottom: 2em;
          flex-wrap: wrap;
        }

        .results-container {
          margin-top: 2em;
        }

        .result-item {
          padding: 1em;
          margin-bottom: 1em;
          border: 1px solid var(--grampsjs-color-shade-230);
          border-radius: 8px;
          cursor: pointer;
        }

        .result-item:hover {
          background-color: var(--grampsjs-color-shade-250);
        }

        .result-title {
          font-weight: 500;
          font-size: 18px;
          margin-bottom: 0.5em;
        }

        .result-type {
          color: var(--grampsjs-body-font-color-50);
          font-size: 14px;
        }

        .result-score {
          float: right;
          color: var(--grampsjs-body-font-color-50);
          font-size: 14px;
        }

        .help-text {
          font-size: 14px;
          color: var(--grampsjs-body-font-color-50);
          margin-top: 0.5em;
        }
      `,
    ]
  }

  static get properties() {
    return {
      _query: {type: String},
      _phonetic: {type: Boolean},
      _fuzzy: {type: Boolean},
      _results: {type: Array},
      _loading: {type: Boolean},
    }
  }

  constructor() {
    super()
    this._query = ''
    this._phonetic = false
    this._fuzzy = false
    this._results = []
    this._loading = false
  }

  renderContent() {
    return html`
      <div class="search-container">
        <h2>${this._('Advanced Search')}</h2>

        <div class="search-field-container">
          <mwc-textfield
            outlined
            label="${this._('Search query')}"
            .value="${this._query}"
            @input="${this._handleQueryInput}"
            @keydown="${this._handleKeyDown}"
            style="flex: 1;"
          ></mwc-textfield>
          <mwc-button
            raised
            @click="${this._handleSearch}"
            ?disabled="${this._loading || !this._query}"
          >
            ${this._('Search')}
          </mwc-button>
        </div>

        <div class="search-options">
          <mwc-formfield label="${this._('Phonetic matching')}">
            <mwc-checkbox
              ?checked="${this._phonetic}"
              @change="${this._handlePhoneticChange}"
            ></mwc-checkbox>
          </mwc-formfield>

          <mwc-formfield label="${this._('Fuzzy matching')}">
            <mwc-checkbox
              ?checked="${this._fuzzy}"
              @change="${this._handleFuzzyChange}"
            ></mwc-checkbox>
          </mwc-formfield>
        </div>

        <div class="help-text">
          ${this._phonetic
            ? html`<p>
                ${this._(
                  'Phonetic matching finds names that sound similar (e.g., Smith, Smythe)'
                )}
              </p>`
            : ''}
          ${this._fuzzy
            ? html`<p>
                ${this._(
                  'Fuzzy matching finds approximate matches with spelling variations'
                )}
              </p>`
            : ''}
        </div>

        ${this._loading ? html`<p>${this._('Searching...')}</p>` : ''}
        ${this._renderResults()}
      </div>
    `
  }

  _renderResults() {
    if (this._results.length === 0 && !this._loading && this._query) {
      return html`<p>${this._('No results found')}</p>`
    }

    if (this._results.length === 0) {
      return ''
    }

    return html`
      <div class="results-container">
        <h3>${this._('Results')} (${this._results.length})</h3>
        ${this._results.map(
          result => html`
            <div
              class="result-item"
              @click="${() => this._handleResultClick(result)}"
            >
              <div class="result-title">${result.content}</div>
              <div class="result-type">
                ${result.entityType}
                <span class="result-score"
                  >${this._('Score')}: ${Math.round(result.score * 100)}%
                  (${result.matchType})</span
                >
              </div>
            </div>
          `
        )}
      </div>
    `
  }

  _handleQueryInput(e) {
    this._query = e.target.value
  }

  _handlePhoneticChange(e) {
    this._phonetic = e.target.checked
  }

  _handleFuzzyChange(e) {
    this._fuzzy = e.target.checked
  }

  _handleKeyDown(e) {
    if (e.key === 'Enter') {
      this._handleSearch()
    }
  }

  async _handleSearch() {
    if (!this._query) return

    this._loading = true
    try {
      const params = new URLSearchParams({
        query: this._query,
        phonetic: this._phonetic,
        fuzzy: this._fuzzy,
      })

      const response = await fetch(`/api/search?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${this.appState.auth.token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        this._results = data.results || []
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      this._loading = false
    }
  }

  _handleResultClick(result) {
    // Navigate to the entity
    const path = `/${result.entityType.toLowerCase()}/${result.entityHandle}`
    window.history.pushState({}, '', path)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }
}

window.customElements.define(
  'grampsjs-view-advanced-search',
  GrampsjsViewAdvancedSearch
)
