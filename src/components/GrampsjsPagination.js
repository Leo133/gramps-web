/**
 * @fileoverview Pagination component for list views
 * @author Gramps.js Team
 */

import {html, css, LitElement} from 'lit'

import '@material/mwc-icon'
import '@material/mwc-button'

import {sharedStyles} from '../SharedStyles.js'
import {designTokens} from '../design-tokens.js'
import {a11yStyles} from '../accessibility.js'
import {responsiveStyles} from '../responsive.js'
import {GrampsjsAppStateMixin} from '../mixins/GrampsjsAppStateMixin.js'

class GrampsjsPagination extends GrampsjsAppStateMixin(LitElement) {
  static get styles() {
    return [
      sharedStyles,
      designTokens,
      a11yStyles,
      responsiveStyles,
      css`
        .paging {
          font-size: var(--type-body-medium-size, 14px);
          margin-top: var(--spacing-6, 24px);
          text-align: center;
          padding: var(--spacing-4, 16px) var(--spacing-2, 8px);
        }

        .span {
          color: var(--grampsjs-body-font-color-90);
          padding: 0 var(--spacing-2, 8px);
        }

        mwc-button {
          --mdc-ripple-focus-opacity: 0;
          --mdc-theme-primary: var(--grampsjs-body-font-color-70);
          min-height: var(--touch-target-min-size, 48px);
          min-width: var(--touch-target-min-size, 48px);
        }

        .pagebtn {
          --mdc-button-horizontal-padding: 0;
        }

        mwc-icon.more {
          color: var(--grampsjs-body-font-color-20);
          position: relative;
          top: 0.35em;
        }

        @media (max-width: 768px) {
          .paging {
            margin-top: var(--spacing-4, 16px);
            padding: var(--spacing-2, 8px);
          }
        }
      `,
    ]
  }

  static get properties() {
    return {
      page: {type: Number},
      pages: {type: Number},
      link: {type: String},
    }
  }

  constructor() {
    super()
    this.page = 1
    this.pages = -1
  }

  render() {
    if (this.pages <= 0) {
      return html``
    }
    return html`
      <div class="paging">
        ${this._renderPrevBtn()} ${this._renderPageBtn(1)}
        ${this.pages > 1 ? this._renderPageBtn(2) : ''}
        ${this.page - 1 > 3
          ? html`<mwc-icon class="more">more_horiz</mwc-icon>`
          : ''}
        ${this.page - 1 > 2 && this.page - 1 < this.pages - 1
          ? this._renderPageBtn(this.page - 1)
          : ''}
        ${this.page > 2 && this.page < this.pages - 1
          ? this._renderPageBtn(this.page)
          : ''}
        ${this.page + 1 > 2 && this.page + 1 < this.pages - 1
          ? this._renderPageBtn(this.page + 1)
          : ''}
        ${this.page + 1 < this.pages - 2
          ? html`<mwc-icon class="more">more_horiz</mwc-icon>`
          : ''}
        ${this.pages > 3 ? this._renderPageBtn(this.pages - 1) : ''}
        ${this.pages > 2 ? this._renderPageBtn(this.pages) : ''}
        ${this._renderNextBtn()}
        <div></div>
      </div>
    `
  }

  _renderPageBtn(page) {
    return html`
      <mwc-button
        width="30px"
        class="pagebtn"
        ?disabled=${this.page === page}
        ?unelevated=${this.page === page}
        @click="${() => this._changePage(page)}"
        label="${page}"
      >
      </mwc-button>
    `
  }

  _renderPrevBtn() {
    return html`
      <mwc-button
        icon="navigate_before"
        ?disabled=${this.page === 1}
        @click="${() => this._changePage(this.page - 1)}"
        label="${this._('Previous')}"
      >
      </mwc-button>
    `
  }

  _renderNextBtn() {
    return html`
      <mwc-button
        icon="navigate_next"
        ?disabled=${this.page === this.pages}
        @click="${() => this._changePage(this.page + 1)}"
        label="${this._('Next')}"
        trailingIcon
      >
      </mwc-button>
    `
  }

  _changePage(page) {
    if (page !== this.page) {
      this.page = page
      this._fireEvent()
    }
  }

  _fireEvent() {
    this.dispatchEvent(
      new CustomEvent('page:changed', {
        bubbles: true,
        composed: true,
        detail: {page: this.page},
      })
    )
  }
}

window.customElements.define('grampsjs-pagination', GrampsjsPagination)
