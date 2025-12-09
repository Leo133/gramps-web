/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
/**
 * @fileoverview Editable table component for managing collections
 * Phase 10: Enhanced with design tokens and accessibility
 * @author Gramps Web Contributors
 */

import {css, html} from 'lit'

import {GrampsjsTableBase} from './GrampsjsTableBase.js'
import {fireEvent} from '../util.js'
import {designTokens} from '../design-tokens.js'
import {a11yStyles} from '../accessibility.js'
import {responsiveStyles} from '../responsive.js'
import '@material/mwc-icon-button'

export class GrampsjsEditableTable extends GrampsjsTableBase {
  static get styles() {
    return [
      super.styles,
      designTokens,
      a11yStyles,
      responsiveStyles,
      css`
        /* Phase 10: Enhanced table styling with design tokens */
        table {
          border-spacing: 0;
          width: 100%;
          border-radius: var(--radius-md, 8px);
          overflow: hidden;
        }

        th {
          /* Phase 10: Typography using design tokens */
          font-size: var(--type-label-large-size, 14px);
          font-weight: var(--font-weight-medium, 500);
          letter-spacing: var(--type-label-large-tracking, 0.1px);
          padding: var(--spacing-3, 12px) var(--spacing-4, 16px);
          text-align: left;
        }

        td {
          /* Phase 10: Touch-friendly cells */
          padding: var(--spacing-3, 12px) var(--spacing-4, 16px);
          min-height: var(--touch-target-min-size, 48px);
        }

        tr:hover td {
          background-color: var(--grampsjs-color-shade-240);
          cursor: pointer;
          /* Phase 10: Smooth transition */
          transition: background-color var(--duration-short-2, 100ms)
            var(--easing-standard);
        }

        /* Phase 10: Enhanced focus states for accessibility */
        tr:focus-visible td {
          outline: var(--focus-ring-width, 2px) solid
            var(--focus-ring-color, var(--md-sys-color-primary));
          outline-offset: -2px;
        }

        /* Phase 10: Touch-friendly icon buttons */
        mwc-icon-button {
          --mdc-icon-button-size: var(--touch-target-min-size, 48px);
        }

        /* Phase 10: Mobile optimization - horizontal scrolling */
        @media (max-width: 768px) {
          table {
            display: block;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }

          th,
          td {
            padding: var(--spacing-2, 8px) var(--spacing-3, 12px);
            font-size: var(--type-body-medium-size, 14px);
          }

          /* Phase 10: Ensure minimum touch targets on mobile */
          td {
            min-height: var(--touch-target-min-size, 48px);
          }
        }
      `,
    ]
  }

  static get properties() {
    return {
      edit: {type: Boolean},
      objType: {type: String},
      dialogContent: {type: String},
      dialogTitle: {type: String},
      _columns: {type: Array},
    }
  }

  constructor() {
    super()
    this.edit = false
    this.objType = ''
    this.dialogContent = ''
    this.dialogTitle = ''
    this._columns = []
  }

  render() {
    return html`
      ${Object.keys(this.data).length === 0
        ? ''
        : html`
            <table>
              <tr>
                ${this._columns.map(
                  column => html` <th>${this._(column)}</th> `
                )}
              </tr>
              ${this.sortData([...this.data]).map((obj, i, arr) =>
                this.row(obj, i, arr)
              )}
            </table>
          `}
      ${this.renderAfterTable()}
    `
  }

  // function to sort the data, if necessary
  sortData(dataCopy) {
    return dataCopy
  }

  renderAfterTable() {
    return ''
  }

  row(obj, i, arr) {
    return ''
  }

  _renderActionBtns(handle, first, last, edit = false, deleteFirst = true) {
    return html`
      ${first && !deleteFirst
        ? ''
        : html`
            <mwc-icon-button
              class="edit"
              icon="delete"
              @click="${e =>
                this._handleActionClick(e, `del${this.objType}`, handle)}"
            ></mwc-icon-button>
          `}
      ${first
        ? ''
        : html`
            <mwc-icon-button
              class="edit"
              icon="arrow_upward"
              @click="${e =>
                this._handleActionClick(e, `up${this.objType}`, handle)}"
            ></mwc-icon-button>
          `}
      ${last
        ? ''
        : html`
            <mwc-icon-button
              class="edit"
              icon="arrow_downward"
              @click="${e =>
                this._handleActionClick(e, `down${this.objType}`, handle)}"
            ></mwc-icon-button>
          `}
      ${edit
        ? html`
            <mwc-icon-button
              class="edit"
              icon="edit"
              @click="${e => this._handleEditClick(handle)}"
            ></mwc-icon-button>
          `
        : ''}
    `
  }

  _handleActionClick(e, action, handle) {
    fireEvent(this, 'edit:action', {action, handle})
    e.preventDefault()
    e.stopPropagation()
  }
}
