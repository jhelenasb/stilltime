import { getAccessToken } from '../auth/google.js';
import {
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from '../api/googleCalendar.js';
import {
  createTask,
  updateTask,
  deleteTask,
  getPrimaryTaskListId,
} from '../api/googleTasks.js';
import { state } from '../state.js';
import { persistLocals } from './storage.js';

function isGoogleId(item) {
  return item?.fromGoogle === true && item.id && !String(item.id).startsWith('local-');
}

export async function pushEventCreate(item) {
  const token = getAccessToken();
  if (!token) return item;
  try {
    const created = await createCalendarEvent(token, item);
    item.id = created.id;
    item.fromGoogle = true;
    persistLocals(state);
    return item;
  } catch (e) {
    console.warn(e);
    return item;
  }
}

export async function pushEventUpdate(item) {
  const token = getAccessToken();
  if (!token || !isGoogleId(item)) return;
  try {
    await updateCalendarEvent(token, item.id, item);
  } catch (e) {
    console.warn(e);
  }
}

export async function pushEventDelete(item) {
  const token = getAccessToken();
  if (!token || !isGoogleId(item)) return;
  try {
    await deleteCalendarEvent(token, item.id);
  } catch (e) {
    console.warn(e);
  }
}

export async function pushTaskCreate(item) {
  const token = getAccessToken();
  if (!token) return item;
  try {
    const listId = item.listId || (await getPrimaryTaskListId(token));
    if (!listId) return item;
    const created = await createTask(token, listId, item);
    item.id = created.id;
    item.listId = listId;
    item.fromGoogle = true;
    persistLocals(state);
    return item;
  } catch (e) {
    console.warn(e);
    return item;
  }
}

export async function pushTaskUpdate(item) {
  const token = getAccessToken();
  if (!token || !isGoogleId(item)) return;
  try {
    const listId = item.listId || (await getPrimaryTaskListId(token));
    if (!listId) return;
    await updateTask(token, listId, item.id, item);
  } catch (e) {
    console.warn(e);
  }
}

export async function pushTaskDelete(item) {
  const token = getAccessToken();
  if (!token || !isGoogleId(item)) return;
  try {
    const listId = item.listId || (await getPrimaryTaskListId(token));
    if (!listId) return;
    await deleteTask(token, listId, item.id);
  } catch (e) {
    console.warn(e);
  }
}