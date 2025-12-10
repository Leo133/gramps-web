import {LitElement, html, css} from 'lit'
import {designTokens} from '../design-tokens.js'
import '@material/mwc-dialog'
import '@material/mwc-button'
import './GrampsjsFormSelectObject.js'

export class GrampsjsFaceTagging extends LitElement {
  static get styles() {
    return [
      designTokens,
      css`
        :host {
          display: block;
        }
      `,
    ]
  }

  static get properties() {
    return {
      open: {type: Boolean},
      mediaHandle: {type: String},
      region: {type: Object}, // {x, y, width, height}
      selectedPerson: {type: String},
    }
  }

  constructor() {
    super()
    this.open = false
    this.selectedPerson = ''
  }

  render() {
    return html`
      <mwc-dialog
        ?open="${this.open}"
        heading="Tag Person"
        @closed="${this._handleClosed}"
      >
        <div>
          <p>Who is this?</p>
          <grampsjs-form-select-object
            type="Person"
            .value="${this.selectedPerson}"
            @change="${this._handlePersonSelect}"
          ></grampsjs-form-select-object>
        </div>
        <mwc-button slot="primaryAction" @click="${this._saveTag}"
          >Save</mwc-button
        >
        <mwc-button slot="secondaryAction" dialogAction="close"
          >Cancel</mwc-button
        >
      </mwc-dialog>
    `
  }

  _handleClosed() {
    this.open = false
    this.dispatchEvent(new CustomEvent('closed'))
  }

  _handlePersonSelect(e) {
    this.selectedPerson = e.detail.value
  }

  _saveTag() {
    if (!this.selectedPerson) return

    this.dispatchEvent(
      new CustomEvent('tag:save', {
        detail: {
          personHandle: this.selectedPerson,
          region: this.region,
        },
      })
    )
    this.open = false
  }
}

customElements.define('grampsjs-face-tagging', GrampsjsFaceTagging)
