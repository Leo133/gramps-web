/**
 * @fileoverview String input form component with design tokens and accessibility
 * @author Gramps.js
 */

import {html, css, LitElement} from 'lit'
import '@material/mwc-textfield'

import {sharedStyles} from '../SharedStyles.js'
import {fireEvent} from '../util.js'
import {GrampsjsAppStateMixin} from '../mixins/GrampsjsAppStateMixin.js'

import {designTokens} from '../design-tokens.js'
import {a11yStyles} from '../accessibility.js'
import {responsiveStyles} from '../responsive.js'

class GrampsjsFormString extends GrampsjsAppStateMixin(LitElement) {
  static get styles() {
    return [
      sharedStyles,
      designTokens,
      a11yStyles,
      responsiveStyles,
      css`
        mwc-textfield.fullwidth {
          width: 100%;
        }

        mwc-textfield {
          min-height: var(--touch-target-min-size, 48px);
        }
      `,
    ]
  }

  static get properties() {
    return {
      value: {type: String},
      label: {type: String},
      disabled: {type: Boolean},
      fullwidth: {type: Boolean},
      required: {type: Boolean},
      type: {type: String},
    }
  }

  constructor() {
    super()
    this.value = ''
    this.label = ''
    this.disabled = false
    this.fullwidth = false
    this.required = false
    this.type = 'text'
  }

  render() {
    return html`
      <mwc-textfield
        @input="${this.handleChange}"
        label="${this.label}"
        value="${this.value}"
        type="${this.type}"
        ?disabled="${this.disabled}"
        ?required="${this.required}"
        class="${this.fullwidth ? 'fullwidth' : ''}"
      ></mwc-textfield>
    `
  }

  reset() {
    this.shadowRoot.querySelector('mwc-textfield').value = ''
  }

  handleChange() {
    const el = this.shadowRoot.querySelector('mwc-textfield')
    if (el !== null) {
      fireEvent(this, 'formdata:changed', {data: el.value})
    }
  }

  isValid() {
    const el = this.shadowRoot.querySelector('mwc-textfield')
    if (el !== null) {
      if (el?.validity?.valid) {
        return true
      }
      return false
    }
    return true
  }
}

window.customElements.define('grampsjs-form-string', GrampsjsFormString)
