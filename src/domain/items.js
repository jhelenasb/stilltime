import { state } from '../state.js';
import {
  todayKey,
  addDays,
  startOfWeek,
  dateKey,
} from '../utils/date.js';
import { expandRecurrence, readRecurrence } from './recurrence.js';
import { persistLocals } from './storage.js';
import {
  pushEventCreate,
  pushEventUpdate,
  pushEventDelete,
  pushTaskCreate,
  pushTaskUpdate,
  pushTaskDelete,
} from './sync.js';

export function getViewRange() {
  const d = state.anchor;
  const y = d.getFullYear();
  const m = d.getMonth();

  if (state.view === 'Day') {
    const k = dateKey(d);
    return { start: k, end: k };
  }
  if (state.view === 'Week') {
    const start = startOfWeek(d);
    return { start: dateKey(start), end: dateKey(addDays(start, 6)) };
  }
  if (state.view === 'ThreeMonth') {
    const q = Math.floor(m / 3);
    return {
      start: dateKey(new Date(y, q * 3, 1)),
      end: dateKey(new Date(y, q * 3 + 3, 0)),
    };
  }
  if (state.view === 'Month') {
    return {
      start: dateKey(new Date(y, m, 1)),
      end: dateKey(new Date(y, m + 1, 0)),
    };
  }
  if (state.view === 'Semester') {
    const startMonth = m < 6 ? 0 : 6;
    return {
      start: dateKey(new Date(y, startMonth, 1)),
      end: dateKey(new Date(y, startMonth + 6, 0)),
    };
  }
  if (state.view === 'Quarter') {
    const q = Math.floor(m / 3);
    return {
      start: dateKey(new Date(y, q * 3, 1)),
      end: dateKey(new Date(y, q * 3 + 3, 0)),
    };
  }
  return { start: `${y}-01-01`, end: `${y}-12-31` };
}

export function eventsForDate(key) {
  const out = [];
  for (const event of state.events) {
    if (expandRecurrence(event, key, key).includes(key)) {
      out.push({ ...event, _instanceDate: key });
    }
  }
  return out;
}

export function tasksForDate(key) {
  const out = [];
  for (const task of state.tasks) {
    if (!task.date) continue;
    if (expandRecurrence(task, key, key).includes(key)) {
      out.push({ ...task, _instanceDate: key });
    }
  }
  return out;
}

export function tasksInCurrentView() {
  const { start, end } = getViewRange();
  return state.tasks.filter((t) => {
    if (!t.date) return true;
    if (t.recurrence?.freq) return expandRecurrence(t, start, end).length > 0;
    return t.date >= start && t.date <= end;
  });
}

/**
 * Create or update a task/event from the modal form.
 * Mutates state.tasks / state.events.
 */
export function saveItemFromForm(form, modal) {
  const data = new FormData(form);
  const title = String(data.get('title') || '').trim();
  if (!title || !modal) return false;

  const isTask = modal.type === 'task';
  const id = modal.id;
  const rawDate = String(data.get('date') || '').trim();
  const recurrence = readRecurrence(data);

  const item = {
    title,
    date: rawDate,
    time: String(data.get('time') || ''),
    recurrence,
  };

  if (recurrence && !item.date) {
    item.date = todayKey();
  }

  if (isTask) {
    item.list = String(data.get('list') || 'Tasks');
    item.priority = String(data.get('priority') || 'medium');
    item.color =
      item.priority === 'high'
        ? 'peach'
        : item.priority === 'medium'
          ? 'blue'
          : 'sage';

    if (id) {
      const existing = state.tasks.find((t) => String(t.id) === String(id));
      if (existing) {
        Object.assign(existing, item);
        persistLocals(state);
        pushTaskUpdate(existing);
      }
    } else {
      const row = {
        id: `local-${Date.now()}`,
        done: false,
        fromGoogle: false,
        ...item,
      };
      state.tasks.push(row);
      persistLocals(state);
      pushTaskCreate(row);
    }
  } else {
    if (!item.date) item.date = todayKey();
    item.color = String(data.get('color') || 'sage');
    item.end = item.time
      ? `${String((Number(item.time.slice(0, 2)) + 1) % 24).padStart(2, '0')}:${item.time.slice(3)}`
      : '';

    if (id) {
      const existing = state.events.find((e) => String(e.id) === String(id));
      if (existing) {
        Object.assign(existing, item);
        persistLocals(state);
        pushEventUpdate(existing);
      }
    } else {
      const row = {
        id: `e${Date.now()}`,
        fromGoogle: false,
        ...item,
      };
      state.events.push(row);
      persistLocals(state);
      pushEventCreate(row);
    }
  }

  return true;
}

export function toggleTaskDone(id) {
  const task = state.tasks.find((t) => String(t.id) === String(id));
  if (!task) return null;
  task.done = !task.done;
  persistLocals(state);
  pushTaskUpdate(task);
  return task;
}

export function deleteItem(type, id) {
  if (type === 'task') {
    const item = state.tasks.find((t) => String(t.id) === String(id));
    state.tasks = state.tasks.filter((t) => String(t.id) !== String(id));
    persistLocals(state);
    if (item) pushTaskDelete(item);
  } else {
    const item = state.events.find((e) => String(e.id) === String(id));
    state.events = state.events.filter((e) => String(e.id) !== String(id));
    persistLocals(state);
    if (item) pushEventDelete(item);
  }
}

export function moveItem(type, id, newDate, newTime = '') {
  if (type === 'task') {
    const task = state.tasks.find((t) => String(t.id) === String(id));
    if (!task) return null;
    task.date = newDate;
    if (newTime) task.time = newTime;
    persistLocals(state);
    pushTaskUpdate(task);
    return task;
  }

  const event = state.events.find((e) => String(e.id) === String(id));
  if (!event) return null;
  event.date = newDate;
  if (newTime) {
    event.time = newTime;
    const hour = Number(newTime.slice(0, 2));
    event.end = `${String((hour + 1) % 24).padStart(2, '0')}:${newTime.slice(3)}`;
  }
  persistLocals(state);
  pushEventUpdate(event);
  return event;
}