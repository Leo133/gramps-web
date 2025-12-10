/**
 * @fileoverview Comments component for any record type
 * @author Gramps Web contributors
 */
import {LitElement, css, html} from 'lit'
import '@material/mwc-textarea'
import '@material/mwc-button'
import '@material/mwc-icon'
import '@material/mwc-icon-button'
import {sharedStyles} from '../SharedStyles.js'
import {GrampsjsAppStateMixin} from '../mixins/GrampsjsAppStateMixin.js'
import {designTokens} from '../design-tokens.js'
import {prettyTimeDiffTimestamp} from '../util.js'

export class GrampsjsComments extends GrampsjsAppStateMixin(LitElement) {
  static get styles() {
    return [
      sharedStyles,
      designTokens,
      css`
        :host {
          display: block;
          margin-top: var(--spacing-6, 2em);
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-4, 1em);
        }

        h3 {
          margin: 0;
          color: var(--grampsjs-color-on-surface);
        }

        .comment-form {
          background-color: var(--grampsjs-color-surface-variant);
          padding: var(--spacing-4, 1em);
          border-radius: var(--radius-md, 8px);
          margin-bottom: var(--spacing-4, 1em);
        }

        .comment-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-4, 1em);
        }

        .comment {
          background-color: var(--grampsjs-color-surface);
          border: 1px solid var(--grampsjs-color-outline);
          border-radius: var(--radius-md, 8px);
          padding: var(--spacing-4, 1em);
        }

        .comment-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: var(--spacing-2, 0.4em);
        }

        .comment-author {
          font-weight: 500;
          color: var(--grampsjs-color-primary);
        }

        .comment-timestamp {
          font-size: 0.875em;
          color: var(--grampsjs-body-font-color-60);
        }

        .comment-text {
          color: var(--grampsjs-body-font-color);
          line-height: 1.6;
          white-space: pre-wrap;
        }

        .comment-actions {
          margin-top: var(--spacing-2, 0.4em);
          display: flex;
          gap: var(--spacing-2, 0.4em);
        }

        .empty-state {
          text-align: center;
          padding: var(--spacing-6, 2em);
          color: var(--grampsjs-body-font-color-60);
        }

        mwc-textarea {
          width: 100%;
          margin-bottom: var(--spacing-3, 0.6em);
        }
      `,
    ]
  }

  static get properties() {
    return {
      entityType: {type: String},
      entityId: {type: String},
      _comments: {type: Array},
      _newComment: {type: String},
      _loading: {type: Boolean},
      _submitting: {type: Boolean},
    }
  }

  constructor() {
    super()
    this._comments = []
    this._newComment = ''
    this._loading = false
    this._submitting = false
  }

  connectedCallback() {
    super.connectedCallback()
    if (this.entityType && this.entityId) {
      this._loadComments()
    }
  }

  updated(changedProperties) {
    if (
      (changedProperties.has('entityType') ||
        changedProperties.has('entityId')) &&
      this.entityType &&
      this.entityId
    ) {
      this._loadComments()
    }
  }

  async _loadComments() {
    if (this._loading) return

    this._loading = true

    try {
      const url = `/api/comments/threads/${this.entityType}/${this.entityId}`
      const response = await this.appState.apiGet(url)

      if (response && response.data) {
        this._comments = response.data
      }
    } catch (error) {
      console.error('Failed to load comments:', error)
    } finally {
      this._loading = false
    }
  }

  async _handleSubmit() {
    if (!this._newComment.trim() || this._submitting) return

    this._submitting = true

    try {
      const url = '/api/comments'
      const response = await this.appState.apiPost(url, {
        entityType: this.entityType,
        entityId: this.entityId,
        text: this._newComment.trim(),
      })

      if (response && !response.error) {
        this._newComment = ''
        this._loadComments()
        this.dispatchEvent(
          new CustomEvent('grampsjs:notification', {
            bubbles: true,
            composed: true,
            detail: {message: this._('Comment added')},
          })
        )
      }
    } catch (error) {
      console.error('Failed to add comment:', error)
      this.dispatchEvent(
        new CustomEvent('grampsjs:error', {
          bubbles: true,
          composed: true,
          detail: {message: this._('Failed to add comment')},
        })
      )
    } finally {
      this._submitting = false
    }
  }

  async _handleDelete(commentId) {
    if (!confirm(this._('Delete this comment?'))) return

    try {
      const url = `/api/comments/${commentId}`
      const response = await this.appState.apiDelete(url)

      if (response && !response.error) {
        this._loadComments()
        this.dispatchEvent(
          new CustomEvent('grampsjs:notification', {
            bubbles: true,
            composed: true,
            detail: {message: this._('Comment deleted')},
          })
        )
      }
    } catch (error) {
      console.error('Failed to delete comment:', error)
      this.dispatchEvent(
        new CustomEvent('grampsjs:error', {
          bubbles: true,
          composed: true,
          detail: {message: this._('Failed to delete comment')},
        })
      )
    }
  }

  _handleTextChange(e) {
    this._newComment = e.target.value
  }

  render() {
    return html`
      <div class="header">
        <h3>${this._('Comments')} (${this._comments.length})</h3>
      </div>

      <div class="comment-form">
        <mwc-textarea
          outlined
          label="${this._('Add a comment')}"
          .value="${this._newComment}"
          @input="${this._handleTextChange}"
          rows="3"
        ></mwc-textarea>
        <mwc-button
          raised
          @click="${this._handleSubmit}"
          ?disabled="${!this._newComment.trim() || this._submitting}"
        >
          ${this._submitting ? this._('Posting...') : this._('Post Comment')}
        </mwc-button>
      </div>

      <div class="comment-list">
        ${this._comments.length === 0
          ? html`
              <div class="empty-state">
                <p>${this._('No comments yet. Be the first to comment!')}</p>
              </div>
            `
          : ''}
        ${this._comments.map(
          comment => html`
            <div class="comment">
              <div class="comment-header">
                <span class="comment-author">${comment.author || this._('Anonymous')}</span>
                <span class="comment-timestamp">
                  ${comment.createdAt ? prettyTimeDiffTimestamp(comment.createdAt) : ''}
                </span>
              </div>
              <div class="comment-text">${comment.text}</div>
              ${comment.canDelete
                ? html`
                    <div class="comment-actions">
                      <mwc-button
                        dense
                        icon="delete"
                        @click="${() => this._handleDelete(comment.id)}"
                      >
                        ${this._('Delete')}
                      </mwc-button>
                    </div>
                  `
                : ''}
            </div>
          `
        )}
      </div>
    `
  }
}

customElements.define('grampsjs-comments', GrampsjsComments)
