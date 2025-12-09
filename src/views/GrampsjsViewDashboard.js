/**
 * @fileoverview Dashboard view component showing home person and statistics
 * Phase 10: Enhanced with design tokens and responsive layout
 * @author Gramps Web Contributors
 */

import {html, css} from 'lit'

import '@material/web/button/text-button'
import '@material/web/button/outlined-button'

import {GrampsjsView} from './GrampsjsView.js'
import {designTokens} from '../design-tokens.js'
import {a11yStyles} from '../accessibility.js'
import {responsiveStyles} from '../responsive.js'
import './GrampsjsViewRecentlyChanged.js'
import './GrampsjsViewRecentBlogPosts.js'
import './GrampsjsViewAnniversaries.js'
import '../components/GrampsjsHomePerson.js'
import '../components/GrampsjsStatistics.js'

export class GrampsjsViewDashboard extends GrampsjsView {
  static get properties() {
    return {
      dbInfo: {type: Object},
      homePersonDetails: {type: Object},
      homePersonGrampsId: {type: String},
    }
  }

  constructor() {
    super()
    this.dbInfo = {}
    this.homePersonDetails = {}
    this.homePersonGrampsId = ''
  }

  static get styles() {
    return [
      super.styles,
      designTokens,
      a11yStyles,
      responsiveStyles,
      css`
        /* Phase 10: Enhanced layout with design tokens */
        .column {
          float: left;
          width: 50%;
          overflow-x: hidden;
          /* Phase 10: Better spacing */
          padding: var(--spacing-2, 8px);
        }

        .column:first-child {
          width: calc(50% - var(--spacing-6, 32px));
          padding-right: var(--spacing-6, 32px);
        }

        .column > div {
          /* Phase 10: Token-based spacing */
          margin-bottom: var(--spacing-5, 24px);
          /* Phase 10: Card styling */
          border-radius: var(--radius-card, 12px);
        }

        .buttons {
          display: flex;
          gap: var(--spacing-4, 16px);
          margin-top: var(--spacing-4, 16px);
          flex-wrap: wrap;
        }

        /* Phase 10: Touch-friendly buttons */
        md-outlined-button,
        md-text-button {
          min-height: var(--touch-target-min-size, 48px);
          padding: var(--button-padding-horizontal, 24px);
        }

        /* Phase 10: Typography enhancements */
        h3 {
          font-size: var(--type-headline-small-size, 24px);
          font-weight: var(--font-weight-regular, 400);
          letter-spacing: var(--type-headline-small-tracking, 0);
          margin-bottom: var(--spacing-4, 16px);
        }

        p {
          font-size: var(--type-body-large-size, 16px);
          line-height: var(--type-body-large-line-height, 24px);
          letter-spacing: var(--type-body-large-tracking, 0.5px);
        }

        /* Phase 10: Mobile optimization */
        @media screen and (max-width: 768px) {
          .column,
          .column:first-child {
            width: 100%;
            padding-right: 0;
            /* Phase 10: Mobile spacing */
            padding: var(--spacing-2, 8px) 0;
          }

          .column > div {
            margin-bottom: var(--spacing-4, 16px);
          }

          .buttons {
            gap: var(--spacing-3, 12px);
          }

          h3 {
            font-size: var(--type-headline-small-size, 22px);
          }
        }

        /* Phase 10: Safe area insets for notched devices */
        @supports (padding: max(0px)) {
          .column:first-child {
            padding-left: max(var(--spacing-2, 8px), var(--safe-area-inset-left, 0));
          }
          
          .column:last-child {
            padding-right: max(var(--spacing-2, 8px), var(--safe-area-inset-right, 0));
          }
        }
      `,
    ]
  }

  renderContent() {
    return html`
      <div class="column">
        ${this.appState.dbInfo?.object_counts?.people === 0 &&
        this.appState.permissions.canEdit
          ? html`
              <div>
                <h3>Get started</h3>
                <p>
                  ${this._(
                    'To start building your family tree, add yourself as a person or import a family tree file.'
                  )}
                </p>
                <div class="buttons">
                  <md-outlined-button href="/new_person"
                    >${this._('New Person')}</md-outlined-button
                  ><md-outlined-button href="/settings/administration"
                    >${this._('Import Family Tree')}</md-outlined-button
                  >
                </div>
              </div>
            `
          : ''}
        ${this.appState.dbInfo?.object_counts?.people
          ? html`
              <div>
                <grampsjs-home-person
                  id="homeperson"
                  .appState="${this.appState}"
                  .homePersonDetails=${this.homePersonDetails}
                  .homePersonGrampsId=${this.homePersonGrampsId}
                >
                </grampsjs-home-person>
              </div>
            `
          : ''}
        ${this.appState.dbInfo?.object_counts?.events
          ? html`
              <div>
                <grampsjs-view-anniversaries
                  id="anniversaries"
                  .appState="${this.appState}"
                >
                </grampsjs-view-anniversaries>
              </div>
            `
          : ''}
        <div>
          <grampsjs-view-recently-changed
            id="recently-changed"
            .appState="${this.appState}"
          >
          </grampsjs-view-recently-changed>
        </div>
      </div>
      <div class="column">
        <div>
          <grampsjs-view-recent-blog-posts
            id="recent-blog"
            .appState="${this.appState}"
          >
          </grampsjs-view-recent-blog-posts>
        </div>
        <div>
          <grampsjs-statistics
            .data="${this.dbInfo?.object_counts || {}}"
            id="statistics"
            .appState="${this.appState}"
          >
          </grampsjs-statistics>
        </div>
      </div>
    `
  }
}

window.customElements.define('grampsjs-view-dashboard', GrampsjsViewDashboard)
