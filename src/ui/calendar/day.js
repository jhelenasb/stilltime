import { state } from '../../state.js';
import { dateKey, isSameDay, fmt } from '../../utils/date.js';
import { icon } from '../../utils/dom.js';
import { eventsForDate, tasksForDate } from '../../domain/items.js';
import { renderEvent } from './eventPill.js';

export function renderDay() {
  const key = dateKey(state.anchor);
  return `
    <div class="day-view">
      <div class="day-banner">
        <div class="day-banner-icon">${icon('sun', 24)}</div>
        <div>
          <span>MAKE TODAY YOURS</span>
          <h2>${isSameDay(state.anchor, new Date()) ? 'One thing at a time.' : fmt(state.anchor, { weekday: 'long' })}</h2>
          <p>${eventsForDate(key).length} events · ${tasksForDate(key).filter((t) => !t.done).length} open tasks</p>
        </div>
      </div>
      <div class="day-schedule">
        ${Array.from({ length: 15 }, (_, i) => {
          const hour = i + 7;
          const time = `${String(hour).padStart(2, '0')}:00`;
          const events = eventsForDate(key).filter(
            (e) => Number(e.time?.slice(0, 2)) === hour
          );
          return `
            <div class="day-hour" data-drop-date="${key}" data-drop-time="${time}">
              <div class="day-time">${fmt(new Date(2000, 0, 1, hour), { hour: 'numeric' })}</div>
              <div class="day-hour-content">
                <button class="hour-add" data-action="new-event" data-date="${key}" data-time="${time}">+ Add event</button>
                ${events.map(renderEvent).join('')}
              </div>
            </div>`;
        }).join('')}
      </div>
    </div>`;
}