/**
 * @fileoverview Enhanced Gallery component with filtering, sorting, and lazy loading
 * @author Gramps Web contributors
 */
import {LitElement, css, html} from 'lit'
import '@material/mwc-button'
import '@material/mwc-select'
import '@material/mwc-list-item'
import '@material/mwc-circular-progress'

import {sharedStyles} from '../SharedStyles.js'
import {GrampsjsAppStateMixin} from '../mixins/GrampsjsAppStateMixin.js'
import './GrampsjsGallery.js'
import './GrampsjsFilterMime.js'
import './GrampsjsFilterTags.js'

import {designTokens} from '../design-tokens.js'
import {a11yStyles} from '../accessibility.js'

export class GrampsjsEnhancedGallery extends GrampsjsAppStateMixin(LitElement) {
  static get styles() {
    return [
      sharedStyles,
      designTokens,
      a11yStyles,
      css`
        :host {
          display: block;
        }

        .controls {
          display: flex;
          gap: var(--spacing-4, 1em);
          margin: var(--spacing-4, 1em) 0;
          flex-wrap: wrap;
          align-items: center;
        }

        .filters {
          display: flex;
          gap: var(--spacing-3, 0.6em);
          flex: 1;
        }

        mwc-select {
          min-width: 150px;
        }

        .load-more {
          text-align: center;
          margin: var(--spacing-6, 2em) 0;
        }
      `,
    ]
  }

  static get properties() {
    return {
      _media: {type: Array},
      _loading: {type: Boolean},
      _page: {type: Number},
      _hasMore: {type: Boolean},
      _sortBy: {type: String},
      _filterMime: {type: String},
      _filterTags: {type: Array},
    }
  }

  constructor() {
    super()
    this._media = []
    this._loading = false
    this._page = 1
    this._hasMore = true
    this._sortBy = 'date_desc'
    this._filterMime = ''
    this._filterTags = []
  }

  connectedCallback() {
    super.connectedCallback()
    this._loadMedia()
  }

  async _loadMedia(append = false) {
    if (this._loading) return
    
    this._loading = true
    
    try {
      const params = new URLSearchParams({
        page: this._page,
        pagesize: 20,
        sort: this._sortBy,
      })
      
      if (this._filterMime) {
        params.append('mime', this._filterMime)
      }
      
      if (this._filterTags.length > 0) {
        params.append('tags', this._filterTags.join(','))
      }
      
      const url = `/api/media/gallery?${params.toString()}`
      const response = await this.appState.apiGet(url)
      
      if (response && response.data) {
        if (append) {
          this._media = [...this._media, ...response.data]
        } else {
          this._media = response.data
        }
        
        this._hasMore = response.data.length === 20
      }
    } catch (error) {
      console.error('Failed to load gallery:', error)
      this.dispatchEvent(
        new CustomEvent('grampsjs:error', {
          bubbles: true,
          composed: true,
          detail: {message: 'Failed to load media gallery'},
        })
      )
    } finally {
      this._loading = false
    }
  }

  _handleSortChange(e) {
    this._sortBy = e.target.value
    this._page = 1
    this._loadMedia(false)
  }

  _handleFilterChange() {
    this._page = 1
    this._loadMedia(false)
  }

  _handleLoadMore() {
    this._page += 1
    this._loadMedia(true)
  }

  _handleMimeFilter(e) {
    this._filterMime = e.detail.value || ''
    this._handleFilterChange()
  }

  _handleTagsFilter(e) {
    this._filterTags = e.detail.tags || []
    this._handleFilterChange()
  }

  render() {
    return html`
      <div class="controls">
        <div class="filters">
          <grampsjs-filter-mime
            .appState="${this.appState}"
            @filter:changed="${this._handleMimeFilter}"
          ></grampsjs-filter-mime>
          
          <grampsjs-filter-tags
            .appState="${this.appState}"
            @filter:changed="${this._handleTagsFilter}"
          ></grampsjs-filter-tags>
        </div>
        
        <mwc-select
          label="${this._('Sort by')}"
          .value="${this._sortBy}"
          @selected="${this._handleSortChange}"
        >
          <mwc-list-item value="date_desc">${this._('Date (newest first)')}</mwc-list-item>
          <mwc-list-item value="date_asc">${this._('Date (oldest first)')}</mwc-list-item>
          <mwc-list-item value="title_asc">${this._('Title (A-Z)')}</mwc-list-item>
          <mwc-list-item value="title_desc">${this._('Title (Z-A)')}</mwc-list-item>
          <mwc-list-item value="mime_asc">${this._('Type (A-Z)')}</mwc-list-item>
        </mwc-select>
      </div>

      <grampsjs-gallery
        .media="${this._media}"
        .appState="${this.appState}"
      ></grampsjs-gallery>

      ${this._hasMore && !this._loading
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
            <div class="load-more">
              <mwc-circular-progress indeterminate></mwc-circular-progress>
            </div>
          `
        : ''}
    `
  }
}

customElements.define('grampsjs-enhanced-gallery', GrampsjsEnhancedGallery)
