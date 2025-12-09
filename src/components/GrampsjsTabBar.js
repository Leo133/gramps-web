/**
 * @fileoverview Tab bar component for navigation between different sections
 * Phase 10: Enhanced with design tokens and accessibility
 * @author Gramps Web Contributors
 */

import {html, css, LitElement} from 'lit'

import '@material/web/tabs/tabs'
import '@material/web/tabs/primary-tab'

import {fireEvent} from '../util.js'
import {sharedStyles} from '../SharedStyles.js'
import {designTokens} from '../design-tokens.js'
import {a11yStyles} from '../accessibility.js'
import {responsiveStyles} from '../responsive.js'
import {GrampsjsAppStateMixin} from '../mixins/GrampsjsAppStateMixin.js'

const tabs = {
  people: 'People',
  families: 'Families',
  events: 'Events',
  places: 'Places',
  sources: 'Sources',
  citations: 'Citations',
  repositories: 'Repositories',
  notes: 'Notes',
  medialist: 'Media Objects',
  settings: {
    user: 'User settings',
    administration: 'Administration',
    users: 'Manage users',
    info: 'System Information',
    researcher: 'Researcher Information',
  },
}

class GrampsjsTabBar extends GrampsjsAppStateMixin(LitElement) {
  static get styles() {
    return [
      sharedStyles,
      designTokens,
      a11yStyles,
      responsiveStyles,
      css`
        /* Phase 10: Enhanced tab styling with design tokens */
        md-tabs {
          margin: var(--spacing-5, 20px);
          width: max-content;
          max-width: 100%;
          /* Phase 10: Better spacing */
          gap: var(--spacing-2, 8px);
        }

        md-primary-tab {
          flex: 0 0 auto;
          width: auto;
          /* Phase 10: Touch-friendly tabs */
          min-height: var(--touch-target-min-size, 48px);
          padding: var(--spacing-3, 12px) var(--spacing-4, 16px);
          /* Phase 10: Typography */
          font-size: var(--type-title-medium-size, 16px);
          font-weight: var(--font-weight-medium, 500);
          letter-spacing: var(--type-title-medium-tracking, 0.15px);
        }

        /* Phase 10: Improved focus states for accessibility */
        md-primary-tab:focus-visible {
          outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color, var(--md-sys-color-primary));
          outline-offset: 2px;
          border-radius: var(--radius-sm, 4px);
        }

        /* Phase 10: Better hover states */
        @media (hover: hover) and (pointer: fine) {
          md-primary-tab:hover {
            background-color: var(--md-sys-color-surface-container-low);
            border-radius: var(--radius-sm, 4px);
            transition: background-color var(--duration-short-2, 100ms) var(--easing-standard);
          }
        }

        /* Phase 10: Mobile optimization */
        @media (max-width: 768px) {
          md-tabs {
            margin: var(--spacing-3, 12px) var(--spacing-2, 8px);
            width: 100%;
            overflow-x: auto;
            /* Phase 10: Smooth scrolling on mobile */
            scroll-behavior: smooth;
            -webkit-overflow-scrolling: touch;
          }

          md-primary-tab {
            min-height: var(--touch-target-min-size, 48px);
            padding: var(--spacing-2, 8px) var(--spacing-3, 12px);
            font-size: var(--type-label-large-size, 14px);
          }
        }

        /* Phase 10: Safe area insets for notched devices */
        @supports (padding: max(0px)) {
          md-tabs {
            padding-left: max(var(--spacing-5, 20px), var(--safe-area-inset-left, 0));
            padding-right: max(var(--spacing-5, 20px), var(--safe-area-inset-right, 0));
          }
        }
      `,
    ]
  }

  render() {
    const currentKey = this.appState.path.pageId || this.appState.path.page
    if (!(this.appState.path.page in tabs)) {
      return ''
    }
    if (
      this.appState.path.pageId &&
      this.appState.path.page in tabs &&
      !(this.appState.path.pageId in tabs[this.appState.path.page])
    ) {
      return ''
    }
    let currentTabs
    if (!this.appState.path.pageId) {
      currentTabs = Object.fromEntries(
        Object.entries(tabs).filter(([, value]) => typeof value === 'string')
      )
    } else {
      currentTabs = tabs[this.appState.path.page]
    }
    const filteredTabKeys = Object.keys(currentTabs).filter(key =>
      this._permissionToSeeTab(this.appState.path.page, key)
    )
    return html`
      <md-tabs .activeTabIndex=${filteredTabKeys.indexOf(currentKey)}>
        ${filteredTabKeys.map(
          key =>
            html`
              <md-primary-tab @click="${() => this._goTo(key)}"
                >${this._(currentTabs[key])}</md-primary-tab
              >
            `
        )}
      </md-tabs>
    `
  }

  _permissionToSeeTab(page, key) {
    if (page !== 'settings') {
      return true
    }
    switch (key) {
      case 'administration':
        return this.appState.permissions.canManageUsers
      case 'users':
        return this.appState.permissions.canManageUsers
      case 'user':
        return true
      case 'info':
        return true
      case 'researcher':
        return true && !this.appState.frontendConfig.hideResearcherDetails
      default:
        return false
    }
  }

  _goTo(key) {
    if (this.appState.path.pageId) {
      fireEvent(this, 'nav', {path: `${this.appState.path.page}/${key}`})
    } else {
      fireEvent(this, 'nav', {path: key})
    }
  }
}

window.customElements.define('grampsjs-tab-bar', GrampsjsTabBar)
