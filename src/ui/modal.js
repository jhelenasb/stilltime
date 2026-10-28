import { COLORS } from '../config.js';
import { state } from '../state.js';
import { todayKey } from '../utils/date.js';
import { escapeHTML, icon } from '../utils/dom.js';

export function renderModal() {
if (!state.modal) return '';

  const item =
    state.modal.type === 'task'
      ? state.tasks.find((t) => String(t.id) === String(state.modal.id))
      : state.events.find((e) => String(e.id) === String(state.modal.id));

  const isTask = state.modal.type === 'task';
  const isEdit = Boolean(item);
  const rec = item?.recurrence || null;
  const freq = rec?.freq || '';

  return `
    <div class="modal-backdrop" data-action="backdrop">
      <form class="edit-modal" id="item-form">
        <div class="modal-heading">
          <div>
            <span class="modal-kicker">${isEdit ? 'EDIT' : 'CREATE'}</span>
            <h2>${isEdit ? 'Edit' : 'Add'} ${isTask ? 'task' : 'event'}</h2>
          </div>
          <button type="button" class="icon-button" data-action="close-modal">${icon('close')}</button>
        </div>
        <label class="field-label">Title
          <input name="title" required maxlength="160" placeholder="What’s on your mind?"
                 value="${escapeHTML(item?.title || '')}" autofocus>
        </label>
        <div class="field-row">
          <label class="field-label">Date
            <input name="date" type="date" ${isTask ? '' : 'required'}
                   value="${item?.date || (isTask ? '' : state.modal.date || todayKey())}">
            ${
              isTask
                ? `<span class="field-hint">Leave empty for no date — drag onto the calendar later.</span>`
                : ''
            }
          </label>
          <label class="field-label">Time
            <input name="time" type="time" value="${item?.time || state.modal.time || ''}">
          </label>
        </div>
        ${
          isTask
            ? `<div class="field-row">
              <label class="field-label">List
                <select name="list">
                  <option ${item?.list === 'Personal' ? 'selected' : ''}>Personal</option>
                  <option ${item?.list === 'Work' ? 'selected' : ''}>Work</option>
                  <option ${!item || item.list === 'Tasks' ? 'selected' : ''}>Tasks</option>
                </select>
              </label>
              <label class="field-label">Priority
                <select name="priority">
                  <option value="low" ${item?.priority === 'low' ? 'selected' : ''}>Low</option>
                  <option value="medium" ${!item || item.priority === 'medium' ? 'selected' : ''}>Medium</option>
                  <option value="high" ${item?.priority === 'high' ? 'selected' : ''}>High</option>
                </select>
              </label>
            </div>`
            : `<div class="field-label">Color
              <div class="color-picker">
                ${Object.keys(COLORS)
                  .map(
                    (c) => `
                  <label class="color-choice">
                    <input type="radio" name="color" value="${c}" ${
                      item?.color === c || (!item && c === 'sage') ? 'checked' : ''
                    }>
                    <span class="color-swatch swatch-${c}"></span><span>${c}</span>
                  </label>`
                  )
                  .join('')}
              </div>
            </div>`
        }

        <label class="field-label">Repeat
          <select name="recurrence_freq" id="recurrence-freq">
            <option value="" ${!freq ? 'selected' : ''}>Does not repeat</option>
            <option value="daily" ${freq === 'daily' ? 'selected' : ''}>Daily</option>
            <option value="weekly" ${freq === 'weekly' ? 'selected' : ''}>Weekly</option>
            <option value="monthly" ${freq === 'monthly' ? 'selected' : ''}>Monthly</option>
            <option value="yearly" ${freq === 'yearly' ? 'selected' : ''}>Yearly</option>
          </select>
        </label>
        <div class="recurrence-options" id="recurrence-options" style="${freq ? '' : 'display:none'}">
          <div class="field-row">
            <label class="field-label">Every
              <input name="recurrence_interval" type="number" min="1" max="99" value="${rec?.interval || 1}">
            </label>
            <label class="field-label">Ends
              <input name="recurrence_until" type="date" value="${rec?.until || ''}">
            </label>
          </div>
          <div class="field-label" id="weekday-row" style="${freq === 'weekly' ? '' : 'display:none'}">
            Days of week
            <div class="weekday-chips">
              ${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                .map((label, i) => {
                  const checked = (rec?.byWeekday || []).includes(i);
                  return `<label class="weekday-chip">
                    <input type="checkbox" name="recurrence_wd" value="${i}" ${checked ? 'checked' : ''}>
                    <span>${label}</span>
                  </label>`;
                })
                .join('')}
            </div>
          </div>
          <p class="field-hint">Leave “Ends” empty to repeat within the calendar range. Recurring items need a start date.</p>
        </div>

        <div class="modal-actions">
          ${
            isEdit
              ? `<button type="button" class="button button-danger" data-action="delete-item" data-id="${item.id}">Delete</button>`
              : '<span></span>'
          }
          <div>
            <button type="button" class="button button-quiet" data-action="close-modal">Cancel</button>
            <button type="submit" class="button button-primary">${isEdit ? 'Save' : 'Create'}</button>
          </div>
        </div>
      </form>
    </div>`;
}

export function renderContextMenu() {
  if (!state.contextMenu) return '';
  const { x, y, type, id } = state.contextMenu;
  return `
    <div class="context-menu" style="top:${y}px;left:${x}px">
      <button data-action="context-edit" data-type="${type}" data-id="${id}">${icon('edit', 15)} Edit</button>
      ${
        type === 'task'
          ? `<button data-action="context-toggle" data-id="${id}">${icon('check', 15)} Toggle done</button>`
          : ''
      }
      <button class="danger" data-action="context-delete" data-type="${type}" data-id="${id}">${icon('trash', 15)} Delete</button>
    </div>`;
}