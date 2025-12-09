import {html, css} from 'lit'

import {GrampsjsView} from './GrampsjsView.js'

import '../components/GrampsjsComparativeTimeline.js'

export class GrampsjsViewComparativeTimeline extends GrampsjsView {
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
      _data: {type: Array},
    }
  }

  constructor() {
    super()
    this.handles = ''
    this._data = []
  }

  renderContent() {
    if (this._data.length === 0) {
      if (this.loading) {
        return html``
      }
      return html`<div style="padding: 2em; text-align: center;">
        No timeline data available. Please provide person handles.
      </div>`
    }
    return this.renderElements()
  }

  renderElements() {
    return html`
      <grampsjs-comparative-timeline
        .data="${this._data}"
        .appState="${this.appState}"
      >
      </grampsjs-comparative-timeline>
    `
  }

  update(changed) {
    super.update(changed)
    if (this.active && changed.has('handles')) {
      this._updateData()
    }
  }

  _updateData() {
    if (this.handles) {
      const url = `/api/timelines/compare?handles=${this.handles}`
      this._data = []
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
}

window.customElements.define(
  'grampsjs-view-comparative-timeline',
  GrampsjsViewComparativeTimeline
)
