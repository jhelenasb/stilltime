import { escapeHTML } from '../../utils/dom.js';

export function renderEvent(event) {
  return `
    <div class="event-pill event-${event.color || 'blue'}"
         draggable="true" data-drag-type="event" data-id="${event.id}"
         data-context-type="event" data-context-id="${event.id}"
         data-action="edit-event" title="${escapeHTML(event.title)}">
      <span class="event-dot"></span>
      <span>${escapeHTML(event.title)}</span>
      ${event.time ? `<small>${escapeHTML(event.time)}</small>` : ''}
    </div>`;
}