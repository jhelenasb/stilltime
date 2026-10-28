import { state } from '../state.js';
import { todayKey } from '../utils/date.js';
import { escapeHTML, icon } from '../utils/dom.js';
import { tasksInCurrentView } from '../domain/items.js';

function renderTask(task) {
  let metaExtra = ' · <em>No date</em>';
  if (task.recurrence?.freq) metaExtra = ` · Repeats ${task.recurrence.freq}`;
  else if (task.date) metaExtra = ` · ${task.date}`;

  return `
    <div class="task-row ${task.done ? 'task-done' : ''}"
         draggable="true" data-drag-type="task" data-id="${task.id}"
         data-context-type="task" data-context-id="${task.id}">
      <button class="task-check ${task.done ? 'checked' : ''}" data-action="toggle-task" data-id="${task.id}">
        ${task.done ? icon('check', 13) : ''}
      </button>
      <button class="task-main" data-action="edit-task" data-id="${task.id}">
        <span class="task-title">${escapeHTML(task.title)}</span>
        <span class="task-meta">
          <span class="mini-list-dot dot-${task.color || 'sage'}"></span>
          ${escapeHTML(task.list || 'Tasks')}${metaExtra}
        </span>
      </button>
      ${task.priority === 'high' ? '<span class="priority-mark">↑</span>' : ''}
      ${task.time ? `<span class="task-time">${escapeHTML(task.time)}</span>` : ''}
    </div>`;
}

export function renderTaskPanel() {
  const viewTasks = tasksInCurrentView();
  const pending = viewTasks.filter((t) =>
    state.taskFilter === 'completed' ? t.done : !t.done
  );
  const overdue = pending.filter((t) => t.date && t.date < todayKey());
  const filtered = pending.filter((t) => {
    if (!t.title.toLowerCase().includes(state.search.toLowerCase())) return false;
    if (state.taskFilter === 'today') return t.date === todayKey();
    if (state.taskFilter === 'overdue') return t.date && t.date < todayKey();
    if (state.taskFilter === 'nodate') return !t.date;
    return true;
  });

  const rangeLabel = {
    Day: 'Today',
    Week: 'This week',
    Month: 'This month',
    Semester: 'This semester',
    Quarter: 'This quarter',
    ThreeMonth: 'This quarter',
    Year: 'This year',
  }[state.view] || 'Current view';

  const doneCount = viewTasks.filter((t) => t.done).length;
  const total = viewTasks.length;
  const pct = Math.round((doneCount / Math.max(1, total)) * 100);

  return `
    <aside class="task-panel">
      <div class="panel-heading">
        <div>
          <span class="panel-kicker">${rangeLabel.toUpperCase()}</span>
          <h2>Tasks <span class="heading-sparkle">✳</span></h2>
        </div>
        <button class="icon-button" data-action="add-task">${icon('plus')}</button>
      </div>
      <div class="progress-card">
        <div class="progress-top">
          <div>
            <span class="progress-label">Progress in view</span>
            <div class="progress-number">${doneCount}<span> / ${total}</span></div>
          </div>
          <div class="progress-ring"><span>${pct}%</span></div>
        </div>
        <div class="progress-track"><span style="width:${pct}%"></span></div>
      </div>
      <div class="task-filter-row">
        <button class="filter-chip ${state.taskFilter === 'all' ? 'filter-active' : ''}" data-filter="all">All <span>${pending.length}</span></button>
        <button class="filter-chip ${state.taskFilter === 'today' ? 'filter-active' : ''}" data-filter="today">Today</button>
        <button class="filter-chip ${state.taskFilter === 'overdue' ? 'filter-active' : ''}" data-filter="overdue">Overdue <span>${overdue.length}</span></button>
        <button class="filter-chip ${state.taskFilter === 'nodate' ? 'filter-active' : ''}" data-filter="nodate">No date</button>
      </div>
      <div class="task-list-heading">
        <span>${filtered.length} item${filtered.length === 1 ? '' : 's'}</span>
        <button class="tiny-icon" data-action="add-task">${icon('plus', 15)}</button>
      </div>
      <div class="task-list">
        ${
          filtered.length
            ? filtered.slice(0, 40).map(renderTask).join('')
            : `<div class="empty-tasks"><div class="empty-icon">✳</div><strong>Nothing here yet</strong><p>Tasks for this view appear here.</p></div>`
        }
      </div>
      <button class="add-task-line" data-action="add-task">${icon('plus')} Add a task</button>
      <div class="panel-footer"><span class="footer-leaf">✳</span><span>Progress, not perfection.</span></div>
    </aside>`;
}