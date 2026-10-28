import { state, render } from '../state.js';
import { connectGoogle, disconnectGoogle } from '../auth/google.js';
import {
  saveItemFromForm,
  toggleTaskDone,
  deleteItem,
  moveItem,
} from '../domain/items.js';
import { fromKey, todayKey } from '../utils/date.js';
import { showToast } from '../ui/toast.js';
import { debounce } from '../utils/async.js';

function changeAnchor(direction) {
  const d = new Date(state.anchor);
  if (state.view === 'Day') d.setDate(d.getDate() + direction);
  else if (state.view === 'Week') d.setDate(d.getDate() + direction * 7);
  else if (state.view === 'Month') d.setMonth(d.getMonth() + direction);
  else if (state.view === 'Semester') d.setMonth(d.getMonth() + direction * 6);
  else if (state.view === 'Quarter' || state.view === 'ThreeMonth') {
    d.setMonth(d.getMonth() + direction * 3);
  } else {
    d.setFullYear(d.getFullYear() + direction);
  }
  state.anchor = d;
  render();
}

function openModal(type, id = null, date = '', time = '') {
  state.modal = {
    type,
    id,
    date: type === 'event' ? date || todayKey() : date,
    time,
  };
  state.contextMenu = null;
  render();
  setTimeout(() => document.querySelector('.edit-modal input[name="title"]')?.focus(), 30);
}

function closeModal() {
  state.modal = null;
  render();
}

function saveItem(form) {
  const ok = saveItemFromForm(form, state.modal);
  if (!ok) return;
  state.modal = null;
  render();
  showToast('Saved');
}

function onDragStart(e) {
  const el = e.target.closest('[data-drag-type]');
  if (!el) return;
  e.dataTransfer.setData(
    'application/json',
    JSON.stringify({ type: el.dataset.dragType, id: el.dataset.id })
  );
  e.dataTransfer.effectAllowed = 'move';
  el.classList.add('dragging');
}

function onDragEnd(e) {
  e.target.closest('[data-drag-type]')?.classList.remove('dragging');
  document.querySelectorAll('.drop-target').forEach((n) => n.classList.remove('drop-target'));
}

function onDragOver(e) {
  const zone = e.target.closest('[data-drop-date]');
  if (!zone) return;
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  zone.classList.add('drop-target');
}

function onDragLeave(e) {
  e.target.closest('[data-drop-date]')?.classList.remove('drop-target');
}

function onDrop(e) {
  const zone = e.target.closest('[data-drop-date]');
  if (!zone) return;
  e.preventDefault();
  zone.classList.remove('drop-target');

  let payload;
  try {
    payload = JSON.parse(e.dataTransfer.getData('application/json'));
  } catch {
    return;
  }

  const moved = moveItem(
    payload.type,
    payload.id,
    zone.dataset.dropDate,
    zone.dataset.dropTime || ''
  );
  if (moved) showToast(`Moved “${moved.title}”`);
  render();
}

function handleAction(button, originalEvent) {
  const action = button.dataset.action;
  const id = button.dataset.id;
  const date = button.dataset.date;
  const time = button.dataset.time;
  const type = button.dataset.type;

  switch (action) {
    case 'connect-google':
      connectGoogle();
      break;
    case 'disconnect-google':
      disconnectGoogle();
      break;
    case 'add-task':
      openModal('task');
      break;
    case 'today':
      state.anchor = new Date();
      state.view = 'Day';
      render();
      break;
    case 'theme':
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('stilltime-theme', state.theme);
      render();
      break;
    case 'previous':
      changeAnchor(-1);
      break;
    case 'next':
      changeAnchor(1);
      break;
    case 'select-date':
      state.anchor = fromKey(date);
      state.view = 'Day';
      render();
      break;
    case 'select-month':
      state.anchor = new Date(
        state.anchor.getFullYear(),
        Number(button.dataset.month),
        1
      );
      state.view = 'Month';
      render();
      break;
    case 'open-quarter': {
      const qi = Number(button.dataset.quarter);
      const year = state.anchor.getFullYear();
      state.anchor = new Date(year, qi * 3, 1);
      state.view = 'ThreeMonth';
      render();
      break;
    }
    case 'new-event':
      openModal('event', null, date, time);
      break;
    case 'edit-task':
      openModal('task', id);
      break;
    case 'edit-event':
      openModal('event', id);
      break;
    case 'toggle-task': {
      const task = toggleTaskDone(id);
      if (task) {
        render();
        showToast(task.done ? 'Done ✨' : 'Reopened');
      }
      break;
    }
    case 'close-modal':
      closeModal();
      break;
    case 'delete-item': {
      deleteItem(state.modal?.type, id);
      state.modal = null;
      render();
      showToast('Deleted');
      break;
    }
    case 'backdrop':
      if (originalEvent?.target === button) closeModal();
      break;
    case 'context-edit':
      openModal(type, id);
      break;
    case 'context-toggle': {
      const task = toggleTaskDone(id);
      if (task) {
        state.contextMenu = null;
        render();
        showToast(task.done ? 'Done ✨' : 'Reopened');
      }
      break;
    }
    case 'context-delete': {
      deleteItem(type, id);
      state.contextMenu = null;
      render();
      showToast('Deleted');
      break;
    }
  }
}

/**
 * Attach all app event listeners once.
 * @param {HTMLElement} root - #app element
 */
export function bindListeners(root) {
  root.addEventListener('click', (event) => {
    if (event.target.closest('.dragging')) return;

    if (state.contextMenu && !event.target.closest('.context-menu')) {
      state.contextMenu = null;
      render();
      return;
    }

    const viewButton = event.target.closest('[data-view]');
    if (viewButton) {
      state.view = viewButton.dataset.view;
      render();
      return;
    }

    const filterButton = event.target.closest('[data-filter]');
    if (filterButton) {
      state.taskFilter = filterButton.dataset.filter;
      render();
      return;
    }

    const actionButton = event.target.closest('[data-action]');
    if (actionButton) handleAction(actionButton, event);
  });

  root.addEventListener('contextmenu', (event) => {
    const target = event.target.closest('[data-context-type]');
    if (!target) return;
    event.preventDefault();
    state.contextMenu = {
      x: event.clientX,
      y: event.clientY,
      type: target.dataset.contextType,
      id: target.dataset.contextId,
    };
    render();
  });

  root.addEventListener('change', (e) => {
    if (e.target.id === 'recurrence-freq') {
      const opts = document.getElementById('recurrence-options');
      const wd = document.getElementById('weekday-row');
      const v = e.target.value;
      if (opts) opts.style.display = v ? '' : 'none';
      if (wd) wd.style.display = v === 'weekly' ? '' : 'none';
    }
  });

  root.addEventListener('dragstart', onDragStart);
  root.addEventListener('dragend', onDragEnd);
  root.addEventListener('dragover', onDragOver);
  root.addEventListener('dragleave', onDragLeave);
  root.addEventListener('drop', onDrop);

  root.addEventListener('submit', (event) => {
    if (event.target.id === 'item-form') {
      event.preventDefault();
      saveItem(event.target);
    }
  });

  const onSearchInput = debounce((value, cursor) => {
  state.search = value;
  render();
  const input = document.querySelector('#search-input');
  if (input) {
    input.focus();
    if (typeof cursor === 'number') input.setSelectionRange(cursor, cursor);
  }
}, 180);

root.addEventListener('input', (event) => {
  if (event.target.id === 'search-input') {
    const cursor = event.target.selectionStart;
    onSearchInput(event.target.value, cursor);
  }
});

  document.addEventListener('keydown', (event) => {
    const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(
      document.activeElement?.tagName
    );

    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      if (state.googleConnected) openModal('task');
    }

    if (event.key === 'Escape') {
      if (state.modal) closeModal();
      if (state.contextMenu) {
        state.contextMenu = null;
        render();
      }
    }

    if (!typing && state.googleConnected) {
      if (event.key === 'ArrowLeft') changeAnchor(-1);
      if (event.key === 'ArrowRight') changeAnchor(1);
    }
  });
}