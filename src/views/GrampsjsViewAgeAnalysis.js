import {html, css} from 'lit'

import {GrampsjsView} from './GrampsjsView.js'

import '../components/GrampsjsAgeAnalysis.js'

export class GrampsjsViewAgeAnalysis extends GrampsjsView {
  static get styles() {
    return [
      super.styles,
      css`
        :host {
          margin: 0;
        }
      `,
    ]
  }

  static get properties() {
    return {
      handles: {type: String},
      _data: {type: Object},
    }
  }

  constructor() {
    super()
    this.handles = ''
    this._data = null
  }

  renderContent() {
    if (!this._data) {
      if (this.loading) {
        return html``
      }
      return html`<div style="padding: 2em; text-align: center;">
        No age analysis data available.
      </div>`
    }
    return this.renderElements()
  }

  renderElements() {
    return html`
      <grampsjs-age-analysis .data="${this._data}" .appState="${this.appState}">
      </grampsjs-age-analysis>
    `
  }

  update(changed) {
    super.update(changed)
    if (this.active && (changed.has('handles') || changed.has('active'))) {
      this._updateData()
    }
  }

  _updateData() {
    const url = this.handles
      ? `/api/timelines/age-analysis?handles=${this.handles}`
      : `/api/timelines/age-analysis`
    this._data = null
    this.loading = true
    this.appState.apiGet(url).then(data => {
      this.loading = false
      if ('data' in data) {
        this.error = false
        this._data = data.data
      } else if ('error' in data) {
        this.error = true
        this._errorMessage = data.error
      }
    })
  }
}

window.customElements.define(
  'grampsjs-view-age-analysis',
  GrampsjsViewAgeAnalysis
)
