import { state } from '../../state.js';
import { dateKey, fromKey, isSameDay, fmt } from '../../utils/date.js';
import { escapeHTML, icon } from '../../utils/dom.js';
import { tasksForDate, eventsForDate } from '../../domain/items.js';

export function renderSemester() {
  const year = state.anchor.getFullYear();
  const startMonth = state.anchor.getMonth() < 6 ? 0 : 6;
  const months = Array.from({ length: 6 }, (_, i) => startMonth + i);

  return `
    <div class="long-view semester-view">
      ${months
        .map((month) => {
          const first = new Date(year, month, 1);
          const daysInMonth = new Date(year, month + 1, 0).getDate();
          const blanks = (first.getDay() + 6) % 7;
          const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
          const monthTasks = state.tasks.filter(
            (t) => t.date?.startsWith(prefix) && !t.done
          );
          const monthEvents = state.events.filter((e) => e.date?.startsWith(prefix));
          return `
          <div class="mini-month-card rich-month" data-action="select-month" data-month="${month}">
            <div class="mini-month-title">
              ${fmt(first, { month: 'long' })}
              <span>${monthTasks.length + monthEvents.length || ''}</span>
            </div>
            <div class="mini-month-days">
              ${['M', 'T', 'W', 'T', 'F', 'S', 'S']
                .map((d) => `<span class="mini-weekday">${d}</span>`)
                .join('')}
              ${Array.from({ length: blanks }, () => '<span></span>').join('')}
              ${Array.from({ length: daysInMonth }, (_, i) => {
                const date = new Date(year, month, i + 1);
                const key = dateKey(date);
                const has = tasksForDate(key).length || eventsForDate(key).length;
                return `<span class="${isSameDay(date, new Date()) ? 'mini-today' : ''} ${has ? 'mini-has-items' : ''}">${i + 1}</span>`;
              }).join('')}
            </div>
            <div class="month-preview-list">
              ${
                [...monthEvents, ...monthTasks]
                  .slice(0, 3)
                  .map(
                    (item) => `
                <div class="preview-item"><span class="preview-dot"></span>${escapeHTML(item.title)}</div>`
                  )
                  .join('') || '<div class="preview-empty">No items</div>'
              }
            </div>
          </div>`;
        })
        .join('')}
    </div>`;
}

export function renderQuarter() {
  const year = state.anchor.getFullYear();
  const quarters = [
    { name: 'Q1', title: 'Fresh starts', months: [0, 1, 2], color: 'sage' },
    { name: 'Q2', title: 'Find your rhythm', months: [3, 4, 5], color: 'blue' },
    { name: 'Q3', title: 'Make room to grow', months: [6, 7, 8], color: 'peach' },
    { name: 'Q4', title: 'Reflect & reset', months: [9, 10, 11], color: 'lavender' },
  ];

  return `
    <div class="quarter-view">
      ${quarters
        .map((q, qi) => {
          const tasks = state.tasks.filter((t) => {
            if (!t.date) return false;
            const d = fromKey(t.date);
            return d.getFullYear() === year && q.months.includes(d.getMonth()) && !t.done;
          });
          const events = state.events.filter((e) => {
            if (!e.date) return false;
            const d = fromKey(e.date);
            return d.getFullYear() === year && q.months.includes(d.getMonth());
          });
          return `
          <section class="quarter-card quarter-${q.color}">
            <div class="quarter-card-top">
              <div class="quarter-label">${q.name}</div>
              <span class="quarter-date">${fmt(new Date(year, q.months[0], 1), { month: 'short' })} – ${fmt(new Date(year, q.months[2], 1), { month: 'short' })}</span>
            </div>
            <h3>${q.title}</h3>
            <div class="quarter-months">
              ${q.months
                .map(
                  (m) =>
                    `<button data-action="select-month" data-month="${m}">${fmt(new Date(year, m, 1), { month: 'short' })}</button>`
                )
                .join('')}
            </div>
            <div class="quarter-stats">
              <div><strong>${tasks.length}</strong><span>open tasks</span></div>
              <div><strong>${events.length}</strong><span>events</span></div>
            </div>
            <div class="quarter-task-preview">
              ${
                [...tasks, ...events]
                  .slice(0, 4)
                  .map(
                    (item) => `
                <div><span class="quarter-task-dot"></span>${escapeHTML(item.title)}</div>`
                  )
                  .join('') || '<span class="quarter-empty">Space for what matters.</span>'
              }
            </div>
            <button class="quarter-plan" data-action="open-quarter" data-quarter="${qi}">
              Open ${q.name} ${icon('right', 15)}
            </button>
          </section>`;
        })
        .join('')}
    </div>`;
}

export function renderThreeMonth() {
  const year = state.anchor.getFullYear();
  const q = Math.floor(state.anchor.getMonth() / 3);
  const startMonth = q * 3;
  const months = [startMonth, startMonth + 1, startMonth + 2];

  return `
    <div class="long-view three-month-view">
      ${months
        .map((month) => {
          const first = new Date(year, month, 1);
          const daysInMonth = new Date(year, month + 1, 0).getDate();
          const blanks = (first.getDay() + 6) % 7;
          const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
          const monthTasks = state.tasks.filter(
            (t) => t.date?.startsWith(prefix) && !t.done
          );
          const monthEvents = state.events.filter((e) => e.date?.startsWith(prefix));

          return `
          <div class="mini-month-card rich-month" data-action="select-month" data-month="${month}">
            <div class="mini-month-title">
              ${fmt(first, { month: 'long' })}
              <span>${monthTasks.length + monthEvents.length || ''}</span>
            </div>
            <div class="mini-month-days">
              ${['M', 'T', 'W', 'T', 'F', 'S', 'S']
                .map((d) => `<span class="mini-weekday">${d}</span>`)
                .join('')}
              ${Array.from({ length: blanks }, () => '<span></span>').join('')}
              ${Array.from({ length: daysInMonth }, (_, i) => {
                const date = new Date(year, month, i + 1);
                const key = dateKey(date);
                const has = tasksForDate(key).length || eventsForDate(key).length;
                return `<span class="${isSameDay(date, new Date()) ? 'mini-today' : ''} ${has ? 'mini-has-items' : ''}">${i + 1}</span>`;
              }).join('')}
            </div>
            <div class="month-preview-list">
              ${
                [...monthEvents, ...monthTasks]
                  .slice(0, 4)
                  .map(
                    (item) => `
                <div class="preview-item"><span class="preview-dot"></span>${escapeHTML(item.title)}</div>`
                  )
                  .join('') || '<div class="preview-empty">No items</div>'
              }
            </div>
          </div>`;
        })
        .join('')}
    </div>`;
}

export function renderYear() {
  const year = state.anchor.getFullYear();
  return `
    <div class="long-view year-view">
      ${Array.from({ length: 12 }, (_, month) => {
        const first = new Date(year, month, 1);
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const blanks = (first.getDay() + 6) % 7;
        const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
        const count =
          state.tasks.filter((t) => t.date?.startsWith(prefix) && !t.done).length +
          state.events.filter((e) => e.date?.startsWith(prefix)).length;
        return `
          <div class="mini-month-card" data-action="select-month" data-month="${month}">
            <div class="mini-month-title">${fmt(first, { month: 'long' })}<span>${count || ''}</span></div>
            <div class="mini-month-days">
              ${['M', 'T', 'W', 'T', 'F', 'S', 'S']
                .map((d) => `<span class="mini-weekday">${d}</span>`)
                .join('')}
              ${Array.from({ length: blanks }, () => '<span></span>').join('')}
              ${Array.from({ length: daysInMonth }, (_, i) => {
                const date = new Date(year, month, i + 1);
                const key = dateKey(date);
                const has = tasksForDate(key).length || eventsForDate(key).length;
                return `<span class="${isSameDay(date, new Date()) ? 'mini-today' : ''} ${has ? 'mini-has-items' : ''}">${i + 1}</span>`;
              }).join('')}
            </div>
          </div>`;
      }).join('')}
    </div>`;
}