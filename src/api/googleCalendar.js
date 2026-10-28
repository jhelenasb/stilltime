import { GOOGLE_API } from '../config.js';
import { dateKey } from '../utils/date.js';

export async function fetchCalendarEvents(token) {
  const timeMin = new Date(new Date().getFullYear(), 0, 1).toISOString();
  const timeMax = new Date(new Date().getFullYear() + 1, 11, 31).toISOString();

  const res = await fetch(
    `${GOOGLE_API}/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime&maxResults=250`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.ok) return [];

  const data = await res.json();
  return (data.items || []).map((ev) => {
    const start = ev.start?.dateTime || ev.start?.date;
    const end = ev.end?.dateTime || ev.end?.date;
    const d = start ? new Date(start) : new Date();
    return {
      id: ev.id,
      title: ev.summary || '(No title)',
      date: dateKey(d),
      time: start?.includes('T') ? start.slice(11, 16) : '',
      end: end?.includes('T') ? end.slice(11, 16) : '',
      color: 'blue',
      recurrence: null,
      fromGoogle: true,
    };
  });
}

export async function createCalendarEvent(token, item) {
  const start = item.time
    ? { dateTime: `${item.date}T${item.time}:00` }
    : { date: item.date };
  const end = item.time
    ? {
        dateTime: `${item.date}T${item.end || item.time}:00`,
      }
    : { date: item.date };

  const body = {
    summary: item.title,
    start,
    end: item.time ? end : { date: item.date },
  };

  // Simple daily/weekly RRULE (optional)
  if (item.recurrence?.freq) {
    const freq = item.recurrence.freq.toUpperCase();
    let rrule = `RRULE:FREQ=${freq};INTERVAL=${item.recurrence.interval || 1}`;
    if (item.recurrence.until) {
      rrule += `;UNTIL=${item.recurrence.until.replace(/-/g, '')}`;
    }
    body.recurrence = [rrule];
  }

  const res = await fetch(`${GOOGLE_API}/calendars/primary/events`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error('Failed to create Google event');
  return res.json();
}

export async function updateCalendarEvent(token, eventId, item) {
  const start = item.time
    ? { dateTime: `${item.date}T${item.time}:00` }
    : { date: item.date };
  const end = item.time
    ? { dateTime: `${item.date}T${(item.end || item.time)}:00` }
    : { date: item.date };

  const body = {
    summary: item.title,
    start,
    end,
  };

  if (item.recurrence?.freq) {
    const freq = item.recurrence.freq.toUpperCase();
    let rrule = `RRULE:FREQ=${freq};INTERVAL=${item.recurrence.interval || 1}`;
    if (item.recurrence.until) {
      rrule += `;UNTIL=${item.recurrence.until.replace(/-/g, '')}`;
    }
    body.recurrence = [rrule];
  }

  const res = await fetch(
    `${GOOGLE_API}/calendars/primary/events/${encodeURIComponent(eventId)}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) throw new Error('Failed to update Google event');
  return res.json();
}

export async function deleteCalendarEvent(token, eventId) {
  const res = await fetch(
    `${GOOGLE_API}/calendars/primary/events/${encodeURIComponent(eventId)}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!res.ok && res.status !== 204) {
    throw new Error('Failed to delete Google event');
  }
}

