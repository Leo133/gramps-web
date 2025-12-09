/**
 * @fileoverview Main navigation menu component for Gramps Web
 * Phase 10: Enhanced with design tokens and accessibility
 * @author Gramps Web Contributors
 */

import {html, css, LitElement} from 'lit'
import '@material/mwc-list'

import './GrampsJsListItem.js'

import {mdiFamilyTree, mdiChat, mdiDna} from '@mdi/js'
import {sharedStyles} from '../SharedStyles.js'
import {designTokens} from '../design-tokens.js'
import {a11yStyles} from '../accessibility.js'
import {responsiveStyles} from '../responsive.js'
import {GrampsjsAppStateMixin} from '../mixins/GrampsjsAppStateMixin.js'
import {renderIcon} from '../icons.js'

const BASE_DIR = ''

const selectedColor = 'var(--grampsjs-color-icon-selected)'
const defaultColor = 'var(--grampsjs-color-icon-default)'

class GrampsjsMainMenu extends GrampsjsAppStateMixin(LitElement) {
  static get styles() {
    return [
      sharedStyles,
      designTokens,
      a11yStyles,
      responsiveStyles,
      css`
        /* Phase 10: Enhanced menu styling with design tokens */
        mwc-list {
          padding: var(--spacing-2, 8px) 0;
        }

        grampsjs-list-item {
          /* Phase 10: Touch-friendly list items */
          min-height: var(--touch-target-min-size, 48px);
          padding: var(--spacing-2, 8px) var(--spacing-4, 16px);
        }

        grampsjs-list-item span {
          color: var(--grampsjs-color-drawer-text);
          font-size: var(--type-body-large-size, 16px);
          font-weight: var(--font-weight-regular, 400);
          letter-spacing: var(--type-body-large-tracking, 0.5px);
        }

        grampsjs-list-item mwc-icon {
          color: var(--grampsjs-body-font-color-38);
          /* Phase 10: Consistent icon sizing */
          --mdc-icon-size: var(--icon-size-md, 24px);
        }

        grampsjs-list-item[selected] span {
          color: var(--grampsjs-color-icon-selected);
          font-weight: var(--font-weight-medium, 500);
        }

        grampsjs-list-item[selected] mwc-icon {
          color: var(--grampsjs-color-icon-selected);
        }

        /* Phase 10: Improved focus states */
        grampsjs-list-item:focus-visible {
          outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color, var(--md-sys-color-primary));
          outline-offset: -2px;
          border-radius: var(--radius-sm, 4px);
        }

        /* Phase 10: Better hover states on devices with hover capability */
        @media (hover: hover) and (pointer: fine) {
          grampsjs-list-item:hover {
            background-color: var(--md-sys-color-surface-container-low);
            border-radius: var(--radius-sm, 4px);
          }
        }

        span.raise {
          position: relative;
          top: -2px;
        }

        /* Phase 10: Mobile optimization */
        @media (max-width: 768px) {
          grampsjs-list-item {
            padding: var(--spacing-3, 12px) var(--spacing-3, 12px);
          }
          
          grampsjs-list-item span {
            font-size: var(--type-body-medium-size, 14px);
          }
        }
      `,
    ]
  }

  static get properties() {
    return {
      editMode: {type: Boolean},
      editTitle: {type: String},
      editDialogContent: {type: String},
      saveButton: {type: Boolean},
    }
  }

  constructor() {
    super()
    this.editMode = false
    this.editTitle = ''
    this.editDialogContent = ''
    this.saveButton = false
  }

  render() {
    return html` <mwc-list>
      <grampsjs-list-item
        href="${BASE_DIR}/"
        graphic="icon"
        ?selected="${this.appState.path.page === 'home'}"
      >
        <span>${this._('Home Page')}</span>
        <mwc-icon slot="graphic">home</mwc-icon>
      </grampsjs-list-item>
      <grampsjs-list-item
        href="${BASE_DIR}/blog"
        graphic="icon"
        ?selected="${this.appState.path.page === 'blog'}"
      >
        <span>${this._('Blog')}</span>
        <mwc-icon slot="graphic">rss_feed</mwc-icon>
      </grampsjs-list-item>
      <grampsjs-list-item
        href="${BASE_DIR}/people"
        graphic="icon"
        ?selected="${[
          'people',
          'families',
          'events',
          'places',
          'citations',
          'sources',
          'repositories',
          'notes',
          'medialist',
        ].includes(this.appState.path.page)}"
      >
        <span>${this._('Lists')}</span>
        <mwc-icon slot="graphic">list</mwc-icon>
      </grampsjs-list-item>
      <grampsjs-list-item
        href="${BASE_DIR}/map"
        graphic="icon"
        ?selected="${this.appState.path.page === 'map'}"
      >
        <span>${this._('Map')}</span>
        <mwc-icon slot="graphic">map</mwc-icon>
      </grampsjs-list-item>
      <grampsjs-list-item
        href="${BASE_DIR}/tree"
        graphic="icon"
        ?selected="${this.appState.path.page === 'tree'}"
      >
        <span>${this._('Family Tree')}</span>
        <mwc-icon slot="graphic"
          ><span class="raise"
            >${renderIcon(
              mdiFamilyTree,
              this.appState.path.page === 'tree' ? selectedColor : defaultColor
            )}</span
          ></mwc-icon
        >
      </grampsjs-list-item>
      ${this.appState.frontendConfig.hideDNALink
        ? ''
        : html`
            <grampsjs-list-item
              href="${BASE_DIR}/dna-matches"
              graphic="icon"
              ?selected="${['dna-matches', 'dna-chromosome', 'ydna'].includes(
                this.appState.path.page
              )}"
            >
              <span>${this._('DNA')}</span>
              <mwc-icon slot="graphic"
                ><span class="raise"
                  >${renderIcon(
                    mdiDna,
                    ['dna-matches', 'dna-chromosome', 'ydna'].includes(
                      this.appState.path.page
                    )
                      ? selectedColor
                      : defaultColor
                  )}</span
                ></mwc-icon
              >
            </grampsjs-list-item>
          `}
      ${this.canUseChat
        ? html`
            <grampsjs-list-item
              href="${BASE_DIR}/chat"
              graphic="icon"
              ?selected="${this.appState.path.page === 'chat'}"
            >
              <span>${this._('Chat')}</span>
              <mwc-icon slot="graphic"
                ><span class="raise"
                  >${renderIcon(
                    mdiChat,
                    this.appState.path.page === 'chat'
                      ? selectedColor
                      : defaultColor
                  )}</span
                ></mwc-icon
              >
            </grampsjs-list-item>
          `
        : ''}
      <li divider padded role="separator"></li>
      <grampsjs-list-item
        href="${BASE_DIR}/recent"
        graphic="icon"
        ?selected="${this.appState.path.page === 'recent'}"
      >
        <span>${this._('History')}</span>
        <mwc-icon slot="graphic">history</mwc-icon>
      </grampsjs-list-item>
      <grampsjs-list-item
        href="${BASE_DIR}/bookmarks"
        graphic="icon"
        ?selected="${this.appState.path.page === 'bookmarks'}"
      >
        <span>${this._('_Bookmarks')}</span>
        <mwc-icon slot="graphic">bookmark</mwc-icon>
      </grampsjs-list-item>
      <grampsjs-list-item
        href="${BASE_DIR}/tasks"
        graphic="icon"
        ?selected="${this.appState.path.page === 'tasks'}"
      >
        <span>${this._('Tasks')}</span>
        <mwc-icon slot="graphic">checklist</mwc-icon>
      </grampsjs-list-item>
      <grampsjs-list-item
        href="${BASE_DIR}/export"
        graphic="icon"
        ?selected="${this.appState.path.page === 'export'}"
      >
        <span>${this._('Export')}</span>
        <mwc-icon slot="graphic">download_file</mwc-icon>
      </grampsjs-list-item>
      <grampsjs-list-item
        href="${BASE_DIR}/reports"
        graphic="icon"
        ?selected="${this.appState.path.page === 'reports'}"
      >
        <span>${this._('_Reports').replace('_', '')}</span>
        <mwc-icon slot="graphic">menu_book</mwc-icon>
      </grampsjs-list-item>
      ${this.appState.permissions.canViewPrivate
        ? html`
            <grampsjs-list-item
              href="${BASE_DIR}/revisions"
              graphic="icon"
              ?selected="${this.appState.path.page === 'revisions'}"
            >
              <span>${this._('Revisions')}</span>
              <mwc-icon slot="graphic">commit</mwc-icon>
            </grampsjs-list-item>
          `
        : ''}
    </mwc-list>`
  }
}

window.customElements.define('grampsjs-main-menu', GrampsjsMainMenu)
