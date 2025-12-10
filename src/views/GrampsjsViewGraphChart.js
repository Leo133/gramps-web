import {html, css} from 'lit'
import {GrampsjsView} from './GrampsjsView.js'
import '../components/GrampsjsGraphChart.js'

export class GrampsjsViewGraphChart extends GrampsjsView {
  static get styles() {
    return [
      super.styles,
      css`
        :host {
          margin: 0;
        }

        #chart-container {
          width: 100%;
          height: calc(100vh - 120px);
          position: relative;
        }

        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
          font-size: 1.2em;
          color: var(--grampsjs-body-font-color-50);
        }
      `,
    ]
  }

  static get properties() {
    return {
      _data: {type: Object},
      _loading: {type: Boolean},
    }
  }

  constructor() {
    super()
    this._data = null
    this._loading = true
  }

  connectedCallback() {
    super.connectedCallback()
    this._loadGraphData()
  }

  async _loadGraphData() {
    this._loading = true
    try {
      const response = await fetch('/api/visualizations/graph-data')
      if (response.ok) {
        this._data = await response.json()
      }
    } catch (error) {
      // Error loading graph data
      this._data = null
    } finally {
      this._loading = false
    }
  }

  renderContent() {
    if (this._loading) {
      return html`
        <div id="chart-container">
          <div class="loading">${this._('Loading graph...')}</div>
        </div>
      `
    }

    if (!this._data) {
      return html`
        <div id="chart-container">
          <div class="loading">${this._('No data available')}</div>
        </div>
      `
    }

    return html`
      <div id="chart-container">
        <grampsjs-graph-chart
          .data=${this._data}
          .appState=${this.appState}
        ></grampsjs-graph-chart>
      </div>
    `
  }
}

window.customElements.define(
  'grampsjs-view-graph-chart',
  GrampsjsViewGraphChart
)
