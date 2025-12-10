import {html, css, LitElement} from 'lit'

export class GrampsjsCalendar extends LitElement {
  static get styles() {
    return css`
      :host {
        display: block;
      }

      .calendar {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 1px;
        background: var(--grampsjs-body-font-color-20);
        border: 1px solid var(--grampsjs-body-font-color-20);
      }

      .calendar-header {
        padding: 10px;
        text-align: center;
        font-weight: 600;
        background: var(--grampsjs-primary-color-20);
      }

      .calendar-day {
        min-height: 100px;
        padding: 5px;
        background: var(--grampsjs-card-background);
        position: relative;
      }

      .day-number {
        font-weight: 600;
        font-size: 0.9em;
        color: var(--grampsjs-body-font-color-70);
      }

      .event {
        margin-top: 5px;
        padding: 3px 5px;
        font-size: 0.75em;
        border-radius: 3px;
        cursor: pointer;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .event.birthday {
        background: #e3f2fd;
        color: #1976d2;
      }

      .event.death {
        background: #fce4ec;
        color: #c2185b;
      }

      .event.anniversary {
        background: #f3e5f5;
        color: #7b1fa2;
      }

      .event:hover {
        opacity: 0.8;
      }

      .empty-day {
        background: var(--grampsjs-body-font-color-10);
      }
    `
  }

  static get properties() {
    return {
      data: {type: Object},
      appState: {type: Object},
      year: {type: Number},
      month: {type: Number},
    }
  }

  constructor() {
    super()
    this.data = null
    this.appState = {}
    this.year = new Date().getFullYear()
    this.month = new Date().getMonth() + 1
  }

  _getDaysInMonth() {
    return new Date(this.year, this.month, 0).getDate()
  }

  _getFirstDayOfMonth() {
    return new Date(this.year, this.month - 1, 1).getDay()
  }

  _getEventsForDay(day) {
    if (!this.data || !this.data.events) return []
    return this.data.events.filter(event => event.date === day)
  }

  _handleEventClick(event) {
    if (event.person && event.person.handle) {
      window.location.href = `#/person/${event.person.handle}`
    }
  }

  _formatEvent(event) {
    let text = ''
    if (event.type === 'birthday') {
      text = `🎂 ${event.person.name}`
      if (event.age !== undefined) {
        text += ` (${event.age})`
      }
    } else if (event.type === 'death') {
      text = `† ${event.person.name}`
      if (event.age !== undefined) {
        text += ` (${event.age} yrs)`
      }
    } else if (event.type === 'anniversary') {
      text = `💍 ${event.person.name}`
    }
    return text
  }

  render() {
    const daysInMonth = this._getDaysInMonth()
    const firstDay = this._getFirstDayOfMonth()
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    const days = []

    // Add day headers
    dayNames.forEach(dayName => {
      days.push(html` <div class="calendar-header">${dayName}</div> `)
    })

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(html` <div class="calendar-day empty-day"></div> `)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const events = this._getEventsForDay(day)
      days.push(html`
        <div class="calendar-day">
          <div class="day-number">${day}</div>
          ${events.map(
            event => html`
              <div
                class="event ${event.type}"
                @click=${() => this._handleEventClick(event)}
                title="${this._formatEvent(event)}"
              >
                ${this._formatEvent(event)}
              </div>
            `,
          )}
        </div>
      `)
    }

    return html` <div class="calendar">${days}</div> `
  }
}

window.customElements.define('grampsjs-calendar', GrampsjsCalendar)
