/**
 * Gramps.js Embed Generator Component
 *
 * Phase 16: Publishing, Sharing & External Integration
 *
 * Component for generating embeddable widget codes for external websites.
 */

/* eslint-disable no-alert */

import {LitElement, css, html} from 'lit'
import {sharedStyles} from '../SharedStyles.js'
import {GrampsjsAppStateMixin} from '../mixins/GrampsjsAppStateMixin.js'
import {clickKeyHandler} from '../util.js'

export class GrampsjsEmbedGenerator extends GrampsjsAppStateMixin(LitElement) {
  static get styles() {
    return [
      sharedStyles,
      css`
        :host {
          display: block;
          padding: var(--spacing-4, 16px);
        }

        .header {
          margin-bottom: var(--spacing-6, 24px);
        }

        .header h1 {
          font-size: var(--type-headline-medium-size, 28px);
          font-weight: var(--font-weight-medium, 500);
          margin: 0 0 var(--spacing-2, 8px) 0;
          color: var(--md-sys-color-on-surface);
        }

        .header p {
          font-size: var(--type-body-large-size, 16px);
          color: var(--md-sys-color-on-surface-variant);
          margin: 0;
        }

        .generator-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--spacing-6, 24px);
        }

        @media (max-width: 1024px) {
          .generator-container {
            grid-template-columns: 1fr;
          }
        }

        .options-panel {
          background: var(--md-sys-color-surface);
          border: 1px solid var(--md-sys-color-outline-variant);
          border-radius: var(--radius-lg, 12px);
          padding: var(--spacing-5, 20px);
        }

        .preview-panel {
          background: var(--md-sys-color-surface);
          border: 1px solid var(--md-sys-color-outline-variant);
          border-radius: var(--radius-lg, 12px);
          padding: var(--spacing-5, 20px);
        }

        .section-title {
          font-size: var(--type-title-medium-size, 16px);
          font-weight: var(--font-weight-medium, 500);
          margin: 0 0 var(--spacing-4, 16px) 0;
          color: var(--md-sys-color-on-surface);
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
          box-sizing: border-box;
        }

        input:focus,
        select:focus {
          outline: none;
          border-color: var(--md-sys-color-primary);
        }

        .widget-types {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--spacing-2, 8px);
          margin-bottom: var(--spacing-4, 16px);
        }

        .widget-type {
          padding: var(--spacing-3, 12px);
          border: 2px solid var(--md-sys-color-outline-variant);
          border-radius: var(--radius-md, 8px);
          cursor: pointer;
          text-align: center;
          transition: var(--transition-all);
        }

        .widget-type:hover {
          border-color: var(--md-sys-color-primary);
        }

        .widget-type.selected {
          border-color: var(--md-sys-color-primary);
          background: var(--md-sys-color-primary-container);
        }

        .widget-type-icon {
          font-size: 28px;
          margin-bottom: var(--spacing-1, 4px);
        }

        .widget-type-label {
          font-size: var(--type-body-small-size, 12px);
          font-weight: var(--font-weight-medium, 500);
        }

        .size-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--spacing-2, 8px);
        }

        .preview-container {
          background: var(--md-sys-color-surface-variant);
          border-radius: var(--radius-md, 8px);
          padding: var(--spacing-4, 16px);
          min-height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .preview-placeholder {
          text-align: center;
          color: var(--md-sys-color-on-surface-variant);
        }

        .preview-placeholder-icon {
          font-size: 48px;
          margin-bottom: var(--spacing-2, 8px);
        }

        .code-section {
          margin-top: var(--spacing-4, 16px);
        }

        .code-tabs {
          display: flex;
          border-bottom: 1px solid var(--md-sys-color-outline-variant);
          margin-bottom: var(--spacing-3, 12px);
        }

        .code-tab {
          padding: var(--spacing-2, 8px) var(--spacing-4, 16px);
          border: none;
          background: transparent;
          font-size: var(--type-body-medium-size, 14px);
          font-family: inherit;
          cursor: pointer;
          color: var(--md-sys-color-on-surface-variant);
          border-bottom: 2px solid transparent;
          transition: var(--transition-all);
        }

        .code-tab:hover {
          color: var(--md-sys-color-on-surface);
        }

        .code-tab.active {
          color: var(--md-sys-color-primary);
          border-bottom-color: var(--md-sys-color-primary);
        }

        .code-block {
          background: #1e1e1e;
          color: #d4d4d4;
          padding: var(--spacing-4, 16px);
          border-radius: var(--radius-md, 8px);
          font-family: 'Fira Code', 'Consolas', monospace;
          font-size: 12px;
          overflow-x: auto;
          white-space: pre-wrap;
          word-break: break-all;
        }

        .copy-button {
          margin-top: var(--spacing-3, 12px);
          padding: var(--spacing-2, 8px) var(--spacing-4, 16px);
          background: var(--md-sys-color-primary);
          color: var(--md-sys-color-on-primary);
          border: none;
          border-radius: var(--radius-full);
          font-size: var(--type-label-large-size, 14px);
          font-weight: var(--font-weight-medium, 500);
          cursor: pointer;
          font-family: inherit;
        }

        .copy-button:hover {
          opacity: 0.9;
        }

        .generate-button {
          width: 100%;
          padding: var(--spacing-3, 12px);
          background: var(--md-sys-color-primary);
          color: var(--md-sys-color-on-primary);
          border: none;
          border-radius: var(--radius-md, 8px);
          font-size: var(--type-label-large-size, 14px);
          font-weight: var(--font-weight-medium, 500);
          cursor: pointer;
          font-family: inherit;
          margin-top: var(--spacing-4, 16px);
        }

        .generate-button:hover {
          opacity: 0.9;
        }

        .generate-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .widget-types {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `,
    ]
  }

  static get properties() {
    return {
      widgetTypes: {type: Array},
      selectedType: {type: String},
      entityId: {type: String},
      options: {type: Object},
      embedCode: {type: Object},
      activeTab: {type: String},
      loading: {type: Boolean},
    }
  }

  constructor() {
    super()
    this.widgetTypes = [
      {id: 'tree', name: 'Family Tree', icon: '🌳'},
      {id: 'pedigree', name: 'Pedigree', icon: '📊'},
      {id: 'fan', name: 'Fan Chart', icon: '🎯'},
      {id: 'timeline', name: 'Timeline', icon: '📅'},
      {id: 'photos', name: 'Photos', icon: '📸'},
      {id: 'map', name: 'Map', icon: '🗺️'},
    ]
    this.selectedType = 'tree'
    this.entityId = ''
    this.options = {
      generations: 3,
      direction: 'both',
      width: '100%',
      height: '600px',
      theme: 'light',
    }
    this.embedCode = null
    this.activeTab = 'iframe'
    this.loading = false
  }

  _handleOptionChange(field, value) {
    this.options = {...this.options, [field]: value}
    this.embedCode = null // Reset code when options change
  }

  _selectType(typeId) {
    this.selectedType = typeId
    this.embedCode = null
  }

  async _generateCode() {
    if (!this.entityId) {
      alert(this._('Please enter a person or entity ID'))
      return
    }

    this.loading = true

    try {
      const response = await fetch('/api/publishing/embed', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          type: this.selectedType,
          entityId: this.entityId,
          options: this.options,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate embed code')
      }

      this.embedCode = await response.json()
    } catch (error) {
      console.error('Error generating embed code:', error)
      alert(this._('Failed to generate embed code. Please try again.'))
    }

    this.loading = false
  }

  _copyCode() {
    const code =
      this.activeTab === 'iframe'
        ? this.embedCode.iframeCode
        : this.embedCode.scriptCode

    navigator.clipboard.writeText(code)

    const btn = this.renderRoot.querySelector('.copy-button')
    if (btn) {
      const originalText = btn.textContent
      btn.textContent = this._('Copied!')
      setTimeout(() => {
        btn.textContent = originalText
      }, 2000)
    }
  }

  render() {
    return html`
      <div class="header">
        <h1>${this._('Embed Widget Generator')}</h1>
        <p>${this._('Create embeddable widgets for your website or blog')}</p>
      </div>

      <div class="generator-container">
        ${this._renderOptionsPanel()} ${this._renderPreviewPanel()}
      </div>
    `
  }

  _renderOptionsPanel() {
    return html`
      <div class="options-panel">
        <h2 class="section-title">${this._('Widget Options')}</h2>

        <div class="form-group">
          <label>${this._('Widget Type')}</label>
          <div class="widget-types">
            ${this.widgetTypes.map(
              type => html`
                <div
                  class="widget-type ${this.selectedType === type.id
                    ? 'selected'
                    : ''}"
                  @click="${() => this._selectType(type.id)}"
                  @keydown="${clickKeyHandler}"
                  tabindex="0"
                  role="button"
                >
                  <div class="widget-type-icon">${type.icon}</div>
                  <div class="widget-type-label">${type.name}</div>
                </div>
              `
            )}
          </div>
        </div>

        <div class="form-group">
          <label>${this._('Person/Entity ID')}</label>
          <input
            type="text"
            .value="${this.entityId}"
            @input="${e => { this.entityId = e.target.value }}"
            placeholder="${this._('e.g., p0001 or I0001')}"
          />
        </div>

        <div class="form-group">
          <label>${this._('Generations')}</label>
          <select
            .value="${this.options.generations}"
            @change="${e =>
              this._handleOptionChange('generations', e.target.value)}"
          >
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
        </div>

        <div class="form-group">
          <label>${this._('Direction')}</label>
          <select
            .value="${this.options.direction}"
            @change="${e =>
              this._handleOptionChange('direction', e.target.value)}"
          >
            <option value="ancestors">${this._('Ancestors Only')}</option>
            <option value="descendants">${this._('Descendants Only')}</option>
            <option value="both">${this._('Both')}</option>
          </select>
        </div>

        <div class="form-group">
          <label>${this._('Size')}</label>
          <div class="size-inputs">
            <input
              type="text"
              .value="${this.options.width}"
              @input="${e => this._handleOptionChange('width', e.target.value)}"
              placeholder="Width"
            />
            <input
              type="text"
              .value="${this.options.height}"
              @input="${e =>
                this._handleOptionChange('height', e.target.value)}"
              placeholder="Height"
            />
          </div>
        </div>

        <div class="form-group">
          <label>${this._('Theme')}</label>
          <select
            .value="${this.options.theme}"
            @change="${e => this._handleOptionChange('theme', e.target.value)}"
          >
            <option value="light">${this._('Light')}</option>
            <option value="dark">${this._('Dark')}</option>
            <option value="auto">${this._('Auto (System)')}</option>
          </select>
        </div>

        <button
          class="generate-button"
          @click="${this._generateCode}"
          ?disabled="${this.loading || !this.entityId}"
        >
          ${this.loading
            ? this._('Generating...')
            : this._('Generate Embed Code')}
        </button>
      </div>
    `
  }

  _renderPreviewPanel() {
    return html`
      <div class="preview-panel">
        <h2 class="section-title">${this._('Preview & Code')}</h2>

        <div class="preview-container">
          ${this.embedCode
            ? html`
                <iframe
                  src="${this.embedCode.previewUrl}"
                  width="100%"
                  height="100%"
                  frameborder="0"
                  style="min-height: 250px;"
                  title="Widget Preview"
                ></iframe>
              `
            : html`
                <div class="preview-placeholder">
                  <div class="preview-placeholder-icon">📊</div>
                  <p>${this._('Configure options and generate code to see preview')}</p>
                </div>
              `}
        </div>

        ${this.embedCode ? this._renderCodeSection() : ''}
      </div>
    `
  }

  _setActiveTab(tab) {
    this.activeTab = tab
  }

  _renderCodeSection() {
    return html`
      <div class="code-section">
        <div class="code-tabs">
          <button
            class="code-tab ${this.activeTab === 'iframe' ? 'active' : ''}"
            @click="${() => this._setActiveTab('iframe')}"
          >
            iframe
          </button>
          <button
            class="code-tab ${this.activeTab === 'script' ? 'active' : ''}"
            @click="${() => this._setActiveTab('script')}"
          >
            JavaScript
          </button>
        </div>

        <div class="code-block">
          ${this.activeTab === 'iframe'
            ? this.embedCode.iframeCode
            : this.embedCode.scriptCode}
        </div>

        <button class="copy-button" @click="${this._copyCode}">
          ${this._('Copy Code')}
        </button>
      </div>
    `
  }
}

customElements.define('grampsjs-embed-generator', GrampsjsEmbedGenerator)
