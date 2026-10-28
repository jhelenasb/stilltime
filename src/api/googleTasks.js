import { GOOGLE_TASKS_API } from '../config.js';

export async function fetchAllTasks(token) {
  const listsRes = await fetch(`${GOOGLE_TASKS_API}/users/@me/lists`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!listsRes.ok) return [];

  const lists = await listsRes.json();
  const allTasks = [];

  for (const list of (lists.items || []).slice(0, 5)) {
    const tasksRes = await fetch(
      `${GOOGLE_TASKS_API}/lists/${list.id}/tasks?showCompleted=true&maxResults=100`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!tasksRes.ok) continue;

    const tData = await tasksRes.json();
    (tData.items || []).forEach((t) => {
      allTasks.push({
        id: t.id,
        listId: list.id,
        title: t.title || '(Untitled)',
        date: t.due ? t.due.slice(0, 10) : '',
        time: '',
        priority: 'medium',
        done: t.status === 'completed',
        color: 'sage',
        list: list.title || 'Tasks',
        recurrence: null,
        fromGoogle: true,
      });
    });
  }

  return allTasks;
}

export async function createTask(token, listId, item) {
  const body = {
    title: item.title,
    status: item.done ? 'completed' : 'needsAction',
  };
  if (item.date) {
    body.due = `${item.date}T00:00:00.000Z`;
  }

  const res = await fetch(`${GOOGLE_TASKS_API}/lists/${listId}/tasks`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error('Failed to create Google task');
  return res.json();
}

export async function getPrimaryTaskListId(token) {
  const res = await fetch(`${GOOGLE_TASKS_API}/users/@me/lists`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.items?.[0]?.id ?? null;
}

export async function updateTask(token, listId, taskId, item) {
  const body = {
    title: item.title,
    status: item.done ? 'completed' : 'needsAction',
  };
  if (item.date) body.due = `${item.date}T00:00:00.000Z`;

  const res = await fetch(
    `${GOOGLE_TASKS_API}/lists/${encodeURIComponent(listId)}/tasks/${encodeURIComponent(taskId)}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) throw new Error('Failed to update Google task');
  return res.json();
}

export async function deleteTask(token, listId, taskId) {
  const res = await fetch(
    `${GOOGLE_TASKS_API}/lists/${encodeURIComponent(listId)}/tasks/${encodeURIComponent(taskId)}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!res.ok && res.status !== 204) {
    throw new Error('Failed to delete Google task');
  }
}