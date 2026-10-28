import { state } from '../../state.js';
import { dateKey, addDays, startOfWeek, isSameDay, fmt } from '../../utils/date.js';
import { escapeHTML } from '../../utils/dom.js';
import { eventsForDate } from '../../domain/items.js';

export function renderWeek() {
  const start = startOfWeek(state.anchor);
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  return `
    <div class="week-view">
      <div class="week-header">
        <div class="time-gutter"></div>
        ${days
          .map(
            (d) => `
          <button class="week-day ${isSameDay(d, new Date()) ? 'today-column' : ''}"
                  data-action="select-date" data-date="${dateKey(d)}" data-drop-date="${dateKey(d)}">
            <span>${fmt(d, { weekday: 'short' })}</span><strong>${d.getDate()}</strong>
          </button>`
          )
          .join('')}
      </div>
      <div class="week-scroll">
        <div class="week-grid">
          <div class="time-gutter">${Array.from(
            { length: 15 },
            (_, i) => `<div>${String(i + 7).padStart(2, '0')}:00</div>`
          ).join('')}</div>
          ${days
            .map((d) => {
              const key = dateKey(d);
              return `
              <div class="week-column" data-drop-date="${key}">
                ${Array.from({ length: 15 }, (_, i) => {
                  const time = `${String(i + 7).padStart(2, '0')}:00`;
                  return `<div class="hour-slot" data-action="new-event" data-date="${key}" data-time="${time}"
                               data-drop-date="${key}" data-drop-time="${time}"></div>`;
                }).join('')}
                ${eventsForDate(key)
                  .map(
                    (event) => `
                  <div class="week-event event-${event.color || 'blue'}"
                       style="top:${Math.max(0, (Number(event.time?.slice(0, 2) || 9) - 7) * 52)}px"
                       draggable="true" data-drag-type="event" data-id="${event.id}"
                       data-context-type="event" data-context-id="${event.id}" data-action="edit-event">
                    <strong>${escapeHTML(event.title)}</strong>
                    <small>${escapeHTML(event.time || '')}</small>
                  </div>`
                  )
                  .join('')}
              </div>`;
            })
            .join('')}
        </div>
      </div>
    </div>`;
}