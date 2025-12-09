import {html, css, LitElement} from 'lit'
import {sharedStyles} from '../SharedStyles.js'
import '@material/mwc-icon'

import {GrampsjsAppStateMixin} from '../mixins/GrampsjsAppStateMixin.js'

export class GrampsjsComparativeTimeline extends GrampsjsAppStateMixin(
  LitElement
) {
  static get styles() {
    return [
      sharedStyles,
      css`
        :host {
          display: block;
        }

        .comparative-container {
          padding: 1em;
        }

        .person-row {
          margin-bottom: 2em;
          border: 1px solid var(--md-sys-color-outline);
          border-radius: 8px;
          overflow: hidden;
        }

        .person-header {
          background-color: var(--md-sys-color-primary-container);
          color: var(--md-sys-color-on-primary-container);
          padding: 1em;
          font-family: var(--grampsjs-heading-font-family);
          font-size: 20px;
          font-weight: 500;
        }

        .person-lifespan {
          font-size: 16px;
          font-weight: 400;
          opacity: 0.9;
          margin-top: 0.3em;
        }

        .timeline-bar {
          position: relative;
          height: 60px;
          background-color: var(--md-sys-color-surface-variant);
          margin: 1em;
          border-radius: 4px;
          overflow: visible;
        }

        .lifespan-bar {
          position: absolute;
          height: 100%;
          background: linear-gradient(
            90deg,
            var(--md-sys-color-primary) 0%,
            var(--md-sys-color-secondary) 100%
          );
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--md-sys-color-on-primary);
          font-weight: 500;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .event-marker {
          position: absolute;
          width: 12px;
          height: 12px;
          background-color: var(--md-sys-color-tertiary);
          border: 2px solid white;
          border-radius: 50%;
          top: 50%;
          transform: translateY(-50%);
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .event-marker:hover {
          width: 16px;
          height: 16px;
          background-color: var(--md-sys-color-tertiary-container);
        }

        .year-axis {
          display: flex;
          justify-content: space-between;
          padding: 0.5em 1em;
          font-size: 14px;
          color: var(--grampsjs-body-font-color-50);
        }

        .events-list {
          padding: 1em;
          background-color: var(--md-sys-color-surface);
        }

        .event-item {
          padding: 0.5em;
          margin-bottom: 0.3em;
          border-left: 3px solid var(--md-sys-color-tertiary);
          padding-left: 1em;
        }

        .event-date {
          font-weight: 500;
          color: var(--md-sys-color-primary);
        }

        .event-label {
          margin-left: 0.5em;
        }

        .no-data {
          text-align: center;
          padding: 2em;
          color: var(--grampsjs-body-font-color-50);
        }
      `,
    ]
  }

  static get properties() {
    return {
      data: {type: Array},
      minYear: {type: Number},
      maxYear: {type: Number},
    }
  }

  constructor() {
    super()
    this.data = []
    this.minYear = 1800
    this.maxYear = 2025
  }

  connectedCallback() {
    super.connectedCallback()
    this._calculateYearRange()
  }

  updated(changedProperties) {
    super.updated(changedProperties)
    if (changedProperties.has('data')) {
      this._calculateYearRange()
    }
  }

  render() {
    if (this.data.length === 0) {
      return html`
        <div class="comparative-container">
          <div class="no-data">No timeline data available</div>
        </div>
      `
    }

    return html`
      <div class="comparative-container">
        ${this.data.map(personData => this.renderPersonTimeline(personData))}
      </div>
    `
  }

  renderPersonTimeline(personData) {
    const {person, events} = personData
    const birthYear = this._extractYear(person.birth_date)
    const deathYear = this._extractYear(person.death_date)

    const lifespan = birthYear && deathYear ? deathYear - birthYear : null

    return html`
      <div class="person-row">
        <div class="person-header">
          ${person.name || 'Unknown'}
          ${lifespan
            ? html`
                <div class="person-lifespan">
                  ${birthYear} - ${deathYear} (${lifespan} years)
                </div>
              `
            : ''}
        </div>

        ${birthYear
          ? html`
              <div class="timeline-bar">
                ${this.renderLifespanBar(birthYear, deathYear)}
                ${events
                  .filter(e => !e.historical)
                  .map(event => this.renderEventMarker(event))}
              </div>
              <div class="year-axis">${this.renderYearAxis()}</div>
            `
          : ''}

        <div class="events-list">
          ${events
            .filter(e => !e.historical)
            .map(
              event => html`
                <div class="event-item">
                  <span class="event-date">${event.date}</span>
                  <span class="event-label">${event.label}</span>
                  ${event.description
                    ? html` - <span>${event.description}</span>`
                    : ''}
                </div>
              `
            )}
        </div>
      </div>
    `
  }

  renderLifespanBar(birthYear, deathYear) {
    if (!birthYear) return ''

    const endYear = deathYear || new Date().getFullYear()
    const left = this._yearToPercent(birthYear)
    const width = this._yearToPercent(endYear) - left

    return html`
      <div
        class="lifespan-bar"
        style="left: ${left}%; width: ${width}%"
        title="${birthYear} - ${endYear}"
      >
        ${birthYear} - ${endYear}
      </div>
    `
  }

  renderEventMarker(event) {
    const year = this._extractYear(event.date)
    if (!year) return ''

    const left = this._yearToPercent(year)

    return html`
      <div
        class="event-marker"
        style="left: ${left}%"
        title="${event.label} (${event.date})"
      ></div>
    `
  }

  renderYearAxis() {
    const range = this.maxYear - this.minYear
    let interval
    if (range > 100) {
      interval = 50
    } else if (range > 50) {
      interval = 25
    } else {
      interval = 10
    }
    const years = []

    for (
      let year = Math.ceil(this.minYear / interval) * interval;
      year <= this.maxYear;
      year += interval
    ) {
      years.push(year)
    }

    return html` ${years.map(year => html`<span>${year}</span>`)} `
  }

  _calculateYearRange() {
    if (this.data.length === 0) return

    let min = Infinity
    let max = -Infinity

    for (const personData of this.data) {
      const birthYear = this._extractYear(personData.person.birth_date)
      const deathYear = this._extractYear(personData.person.death_date)

      if (birthYear) {
        min = Math.min(min, birthYear)
      }
      if (deathYear) {
        max = Math.max(max, deathYear)
      }

      for (const event of personData.events) {
        const eventYear = this._extractYear(event.date)
        if (eventYear) {
          min = Math.min(min, eventYear)
          max = Math.max(max, eventYear)
        }
      }
    }

    if (min !== Infinity && max !== -Infinity) {
      // Add some padding
      const padding = Math.ceil((max - min) * 0.1)
      this.minYear = min - padding
      this.maxYear = max + padding
    }
  }

  // eslint-disable-next-line class-methods-use-this
  _extractYear(dateStr) {
    if (!dateStr) return null

    // Try to extract year from various formats
    const yearMatch = dateStr.match(/\d{4}/)
    if (yearMatch) {
      return parseInt(yearMatch[0], 10)
    }

    return null
  }

  _yearToPercent(year) {
    const range = this.maxYear - this.minYear
    if (range === 0) return 50

    return ((year - this.minYear) / range) * 100
  }
}

window.customElements.define(
  'grampsjs-comparative-timeline',
  GrampsjsComparativeTimeline
)
