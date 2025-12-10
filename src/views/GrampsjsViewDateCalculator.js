import {html, css} from 'lit'
import {GrampsjsView} from './GrampsjsView.js'

export class GrampsjsViewDateCalculator extends GrampsjsView {
  static get styles() {
    return [
      super.styles,
      css`
        :host {
          padding: 20px;
        }

        .calculator-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background: var(--grampsjs-card-background);
          border-radius: 8px;
        }

        h2 {
          margin-top: 0;
          color: var(--grampsjs-primary-color);
        }

        .form-group {
          margin-bottom: 20px;
        }

        label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
        }

        input,
        select {
          width: 100%;
          padding: 10px;
          border: 1px solid var(--grampsjs-body-font-color-30);
          border-radius: 4px;
          font-size: 1em;
        }

        button {
          padding: 10px 20px;
          background: var(--grampsjs-primary-color);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1em;
        }

        button:hover {
          opacity: 0.9;
        }

        .result {
          margin-top: 20px;
          padding: 15px;
          background: var(--grampsjs-primary-color-10);
          border-radius: 4px;
          border-left: 4px solid var(--grampsjs-primary-color);
        }

        .result h3 {
          margin-top: 0;
        }

        .result-detail {
          margin: 10px 0;
          font-size: 1.1em;
        }
      `,
    ]
  }

  static get properties() {
    return {
      _operation: {type: String},
      _date1: {type: String},
      _date2: {type: String},
      _amount: {type: Number},
      _unit: {type: String},
      _result: {type: Object},
    }
  }

  constructor() {
    super()
    this._operation = 'age'
    this._date1 = ''
    this._date2 = ''
    this._amount = 0
    this._unit = 'days'
    this._result = null
  }

  async _handleCalculate() {
    const body = {
      operation: this._operation,
      date1: this._date1,
    }

    if (this._operation === 'age' || this._operation === 'difference') {
      if (this._date2) {
        body.date2 = this._date2
      }
    } else if (this._operation === 'add' || this._operation === 'subtract') {
      body.amount = this._amount
      body.unit = this._unit
    }

    try {
      const response = await fetch('/api/visualizations/date-calculator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        this._result = await response.json()
      }
    } catch (error) {
      console.error('Error calculating date:', error)
    }
  }

  _handleOperationChange(e) {
    this._operation = e.target.value
    this._result = null
  }

  renderContent() {
    return html`
      <div class="calculator-container">
        <h2>${this._('Date Calculator')}</h2>

        <div class="form-group">
          <label for="operation">${this._('Operation')}</label>
          <select
            id="operation"
            @change=${this._handleOperationChange}
            .value=${this._operation}
          >
            <option value="age">${this._('Calculate Age')}</option>
            <option value="difference">
              ${this._('Date Difference')}
            </option>
            <option value="dayOfWeek">${this._('Day of Week')}</option>
            <option value="add">${this._('Add to Date')}</option>
            <option value="subtract">${this._('Subtract from Date')}</option>
          </select>
        </div>

        <div class="form-group">
          <label for="date1">
            ${this._operation === 'age'
              ? this._('Birth Date')
              : this._('Date 1')}
          </label>
          <input
            type="date"
            id="date1"
            .value=${this._date1}
            @input=${e => {
              this._date1 = e.target.value
            }}
          />
        </div>

        ${this._operation === 'age' || this._operation === 'difference'
          ? html`
              <div class="form-group">
                <label for="date2">
                  ${this._operation === 'age'
                    ? this._('As of Date (optional)')
                    : this._('Date 2')}
                </label>
                <input
                  type="date"
                  id="date2"
                  .value=${this._date2}
                  @input=${e => {
                    this._date2 = e.target.value
                  }}
                />
              </div>
            `
          : ''}
        ${this._operation === 'add' || this._operation === 'subtract'
          ? html`
              <div class="form-group">
                <label for="amount">${this._('Amount')}</label>
                <input
                  type="number"
                  id="amount"
                  .value=${this._amount}
                  @input=${e => {
                    this._amount = parseInt(e.target.value)
                  }}
                />
              </div>

              <div class="form-group">
                <label for="unit">${this._('Unit')}</label>
                <select
                  id="unit"
                  .value=${this._unit}
                  @change=${e => {
                    this._unit = e.target.value
                  }}
                >
                  <option value="days">${this._('Days')}</option>
                  <option value="months">${this._('Months')}</option>
                  <option value="years">${this._('Years')}</option>
                </select>
              </div>
            `
          : ''}

        <button @click=${this._handleCalculate}>${this._('Calculate')}</button>

        ${this._result
          ? html`
              <div class="result">
                <h3>${this._('Result')}</h3>
                ${this._operation === 'age' || this._operation === 'difference'
                  ? html`
                      <div class="result-detail">
                        ${this._result.description}
                      </div>
                      <div class="result-detail">
                        ${this._('Total days')}: ${this._result.totalDays}
                      </div>
                      ${this._result.totalWeeks
                        ? html`
                            <div class="result-detail">
                              ${this._('Total weeks')}:
                              ${this._result.totalWeeks}
                            </div>
                          `
                        : ''}
                    `
                  : ''}
                ${this._operation === 'dayOfWeek'
                  ? html`
                      <div class="result-detail">
                        ${this._result.dayOfWeek}
                      </div>
                    `
                  : ''}
                ${this._operation === 'add' || this._operation === 'subtract'
                  ? html`
                      <div class="result-detail">
                        ${this._('Result')}: ${this._result.result}
                      </div>
                    `
                  : ''}
              </div>
            `
          : ''}
      </div>
    `
  }
}

window.customElements.define(
  'grampsjs-view-date-calculator',
  GrampsjsViewDateCalculator,
)
