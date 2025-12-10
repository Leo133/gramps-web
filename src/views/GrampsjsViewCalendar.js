import {html, css} from 'lit'
import {GrampsjsView} from './GrampsjsView.js'
import '../components/GrampsjsCalendar.js'

export class GrampsjsViewCalendar extends GrampsjsView {
  static get styles() {
    return [
      super.styles,
      css`
        :host {
          margin: 0;
          padding: 20px;
        }

        #calendar-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding: 10px;
          background: var(--grampsjs-card-background);
          border-radius: 8px;
        }

        .month-selector {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .month-selector button {
          padding: 8px 16px;
          background: var(--grampsjs-primary-color);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .month-selector button:hover {
          opacity: 0.9;
        }

        .month-display {
          font-size: 1.5em;
          font-weight: 500;
          min-width: 200px;
          text-align: center;
        }

        .loading {
          text-align: center;
          padding: 40px;
          font-size: 1.2em;
          color: var(--grampsjs-body-font-color-50);
        }
      `,
    ]
  }

  static get properties() {
    return {
      _year: {type: Number},
      _month: {type: Number},
      _data: {type: Object},
      _loading: {type: Boolean},
    }
  }

  constructor() {
    super()
    const now = new Date()
    this._year = now.getFullYear()
    this._month = now.getMonth() + 1
    this._data = null
    this._loading = true
  }

  connectedCallback() {
    super.connectedCallback()
    this._loadCalendarData()
  }

  async _loadCalendarData() {
    this._loading = true
    try {
      const response = await fetch(
        `/api/visualizations/calendar/${this._year}/${this._month}`,
      )
      if (response.ok) {
        this._data = await response.json()
      }
    } catch (error) {
      console.error('Error loading calendar data:', error)
    } finally {
      this._loading = false
    }
  }

  _handlePrevMonth() {
    if (this._month === 1) {
      this._month = 12
      this._year--
    } else {
      this._month--
    }
    this._loadCalendarData()
  }

  _handleNextMonth() {
    if (this._month === 12) {
      this._month = 1
      this._year++
    } else {
      this._month++
    }
    this._loadCalendarData()
  }

  _getMonthName() {
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ]
    return monthNames[this._month - 1]
  }

  renderContent() {
    return html`
      <div id="calendar-container">
        <div class="controls">
          <div class="month-selector">
            <button @click=${this._handlePrevMonth}>
              ${this._('Previous')}
            </button>
            <div class="month-display">
              ${this._getMonthName()} ${this._year}
            </div>
            <button @click=${this._handleNextMonth}>${this._('Next')}</button>
          </div>
        </div>

        ${this._loading
          ? html` <div class="loading">${this._('Loading calendar...')}</div> `
          : this._data
            ? html`
                <grampsjs-calendar
                  .data=${this._data}
                  .appState=${this.appState}
                  .year=${this._year}
                  .month=${this._month}
                ></grampsjs-calendar>
              `
            : html` <div class="loading">${this._('No data available')}</div> `}
      </div>
    `
  }
}

window.customElements.define('grampsjs-view-calendar', GrampsjsViewCalendar)
