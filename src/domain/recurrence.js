import { dateKey, fromKey } from '../utils/date.js';

/**
 * @param {object} item - task or event with optional { date, recurrence }
 * @param {string} rangeStart - YYYY-MM-DD
 * @param {string} rangeEnd - YYYY-MM-DD
 * @returns {string[]} date keys in range
 */
export function expandRecurrence(item, rangeStart, rangeEnd) {
  if (!item.date) return [];
  if (!item.recurrence?.freq) {
    return item.date >= rangeStart && item.date <= rangeEnd ? [item.date] : [];
  }

  const { freq, interval = 1, byWeekday = [], until, count } = item.recurrence;
  const start = fromKey(item.date);
  const rangeEndDate = fromKey(rangeEnd);
  const endLimit = until ? fromKey(until) : rangeEndDate;
  const hardEnd = endLimit < rangeEndDate ? endLimit : rangeEndDate;

  const dates = [];
  let cursor = new Date(start);
  let occurrences = 0;
  const maxScan = 400;

  for (let i = 0; i < maxScan; i++) {
    if (cursor > hardEnd) break;
    if (count != null && occurrences >= count) break;

    const key = dateKey(cursor);
    let matches = true;

    if (freq === 'weekly' && byWeekday.length) {
      const wd = (cursor.getDay() + 6) % 7; // Mon=0 … Sun=6
      matches = byWeekday.includes(wd);
    }

    if (matches && key >= item.date) {
      if (key >= rangeStart && key <= rangeEnd) dates.push(key);
      occurrences += 1;
    }

    if (freq === 'daily') {
      cursor.setDate(cursor.getDate() + interval);
    } else if (freq === 'weekly') {
      if (byWeekday.length) cursor.setDate(cursor.getDate() + 1);
      else cursor.setDate(cursor.getDate() + 7 * interval);
    } else if (freq === 'monthly') {
      cursor.setMonth(cursor.getMonth() + interval);
    } else if (freq === 'yearly') {
      cursor.setFullYear(cursor.getFullYear() + interval);
    } else {
      break;
    }
  }

  return dates;
}

/** Read recurrence fields from a FormData instance */
export function readRecurrence(data) {
  const freq = String(data.get('recurrence_freq') || '').trim();
  if (!freq) return null;

  const interval = Math.max(1, Number(data.get('recurrence_interval')) || 1);
  const until = String(data.get('recurrence_until') || '').trim();
  const byWeekday = [...data.getAll('recurrence_wd')]
    .map((v) => Number(v))
    .filter((n) => !Number.isNaN(n));

  return {
    freq,
    interval,
    byWeekday: freq === 'weekly' ? byWeekday : [],
    until: until || '',
    count: null,
  };
}