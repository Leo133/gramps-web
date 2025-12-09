/**
 * @fileoverview User registration form component
 * @author Gramps.js Team
 */

/* eslint-disable lit-a11y/click-events-have-key-events */
import {html, css, LitElement} from 'lit'
import '@material/web/textfield/outlined-text-field'

import {sharedStyles} from '../SharedStyles.js'
import {designTokens} from '../design-tokens.js'
import {a11yStyles} from '../accessibility.js'
import {responsiveStyles} from '../responsive.js'
import {apiRegisterUser} from '../api.js'
import {fireEvent} from '../util.js'

import {GrampsjsAppStateMixin} from '../mixins/GrampsjsAppStateMixin.js'

class GrampsjsFormRegister extends GrampsjsAppStateMixin(LitElement) {
  static get styles() {
    return [
      sharedStyles,
      designTokens,
      a11yStyles,
      responsiveStyles,
      css`
        #register-container {
          margin: auto;
          height: 100%;
          max-width: 20em;
          padding: var(--spacing-4, 16px);
        }

        #register-form {
          position: relative;
          top: 20vh;
        }

        #register-form h2 {
          font-size: var(--type-headline-small-size, 24px);
          font-weight: var(--type-headline-small-weight, 400);
          margin-bottom: var(--spacing-4, 16px);
        }

        #register-form md-outlined-text-field {
          width: 100%;
          margin-bottom: var(--spacing-3, 12px);
        }

        mwc-button {
          min-height: var(--touch-target-min-size, 48px);
          width: 100%;
          margin-top: var(--spacing-2, 8px);
        }

        p.reset-link {
          padding-top: var(--spacing-4, 16px);
          font-size: var(--type-body-medium-size, 14px);
        }

        p.success {
          padding-top: var(--spacing-4, 16px);
          color: var(--grampsjs-alert-success-font-color);
          font-size: var(--type-title-medium-size, 16px);
          font-weight: 400;
          --mdc-icon-size: 1.6em;
          line-height: 1.4em;
          text-align: center;
        }

        .link {
          cursor: pointer;
          text-decoration: underline;
        }

        .link:focus-visible {
          outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color);
          outline-offset: var(--focus-ring-offset, 2px);
          border-radius: var(--radius-xs, 2px);
        }

        mwc-circular-progress {
          --mdc-theme-primary: var(--mdc-theme-on-primary);
        }

        @media (max-width: 768px) {
          #register-container {
            padding: var(--spacing-2, 8px);
          }

          #register-form h2 {
            font-size: var(--type-title-large-size, 22px);
          }
        }
      `,
    ]
  }

  static get properties() {
    return {
      isFormValid: {type: Boolean},
      email: {type: String},
      emailError: {type: String},
      register: {type: Boolean},
      tree: {type: String},
    }
  }

  constructor() {
    super()
    this.isFormValid = false
    this.register = true
    this.email = ''
    this.emailError = ''
    this.tree = ''
  }

  render() {
    return html`
      <div id="register-container">
        <form id="register-form" @keydown="${this._checkFormValid}">
          <h2>${this._('Register to Gramps Web')}</h2>
          <div id="inner-form">
            <md-outlined-text-field
              required
              outlined
              autocapitalize="off"
              id="username"
              label="${this._('Username')}"
              type="text"
            ></md-outlined-text-field>
            <md-outlined-text-field
              required
              outlined
              autocapitalize="off"
              id="password"
              label="${this._('Password')}"
              @input="${this._handlePasswordInput}"
              type="password"
            ></md-outlined-text-field>
            <md-outlined-text-field
              required
              outlined
              autocapitalize="off"
              id="password2"
              error-text="${this._('Passwords do not match.')}"
              label="${this._('Confirm Password')}"
              @input="${this._handleConfirmPasswordInput}"
              type="password"
            ></md-outlined-text-field>
            <md-outlined-text-field
              id="email"
              required
              label="${this._('E-mail')}"
              .value="${this.email}"
              @input="${this.handleEmailInput}"
              ?error="${this.emailError !== ''}"
              error-text="${this.emailError}"
              type="email"
            ></md-outlined-text-field>
            <md-outlined-text-field
              required
              outlined
              id="fullname"
              @input="${this._checkFormValid}"
              label="${this._('Full Name')}"
              type="text"
            ></md-outlined-text-field>
            <mwc-button
              raised
              label="${this._('Register new account')}"
              type="submit"
              @click="${this._register}"
              ?disabled="${!this.isFormValid}"
            >
              <span slot="trailingIcon" style="display:none;">
                <mwc-circular-progress
                  indeterminate
                  density="-7"
                  closed
                  id="login-progress"
                >
                </mwc-circular-progress>
              </span>
            </mwc-button>
          </div>
          <p class="success" id="register-success" style="display:none;">
            <mwc-icon>check_circle</mwc-icon><br />
            ${this._('New account registered successfully.')}
            <br />
            ${this._(
              'Please confirm your e-mail address by clicking the link in the e-mail you received and then wait for the tree owner to activate your account.'
            )}
          </p>
          <p class="reset-link">
            ${this._('Already have an account?')}
            <span class="link" @click="${this._handleClickLogin}">
              ${this._('login')}
            </span>
          </p>
        </form>
      </div>
    `
  }

  _handleClickLogin() {
    this.register = false
    this._handleNav('login')
  }

  _handleNav(path) {
    fireEvent(this, 'nav', {path})
  }

  _handlePasswordInput() {
    const pwField = this.shadowRoot.getElementById('password')
    const pw2Field = this.shadowRoot.getElementById('password2')
    // Only update if pw2Field has been set
    if (pw2Field.value !== '') {
      pw2Field.error = pwField.value !== pw2Field.value
      this._checkFormValid()
    }
  }

  _handleConfirmPasswordInput() {
    const pwField = this.shadowRoot.getElementById('password')
    const pw2Field = this.shadowRoot.getElementById('password2')
    // Set error attribute if passwords do not match
    pw2Field.error = pwField.value !== pw2Field.value
    this._checkFormValid()
  }

  handleEmailInput(e) {
    this.email = e.target.value
    this.validateEmail()
    // call check async
    setTimeout(() => {
      this._checkFormValid()
    }, 0)
  }

  validateEmail() {
    // using email pattern from https://emailregex.com/
    const emailPattern =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    this.emailError = emailPattern.test(this.email)
      ? ''
      : this._('Invalid E-mail address')
  }

  _checkFormValid() {
    const mdFields = Array.from(
      this.shadowRoot.querySelectorAll('md-outlined-text-field')
    )
    // form is valid if all fields are valid
    this.isFormValid = mdFields.every(
      field => field.validity.valid && !field.error
    )
  }

  async _register(e) {
    e?.preventDefault()
    e?.stopPropagation()

    const userField = this.shadowRoot.getElementById('username')
    const pwField = this.shadowRoot.getElementById('password')
    const emailField = this.shadowRoot.getElementById('email')
    const nameField = this.shadowRoot.getElementById('fullname')
    const tree = this.tree || ''
    const res = await apiRegisterUser(
      userField.value,
      pwField.value,
      emailField.value,
      nameField.value,
      tree
    )
    const innerForm = this.shadowRoot.getElementById('inner-form')
    const divSuccess = this.shadowRoot.getElementById('register-success')
    if ('error' in res) {
      this._showError(res.error)
    } else {
      divSuccess.style.display = 'block'
      innerForm.style.display = 'none'
    }
  }

  _showError(message) {
    fireEvent(this, 'grampsjs:error', {message})
  }
}

window.customElements.define('grampsjs-form-register', GrampsjsFormRegister)
