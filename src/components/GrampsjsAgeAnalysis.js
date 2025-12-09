import {html, css, LitElement} from 'lit'
import {sharedStyles} from '../SharedStyles.js'
import '@material/mwc-icon'

import {GrampsjsAppStateMixin} from '../mixins/GrampsjsAppStateMixin.js'

export class GrampsjsAgeAnalysis extends GrampsjsAppStateMixin(LitElement) {
  static get styles() {
    return [
      sharedStyles,
      css`
        :host {
          display: block;
        }

        .analysis-container {
          padding: 1em;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1em;
          margin-bottom: 2em;
        }

        .stat-card {
          background-color: var(--md-sys-color-surface-container);
          border-radius: 12px;
          padding: 1.5em;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .stat-label {
          font-size: 14px;
          color: var(--grampsjs-body-font-color-50);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 0.5em;
        }

        .stat-value {
          font-size: 32px;
          font-weight: 700;
          color: var(--md-sys-color-primary);
          font-family: var(--grampsjs-heading-font-family);
        }

        .stat-subtitle {
          font-size: 14px;
          color: var(--grampsjs-body-font-color-50);
          margin-top: 0.3em;
        }

        .chart-section {
          margin-bottom: 2em;
        }

        .chart-title {
          font-family: var(--grampsjs-heading-font-family);
          font-size: 20px;
          font-weight: 500;
          margin-bottom: 1em;
          color: var(--grampsjs-body-font-color);
        }

        .gender-bars {
          background-color: var(--md-sys-color-surface-container);
          border-radius: 12px;
          padding: 1.5em;
        }

        .gender-row {
          margin-bottom: 1.5em;
        }

        .gender-row:last-child {
          margin-bottom: 0;
        }

        .gender-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5em;
          font-size: 16px;
          font-weight: 500;
        }

        .gender-bar {
          height: 30px;
          background: linear-gradient(
            90deg,
            var(--md-sys-color-primary) 0%,
            var(--md-sys-color-secondary) 100%
          );
          border-radius: 15px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .gender-bar::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.2) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .century-chart {
          background-color: var(--md-sys-color-surface-container);
          border-radius: 12px;
          padding: 1.5em;
        }

        .century-row {
          display: flex;
          align-items: center;
          margin-bottom: 1em;
        }

        .century-label {
          min-width: 100px;
          font-weight: 500;
        }

        .century-bar-container {
          flex: 1;
          position: relative;
        }

        .century-bar {
          height: 25px;
          background-color: var(--md-sys-color-tertiary);
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .century-value {
          min-width: 80px;
          text-align: right;
          padding-left: 1em;
          font-size: 14px;
          color: var(--grampsjs-body-font-color-50);
        }

        .distribution-chart {
          background-color: var(--md-sys-color-surface-container);
          border-radius: 12px;
          padding: 1.5em;
          margin-top: 2em;
        }

        .histogram {
          display: flex;
          align-items: flex-end;
          justify-content: space-around;
          height: 200px;
          padding: 1em 0;
          border-bottom: 2px solid var(--md-sys-color-outline);
        }

        .histogram-bar {
          flex: 1;
          background: linear-gradient(
            0deg,
            var(--md-sys-color-primary) 0%,
            var(--md-sys-color-secondary) 100%
          );
          margin: 0 2px;
          border-radius: 4px 4px 0 0;
          transition: all 0.3s ease;
          min-width: 10px;
          position: relative;
        }

        .histogram-bar:hover {
          opacity: 0.8;
          transform: scaleY(1.05);
        }

        .histogram-label {
          display: flex;
          justify-content: space-around;
          padding-top: 0.5em;
          font-size: 12px;
          color: var(--grampsjs-body-font-color-50);
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
      data: {type: Object},
    }
  }

  constructor() {
    super()
    this.data = null
  }

  render() {
    if (!this.data) {
      return html`
        <div class="analysis-container">
          <div class="no-data">No age analysis data available</div>
        </div>
      `
    }

    return html`
      <div class="analysis-container">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">Total People</div>
            <div class="stat-value">${this.data.people}</div>
          </div>

          <div class="stat-card">
            <div class="stat-label">With Lifespan Data</div>
            <div class="stat-value">${this.data.with_lifespan}</div>
            <div class="stat-subtitle">
              ${this._getPercentage(this.data.with_lifespan, this.data.people)}%
              of total
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-label">Average Lifespan</div>
            <div class="stat-value">${this.data.average_lifespan}</div>
            <div class="stat-subtitle">years</div>
          </div>

          <div class="stat-card">
            <div class="stat-label">Median Lifespan</div>
            <div class="stat-value">${this.data.median_lifespan}</div>
            <div class="stat-subtitle">
              Range: ${this.data.min_lifespan} - ${this.data.max_lifespan}
            </div>
          </div>
        </div>

        ${this.renderGenderAnalysis()} ${this.renderCenturyAnalysis()}
        ${this.renderDistribution()}
      </div>
    `
  }

  renderGenderAnalysis() {
    const byGender = this.data.by_gender
    const maxLifespan = Math.max(
      byGender.male.avg_lifespan,
      byGender.female.avg_lifespan,
      byGender.unknown.avg_lifespan
    )

    return html`
      <div class="chart-section">
        <div class="chart-title">Average Lifespan by Gender</div>
        <div class="gender-bars">
          ${this.renderGenderBar(
            'Male',
            byGender.male.count,
            byGender.male.avg_lifespan,
            maxLifespan
          )}
          ${this.renderGenderBar(
            'Female',
            byGender.female.count,
            byGender.female.avg_lifespan,
            maxLifespan
          )}
          ${byGender.unknown.count > 0
            ? this.renderGenderBar(
                'Unknown',
                byGender.unknown.count,
                byGender.unknown.avg_lifespan,
                maxLifespan
              )
            : ''}
        </div>
      </div>
    `
  }

  // eslint-disable-next-line class-methods-use-this
  renderGenderBar(label, count, avgLifespan, maxLifespan) {
    const width = maxLifespan > 0 ? (avgLifespan / maxLifespan) * 100 : 0

    return html`
      <div class="gender-row">
        <div class="gender-label">
          <span>${label} (${count})</span>
          <span>${avgLifespan} years</span>
        </div>
        <div class="gender-bar" style="width: ${width}%"></div>
      </div>
    `
  }

  renderCenturyAnalysis() {
    const byCentury = this.data.by_century
    const centuries = Object.keys(byCentury)
      .map(Number)
      .sort((a, b) => a - b)

    if (centuries.length === 0) return ''

    const maxCount = Math.max(
      ...centuries.map(century => byCentury[century].count)
    )

    return html`
      <div class="chart-section">
        <div class="chart-title">People by Birth Century</div>
        <div class="century-chart">
          ${centuries.map(century =>
            this.renderCenturyBar(century, byCentury[century].count, maxCount)
          )}
        </div>
      </div>
    `
  }

  // eslint-disable-next-line class-methods-use-this
  renderCenturyBar(century, count, maxCount) {
    const width = maxCount > 0 ? (count / maxCount) * 100 : 0

    return html`
      <div class="century-row">
        <div class="century-label">${century}s</div>
        <div class="century-bar-container">
          <div class="century-bar" style="width: ${width}%"></div>
        </div>
        <div class="century-value">${count} people</div>
      </div>
    `
  }

  renderDistribution() {
    if (!this.data.lifespans || this.data.lifespans.length === 0) return ''

    // Create histogram bins
    const bins = this._createHistogramBins(this.data.lifespans)
    const maxCount = Math.max(...bins.map(b => b.count))

    return html`
      <div class="chart-section">
        <div class="chart-title">Lifespan Distribution</div>
        <div class="distribution-chart">
          <div class="histogram">
            ${bins.map(
              bin => html`
                <div
                  class="histogram-bar"
                  style="height: ${maxCount > 0
                    ? (bin.count / maxCount) * 100
                    : 0}%"
                  title="${bin.range}: ${bin.count} people"
                ></div>
              `
            )}
          </div>
          <div class="histogram-label">
            ${bins.map(bin => html`<span>${bin.label}</span>`)}
          </div>
        </div>
      </div>
    `
  }

  // eslint-disable-next-line class-methods-use-this
  _createHistogramBins(lifespans) {
    const bins = []
    const ranges = [
      {min: 0, max: 20, label: '0-20'},
      {min: 20, max: 40, label: '20-40'},
      {min: 40, max: 60, label: '40-60'},
      {min: 60, max: 80, label: '60-80'},
      {min: 80, max: 100, label: '80-100'},
      {min: 100, max: 120, label: '100+'},
    ]

    for (const range of ranges) {
      const count = lifespans.filter(
        age => age >= range.min && age < range.max
      ).length
      bins.push({
        range: `${range.min}-${range.max}`,
        label: range.label,
        count,
      })
    }

    return bins
  }

  // eslint-disable-next-line class-methods-use-this
  _getPercentage(part, total) {
    if (total === 0) return 0
    return Math.round((part / total) * 100)
  }
}

window.customElements.define('grampsjs-age-analysis', GrampsjsAgeAnalysis)
