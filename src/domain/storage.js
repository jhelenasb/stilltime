const LOCAL_TASKS_KEY = 'stilltime-local-tasks';
const LOCAL_EVENTS_KEY = 'stilltime-local-events';

export function loadLocalTasks() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_TASKS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function loadLocalEvents() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_EVENTS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveLocalTasks(tasks) {
  const local = tasks.filter(
    (t) => t.fromGoogle === false || String(t.id).startsWith('local-')
  );
  localStorage.setItem(LOCAL_TASKS_KEY, JSON.stringify(local));
}

export function saveLocalEvents(events) {
  const local = events.filter(
    (e) => e.fromGoogle === false || /^e\d+$/.test(String(e.id))
  );
  localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(local));
}

/** Call after any tasks/events mutation */
export function persistLocals(state) {
  saveLocalTasks(state.tasks);
  saveLocalEvents(state.events);
}