/**
 * @fileoverview Activity Feed Item component
 * @author Gramps Web contributors
 */
import {LitElement, css, html} from 'lit'
import '@material/mwc-icon'
import {sharedStyles} from '../SharedStyles.js'
import {GrampsjsAppStateMixin} from '../mixins/GrampsjsAppStateMixin.js'
import {designTokens} from '../design-tokens.js'
import {prettyTimeDiffTimestamp} from '../util.js'

export class GrampsjsActivityFeedItem extends GrampsjsAppStateMixin(LitElement) {
  static get styles() {
    return [
      sharedStyles,
      designTokens,
      css`
        :host {
          display: block;
          padding: var(--spacing-4, 1em);
          border-bottom: 1px solid var(--grampsjs-color-outline);
        }

        .activity-item {
          display: flex;
          gap: var(--spacing-3, 0.6em);
          align-items: flex-start;
        }

        .icon-container {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: var(--grampsjs-color-surface-variant);
          flex-shrink: 0;
        }

        mwc-icon {
          color: var(--grampsjs-color-on-surface-variant);
        }

        .content {
          flex: 1;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: var(--spacing-2, 0.4em);
        }

        .user {
          font-weight: 500;
          color: var(--grampsjs-color-primary);
        }

        .action {
          color: var(--grampsjs-body-font-color);
        }

        .timestamp {
          font-size: 0.875em;
          color: var(--grampsjs-body-font-color-60);
        }

        .details {
          font-size: 0.9375em;
          color: var(--grampsjs-body-font-color-70);
          margin-top: var(--spacing-2, 0.4em);
        }

        .entity-link {
          color: var(--grampsjs-color-primary);
          text-decoration: none;
          cursor: pointer;
        }

        .entity-link:hover {
          text-decoration: underline;
        }
      `,
    ]
  }

  static get properties() {
    return {
      activity: {type: Object},
    }
  }

  constructor() {
    super()
    this.activity = {}
  }

  _getIcon(activityType) {
    const icons = {
      create: 'add_circle',
      update: 'edit',
      delete: 'delete',
      upload: 'upload',
      comment: 'comment',
      tag: 'label',
    }
    return icons[activityType] || 'info'
  }

  _getActionText(activityType) {
    const actions = {
      create: this._('created'),
      update: this._('updated'),
      delete: this._('deleted'),
      upload: this._('uploaded'),
      comment: this._('commented on'),
      tag: this._('tagged'),
    }
    return actions[activityType] || this._('modified')
  }

  _handleEntityClick(e) {
    e.preventDefault()
    const {entityType, grampsId} = this.activity
    if (entityType && grampsId) {
      this.dispatchEvent(
        new CustomEvent('nav', {
          bubbles: true,
          composed: true,
          detail: {path: `${entityType.toLowerCase()}/${grampsId}`},
        })
      )
    }
  }

  render() {
    if (!this.activity) return html``

    const {
      user,
      activityType,
      entityType,
      entityName,
      timestamp,
      details,
    } = this.activity

    return html`
      <div class="activity-item">
        <div class="icon-container">
          <mwc-icon>${this._getIcon(activityType)}</mwc-icon>
        </div>
        
        <div class="content">
          <div class="header">
            <div>
              <span class="user">${user || this._('Unknown user')}</span>
              <span class="action">${this._getActionText(activityType)}</span>
              ${entityName
                ? html`
                    <a
                      class="entity-link"
                      href="#"
                      @click="${this._handleEntityClick}"
                    >
                      ${entityName}
                    </a>
                  `
                : ''}
              ${entityType
                ? html`<span class="action">(${this._(entityType)})</span>`
                : ''}
            </div>
            <div class="timestamp">
              ${timestamp ? prettyTimeDiffTimestamp(timestamp) : ''}
            </div>
          </div>
          
          ${details
            ? html`<div class="details">${details}</div>`
            : ''}
        </div>
      </div>
    `
  }
}

customElements.define('grampsjs-activity-feed-item', GrampsjsActivityFeedItem)
