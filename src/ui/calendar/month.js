import { state } from '../../state.js';
import { dateKey, addDays, isSameDay } from '../../utils/date.js';
import { escapeHTML } from '../../utils/dom.js';
import { tasksForDate, eventsForDate } from '../../domain/items.js';
import { renderEvent } from './eventPill.js';

export function renderMonth() {
  const year = state.anchor.getFullYear();
  const month = state.anchor.getMonth();
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7;
  const start = addDays(first, -offset);
  const today = new Date();
  const cells = [];

  for (let i = 0; i < 42; i++) {
    const date = addDays(start, i);
    const key = dateKey(date);
    const dayTasks = tasksForDate(key).filter((t) => !t.done);
    const dayEvents = eventsForDate(key);
    cells.push(`
      <div class="month-cell ${date.getMonth() !== month ? 'outside-month' : ''} ${isSameDay(date, today) ? 'is-today' : ''} ${isSameDay(date, state.anchor) ? 'is-selected' : ''}"
           data-drop-date="${key}" data-action="select-date" data-date="${key}">
        <span class="day-number">${date.getDate()}</span>
        <div class="cell-items">
          ${dayEvents.slice(0, 2).map(renderEvent).join('')}
          ${dayTasks
            .slice(0, Math.max(0, 2 - dayEvents.length))
            .map(
              (task) => `
            <div class="mini-task mini-${task.color || 'sage'}" draggable="true"
                 data-drag-type="task" data-id="${task.id}"
                 data-context-type="task" data-context-id="${task.id}">
              <span></span>${escapeHTML(task.title)}
            </div>`
            )
            .join('')}
          ${
            dayEvents.length + dayTasks.length > 2
              ? `<span class="more-items">+${dayEvents.length + dayTasks.length - 2} more</span>`
              : ''
          }
        </div>
      </div>`);
  }

  return `
    <div class="month-view">
      <div class="weekday-row">${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        .map((d) => `<div>${d}</div>`)
        .join('')}</div>
      <div class="month-grid">${cells.join('')}</div>
    </div>`;
}