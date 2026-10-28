import { VIEWS } from '../config.js';
import { state } from '../state.js';
import { fmt } from '../utils/date.js';
import { escapeHTML, icon } from '../utils/dom.js';
import { startOfWeek, addDays } from '../utils/date.js';

function dateTitle() {
  const d = state.anchor;
  if (state.view === 'Day') {
    return fmt(d, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  }
  if (state.view === 'Week') {
    const start = startOfWeek(d);
    const end = addDays(start, 6);
    return `${fmt(start, { month: 'short', day: 'numeric' })} – ${fmt(end, { month: 'short', day: 'numeric', year: 'numeric' })}`;
  }
  if (state.view === 'Month') return fmt(d, { month: 'long', year: 'numeric' });
  if (state.view === 'Semester') {
    return `${d.getMonth() < 6 ? 'First' : 'Second'} semester · ${d.getFullYear()}`;
  }
  if (state.view === 'Quarter' || state.view === 'ThreeMonth') {
    return `Q${Math.floor(d.getMonth() / 3) + 1} · ${d.getFullYear()}`;
  }
  return String(d.getFullYear());
}

function renderGoogleButton() {
  if (state.googleLoading) {
    return `<button class="button button-quiet" disabled>Syncing…</button>`;
  }
  if (state.googleConnected) {
    const name = state.googleUser?.name?.split(' ')[0] || 'Google';
    return `<button class="button button-quiet" data-action="disconnect-google" title="Disconnect">✓ ${escapeHTML(name)}</button>`;
  }
  return `<button class="button button-quiet" data-action="connect-google">Connect Google</button>`;
}

export function renderHeader() {
  return `
    <header class="topbar">
      <div class="topbar-title">
        <div class="eyebrow">${fmt(state.anchor, { weekday: 'long' })}</div>
        <h1>${escapeHTML(dateTitle())}</h1>
      </div>
      <div class="topbar-actions">
        ${renderGoogleButton()}
        <label class="search-box">${icon('search')}
          <input id="search-input" type="search" placeholder="Search…" value="${escapeHTML(state.search)}">
        </label>
        <button class="button button-primary top-add" data-action="add-task">${icon('plus')}<span>New</span></button>
        <button class="icon-button" data-action="theme" title="Theme">${icon(state.theme === 'dark' ? 'sunOutline' : 'moon')}</button>
      </div>
    </header>
    <div class="calendar-toolbar">
      <div class="date-navigation">
        <button class="icon-button nav-arrow" data-action="previous">${icon('left')}</button>
        <button class="button button-quiet today-button" data-action="today">Today</button>
        <button class="icon-button nav-arrow" data-action="next">${icon('right')}</button>
      </div>
      <div class="view-switcher">
        ${VIEWS.map(
          (v) =>
            `<button class="view-tab ${state.view === v ? 'selected' : ''}" data-view="${v}">${v}</button>`
        ).join('')}
      </div>
    </div>`;
}