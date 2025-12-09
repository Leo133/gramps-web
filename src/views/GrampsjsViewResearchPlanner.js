import {html, css} from 'lit'
import {GrampsjsView} from './GrampsjsView.js'
import '@material/mwc-button'
import '@material/mwc-icon-button'
import '@material/mwc-dialog'
import '@material/mwc-textfield'
import '@material/mwc-textarea'
import '@material/mwc-select'
import '@material/mwc-list/mwc-list-item'

export class GrampsjsViewResearchPlanner extends GrampsjsView {
  static get styles() {
    return [
      super.styles,
      css`
        .kanban-container {
          display: flex;
          gap: 1.5em;
          overflow-x: auto;
          padding-bottom: 1em;
        }

        .kanban-column {
          flex: 1;
          min-width: 300px;
          background: var(--grampsjs-color-shade-240);
          border-radius: 8px;
          padding: 1em;
        }

        .column-header {
          font-weight: 500;
          font-size: 18px;
          margin-bottom: 1em;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .task-count {
          font-size: 14px;
          color: var(--grampsjs-body-font-color-50);
        }

        .task-list {
          display: flex;
          flex-direction: column;
          gap: 0.75em;
        }

        .task-card {
          background: var(--grampsjs-color-shade-230);
          border-radius: 8px;
          padding: 1em;
          cursor: pointer;
          transition: box-shadow 0.2s;
        }

        .task-card:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .task-title {
          font-weight: 500;
          margin-bottom: 0.5em;
        }

        .task-description {
          font-size: 14px;
          color: var(--grampsjs-body-font-color-70);
          margin-bottom: 0.5em;
        }

        .task-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: var(--grampsjs-body-font-color-50);
        }

        .task-priority {
          padding: 2px 8px;
          border-radius: 4px;
          font-weight: 500;
        }

        .priority-urgent {
          background: #f44336;
          color: white;
        }

        .priority-high {
          background: #ff9800;
          color: white;
        }

        .priority-medium {
          background: #2196f3;
          color: white;
        }

        .priority-low {
          background: #9e9e9e;
          color: white;
        }

        .fab-container {
          position: fixed;
          bottom: 32px;
          right: 32px;
        }

        .dialog-content {
          display: flex;
          flex-direction: column;
          gap: 1em;
          padding: 1em 0;
        }

        .stats-bar {
          display: flex;
          gap: 1.5em;
          margin-bottom: 2em;
          padding: 1em;
          background: var(--grampsjs-color-shade-240);
          border-radius: 8px;
        }

        .stat-item {
          flex: 1;
          text-align: center;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 500;
          color: var(--grampsjs-primary-color);
        }

        .stat-label {
          font-size: 12px;
          color: var(--grampsjs-body-font-color-50);
        }
      `,
    ]
  }

  static get properties() {
    return {
      _board: {type: Object},
      _statistics: {type: Object},
      _loading: {type: Boolean},
      _dialogOpen: {type: Boolean},
      _editingTask: {type: Object},
    }
  }

  constructor() {
    super()
    this._board = {todo: [], in_progress: [], done: [], blocked: []}
    this._statistics = null
    this._loading = false
    this._dialogOpen = false
    this._editingTask = null
  }

  connectedCallback() {
    super.connectedCallback()
    this._loadBoard()
    this._loadStatistics()
  }

  renderContent() {
    if (this._loading) {
      return html`<p>${this._('Loading...')}</p>`
    }

    return html`
      <h2>${this._('Research Planner')}</h2>

      ${this._renderStatistics()}

      <div class="kanban-container">
        ${this._renderColumn('todo', this._('To Do'))}
        ${this._renderColumn('in_progress', this._('In Progress'))}
        ${this._renderColumn('done', this._('Done'))}
        ${this._renderColumn('blocked', this._('Blocked'))}
      </div>

      <div class="fab-container">
        <mwc-button raised @click="${this._handleNewTask}">
          + ${this._('New Task')}
        </mwc-button>
      </div>

      ${this._renderDialog()}
    `
  }

  _renderStatistics() {
    if (!this._statistics) return ''

    return html`
      <div class="stats-bar">
        <div class="stat-item">
          <div class="stat-value">${this._statistics.total}</div>
          <div class="stat-label">${this._('Total Tasks')}</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${this._statistics.byStatus.todo}</div>
          <div class="stat-label">${this._('To Do')}</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${this._statistics.byStatus.in_progress}</div>
          <div class="stat-label">${this._('In Progress')}</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${this._statistics.byStatus.done}</div>
          <div class="stat-label">${this._('Done')}</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${this._statistics.overdue}</div>
          <div class="stat-label">${this._('Overdue')}</div>
        </div>
      </div>
    `
  }

  _renderColumn(status, title) {
    const tasks = this._board[status] || []

    return html`
      <div class="kanban-column">
        <div class="column-header">
          <span>${title}</span>
          <span class="task-count">${tasks.length}</span>
        </div>
        <div class="task-list">
          ${tasks.map(task => this._renderTaskCard(task))}
        </div>
      </div>
    `
  }

  _renderTaskCard(task) {
    return html`
      <div
        class="task-card"
        @click="${() => this._handleEditTask(task)}"
        @keydown="${e => e.key === 'Enter' && this._handleEditTask(task)}"
      >
        <div class="task-title">${task.title}</div>
        ${task.description
          ? html`<div class="task-description">${task.description}</div>`
          : ''}
        <div class="task-meta">
          <span class="task-priority priority-${task.priority}">
            ${task.priority}
          </span>
          ${task.dueDate
            ? html`<span>${new Date(task.dueDate).toLocaleDateString()}</span>`
            : ''}
        </div>
      </div>
    `
  }

  _renderDialog() {
    return html`
      <mwc-dialog
        ?open="${this._dialogOpen}"
        @closed="${this._handleDialogClosed}"
        heading="${this._editingTask
          ? this._('Edit Task')
          : this._('New Task')}"
      >
        <div class="dialog-content">
          <mwc-textfield
            id="task-title"
            label="${this._('Title')}"
            .value="${this._editingTask?.title || ''}"
            required
          ></mwc-textfield>

          <mwc-textarea
            id="task-description"
            label="${this._('Description')}"
            .value="${this._editingTask?.description || ''}"
            rows="3"
          ></mwc-textarea>

          <mwc-select
            id="task-status"
            label="${this._('Status')}"
            .value="${this._editingTask?.status || 'todo'}"
          >
            <mwc-list-item value="todo">${this._('To Do')}</mwc-list-item>
            <mwc-list-item value="in_progress"
              >${this._('In Progress')}</mwc-list-item
            >
            <mwc-list-item value="done">${this._('Done')}</mwc-list-item>
            <mwc-list-item value="blocked">${this._('Blocked')}</mwc-list-item>
          </mwc-select>

          <mwc-select
            id="task-priority"
            label="${this._('Priority')}"
            .value="${this._editingTask?.priority || 'medium'}"
          >
            <mwc-list-item value="urgent">${this._('Urgent')}</mwc-list-item>
            <mwc-list-item value="high">${this._('High')}</mwc-list-item>
            <mwc-list-item value="medium">${this._('Medium')}</mwc-list-item>
            <mwc-list-item value="low">${this._('Low')}</mwc-list-item>
          </mwc-select>

          <mwc-textfield
            id="task-category"
            label="${this._('Category')}"
            .value="${this._editingTask?.category || ''}"
          ></mwc-textfield>
        </div>

        <mwc-button slot="primaryAction" @click="${this._handleSaveTask}">
          ${this._('Save')}
        </mwc-button>
        <mwc-button slot="secondaryAction" dialogAction="close">
          ${this._('Cancel')}
        </mwc-button>
        ${this._editingTask
          ? html`<mwc-button
              slot="secondaryAction"
              @click="${this._handleDeleteTask}"
            >
              ${this._('Delete')}
            </mwc-button>`
          : ''}
      </mwc-dialog>
    `
  }

  async _loadBoard() {
    this._loading = true
    try {
      const response = await fetch('/api/research-planner/board', {
        headers: {
          Authorization: `Bearer ${this.appState.auth.token}`,
        },
      })

      if (response.ok) {
        this._board = await response.json()
      }
    } catch (error) {
      console.error('Error loading board:', error)
    } finally {
      this._loading = false
    }
  }

  async _loadStatistics() {
    try {
      const response = await fetch('/api/research-planner/statistics', {
        headers: {
          Authorization: `Bearer ${this.appState.auth.token}`,
        },
      })

      if (response.ok) {
        this._statistics = await response.json()
      }
    } catch (error) {
      console.error('Error loading statistics:', error)
    }
  }

  _handleNewTask() {
    this._editingTask = null
    this._dialogOpen = true
  }

  _handleEditTask(task) {
    this._editingTask = task
    this._dialogOpen = true
  }

  _handleDialogClosed() {
    this._dialogOpen = false
    this._editingTask = null
  }

  async _handleSaveTask() {
    const title = this.shadowRoot.getElementById('task-title').value
    const description = this.shadowRoot.getElementById('task-description').value
    const status = this.shadowRoot.getElementById('task-status').value
    const priority = this.shadowRoot.getElementById('task-priority').value
    const category = this.shadowRoot.getElementById('task-category').value

    if (!title) return

    const taskData = {
      title,
      description,
      status,
      priority,
      category,
    }

    try {
      const url = this._editingTask
        ? `/api/research-planner/tasks/${this._editingTask.id}`
        : '/api/research-planner/tasks'
      const method = this._editingTask ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.appState.auth.token}`,
        },
        body: JSON.stringify(taskData),
      })

      if (response.ok) {
        this._dialogOpen = false
        this._loadBoard()
        this._loadStatistics()
      }
    } catch (error) {
      console.error('Error saving task:', error)
    }
  }

  async _handleDeleteTask() {
    if (!this._editingTask) return

    // eslint-disable-next-line no-alert
    if (!window.confirm(this._('Are you sure you want to delete this task?')))
      return

    try {
      const response = await fetch(
        `/api/research-planner/tasks/${this._editingTask.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${this.appState.auth.token}`,
          },
        }
      )

      if (response.ok) {
        this._dialogOpen = false
        this._loadBoard()
        this._loadStatistics()
      }
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }
}

window.customElements.define(
  'grampsjs-view-research-planner',
  GrampsjsViewResearchPlanner
)
