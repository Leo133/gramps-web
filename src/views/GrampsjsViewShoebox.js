import {html, css} from 'lit'
import {GrampsjsView} from './GrampsjsView.js'
import '@material/mwc-button'
import '@material/mwc-icon-button'
import '@material/mwc-dialog'
import '@material/mwc-textfield'
import '@material/mwc-textarea'
import '@material/mwc-select'
import '@material/mwc-list/mwc-list-item'

export class GrampsjsViewShoebox extends GrampsjsView {
  static get styles() {
    return [
      super.styles,
      css`
        .shoebox-container {
          max-width: 1000px;
          margin: 0 auto;
        }

        .filter-bar {
          display: flex;
          gap: 1em;
          margin-bottom: 2em;
          align-items: center;
        }

        .items-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5em;
        }

        .item-card {
          background: var(--grampsjs-color-shade-230);
          border-radius: 8px;
          padding: 1.5em;
          position: relative;
          transition: box-shadow 0.2s;
        }

        .item-card:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 1em;
        }

        .item-type {
          font-size: 12px;
          padding: 4px 8px;
          background: var(--grampsjs-primary-color);
          color: white;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .item-actions {
          display: flex;
          gap: 0.25em;
        }

        .item-title {
          font-weight: 500;
          font-size: 16px;
          margin-bottom: 0.5em;
        }

        .item-content {
          font-size: 14px;
          color: var(--grampsjs-body-font-color-70);
          margin-bottom: 1em;
          max-height: 100px;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .item-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: var(--grampsjs-body-font-color-50);
        }

        .item-tags {
          display: flex;
          gap: 0.5em;
          flex-wrap: wrap;
        }

        .tag {
          padding: 2px 6px;
          background: var(--grampsjs-color-shade-240);
          border-radius: 3px;
          font-size: 11px;
        }

        .attached-badge {
          color: var(--grampsjs-success-color);
          font-weight: 500;
        }

        .stats-bar {
          display: flex;
          gap: 1.5em;
          margin-bottom: 2em;
          padding: 1em;
          background: var(--grampsjs-color-shade-240);
          border-radius: 8px;
        }

        .stat-item {
          text-align: center;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 500;
          color: var(--grampsjs-primary-color);
        }

        .stat-label {
          font-size: 12px;
          color: var(--grampsjs-body-font-color-50);
        }

        .dialog-content {
          display: flex;
          flex-direction: column;
          gap: 1em;
          padding: 1em 0;
        }
      `,
    ]
  }

  static get properties() {
    return {
      _items: {type: Array},
      _statistics: {type: Object},
      _loading: {type: Boolean},
      _dialogOpen: {type: Boolean},
      _editingItem: {type: Object},
      _filterType: {type: String},
    }
  }

  constructor() {
    super()
    this._items = []
    this._statistics = null
    this._loading = false
    this._dialogOpen = false
    this._editingItem = null
    this._filterType = ''
  }

  connectedCallback() {
    super.connectedCallback()
    this._loadItems()
    this._loadStatistics()
  }

  renderContent() {
    if (this._loading) {
      return html`<p>${this._('Loading...')}</p>`
    }

    return html`
      <div class="shoebox-container">
        <h2>${this._('Research Shoebox')}</h2>

        ${this._renderStatistics()}

        <div class="filter-bar">
          <mwc-select
            label="${this._('Filter by type')}"
            .value="${this._filterType}"
            @selected="${this._handleFilterChange}"
          >
            <mwc-list-item value="">${this._('All')}</mwc-list-item>
            <mwc-list-item value="text">${this._('Text')}</mwc-list-item>
            <mwc-list-item value="image">${this._('Image')}</mwc-list-item>
            <mwc-list-item value="url">${this._('URL')}</mwc-list-item>
            <mwc-list-item value="file">${this._('File')}</mwc-list-item>
          </mwc-select>

          <mwc-button raised @click="${this._handleNewItem}">
            + ${this._('Add Item')}
          </mwc-button>
        </div>

        <div class="items-grid">
          ${this._items.map(item => this._renderItemCard(item))}
        </div>

        ${this._items.length === 0
          ? html`<p>${this._('No items in your shoebox yet')}</p>`
          : ''}
      </div>

      ${this._renderDialog()}
    `
  }

  _renderStatistics() {
    if (!this._statistics) return ''

    return html`
      <div class="stats-bar">
        <div class="stat-item">
          <div class="stat-value">${this._statistics.total}</div>
          <div class="stat-label">${this._('Total Items')}</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${this._statistics.byType.text}</div>
          <div class="stat-label">${this._('Text')}</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${this._statistics.byType.image}</div>
          <div class="stat-label">${this._('Images')}</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${this._statistics.byType.url}</div>
          <div class="stat-label">${this._('URLs')}</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${this._statistics.attached}</div>
          <div class="stat-label">${this._('Attached')}</div>
        </div>
      </div>
    `
  }

  _renderItemCard(item) {
    return html`
      <div class="item-card">
        <div class="item-header">
          <span class="item-type">${item.itemType}</span>
          <div class="item-actions">
            <mwc-icon-button
              icon="edit"
              @click="${() => this._handleEditItem(item)}"
            ></mwc-icon-button>
            <mwc-icon-button
              icon="delete"
              @click="${() => this._handleDeleteItem(item)}"
            ></mwc-icon-button>
          </div>
        </div>

        ${item.title ? html`<div class="item-title">${item.title}</div>` : ''}

        <div class="item-content">
          ${item.itemType === 'url'
            ? html`<a href="${item.content}" target="_blank">${item.content}</a>`
            : item.content}
        </div>

        <div class="item-footer">
          ${item.tags && item.tags.length > 0
            ? html`
                <div class="item-tags">
                  ${item.tags.map(tag => html`<span class="tag">${tag}</span>`)}
                </div>
              `
            : ''}
          ${item.attachedTo
            ? html`<span class="attached-badge">✓ ${this._('Attached')}</span>`
            : ''}
        </div>
      </div>
    `
  }

  _renderDialog() {
    return html`
      <mwc-dialog
        ?open="${this._dialogOpen}"
        @closed="${this._handleDialogClosed}"
        heading="${this._editingItem ? this._('Edit Item') : this._('New Item')}"
      >
        <div class="dialog-content">
          <mwc-select
            id="item-type"
            label="${this._('Type')}"
            .value="${this._editingItem?.itemType || 'text'}"
          >
            <mwc-list-item value="text">${this._('Text')}</mwc-list-item>
            <mwc-list-item value="image">${this._('Image')}</mwc-list-item>
            <mwc-list-item value="url">${this._('URL')}</mwc-list-item>
            <mwc-list-item value="file">${this._('File')}</mwc-list-item>
          </mwc-select>

          <mwc-textfield
            id="item-title"
            label="${this._('Title (optional)')}"
            .value="${this._editingItem?.title || ''}"
          ></mwc-textfield>

          <mwc-textarea
            id="item-content"
            label="${this._('Content')}"
            .value="${this._editingItem?.content || ''}"
            rows="5"
            required
          ></mwc-textarea>

          <mwc-textfield
            id="item-tags"
            label="${this._('Tags (comma separated)')}"
            .value="${this._editingItem?.tags?.join(', ') || ''}"
          ></mwc-textfield>
        </div>

        <mwc-button slot="primaryAction" @click="${this._handleSaveItem}">
          ${this._('Save')}
        </mwc-button>
        <mwc-button slot="secondaryAction" dialogAction="close">
          ${this._('Cancel')}
        </mwc-button>
      </mwc-dialog>
    `
  }

  async _loadItems() {
    this._loading = true
    try {
      const params = new URLSearchParams()
      if (this._filterType) {
        params.set('itemType', this._filterType)
      }

      const response = await fetch(`/api/shoebox/items?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${this.appState.auth.token}`,
        },
      })

      if (response.ok) {
        this._items = await response.json()
      }
    } catch (error) {
      console.error('Error loading items:', error)
    } finally {
      this._loading = false
    }
  }

  async _loadStatistics() {
    try {
      const response = await fetch('/api/shoebox/statistics', {
        headers: {
          Authorization: `Bearer ${this.appState.auth.token}`,
        },
      })

      if (response.ok) {
        this._statistics = await response.json()
      }
    } catch (error) {
      console.error('Error loading statistics:', error)
    }
  }

  _handleFilterChange(e) {
    this._filterType = e.target.value
    this._loadItems()
  }

  _handleNewItem() {
    this._editingItem = null
    this._dialogOpen = true
  }

  _handleEditItem(item) {
    this._editingItem = item
    this._dialogOpen = true
  }

  _handleDialogClosed() {
    this._dialogOpen = false
    this._editingItem = null
  }

  async _handleSaveItem() {
    const itemType = this.shadowRoot.getElementById('item-type').value
    const title = this.shadowRoot.getElementById('item-title').value
    const content = this.shadowRoot.getElementById('item-content').value
    const tagsStr = this.shadowRoot.getElementById('item-tags').value

    if (!content) return

    const tags = tagsStr
      ? tagsStr.split(',').map(t => t.trim()).filter(Boolean)
      : []

    const itemData = {
      itemType,
      title,
      content,
      tags,
    }

    try {
      const url = this._editingItem
        ? `/api/shoebox/items/${this._editingItem.id}`
        : '/api/shoebox/items'
      const method = this._editingItem ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.appState.auth.token}`,
        },
        body: JSON.stringify(itemData),
      })

      if (response.ok) {
        this._dialogOpen = false
        this._loadItems()
        this._loadStatistics()
      }
    } catch (error) {
      console.error('Error saving item:', error)
    }
  }

  async _handleDeleteItem(item) {
    if (!confirm(this._('Are you sure you want to delete this item?'))) return

    try {
      const response = await fetch(`/api/shoebox/items/${item.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${this.appState.auth.token}`,
        },
      })

      if (response.ok) {
        this._loadItems()
        this._loadStatistics()
      }
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }
}

window.customElements.define('grampsjs-view-shoebox', GrampsjsViewShoebox)
