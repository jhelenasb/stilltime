import {
  GOOGLE_CLIENT_ID,
  GOOGLE_SCOPES,
  TOKEN_KEY,
  USER_KEY,
} from '../config.js';
import { state, render } from '../state.js';
import { fetchCalendarEvents } from '../api/googleCalendar.js';
import { fetchAllTasks } from '../api/googleTasks.js';
import { loadLocalTasks, loadLocalEvents, persistLocals } from '../domain/storage.js';

let googleTokenClient = null;
let accessToken = null;

function loadGoogleScript() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
    document.head.appendChild(script);
  });
}

function saveToken(tokenResponse) {
  const expiresAt =
    Date.now() + Number(tokenResponse.expires_in || 3600) * 1000 - 60_000;
  const payload = {
    access_token: tokenResponse.access_token,
    expires_in: tokenResponse.expires_in,
    expires_at: expiresAt,
    scope: tokenResponse.scope,
    token_type: tokenResponse.token_type || 'Bearer',
  };
  localStorage.setItem(TOKEN_KEY, JSON.stringify(payload));
  accessToken = payload.access_token;
}

function loadSavedToken() {
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function isTokenValid(saved) {
  return Boolean(saved?.access_token && saved.expires_at && Date.now() < saved.expires_at);
}

export function clearSession() {
  accessToken = null;
  state.googleConnected = false;
  state.googleUser = null;
  state.tasks = [];
  state.events = [];
  state.googleError = '';
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getAccessToken() {
  return accessToken;
}

function isLocalItem(item) {
  if (!item) return false;
  if (item.fromGoogle === true) return false;
  if (item.fromGoogle === false) return true;
  const id = String(item.id);
  return id.startsWith('local-') || /^e\d+$/.test(id);
}

async function syncGoogleData(token) {
  try {
    const [events, tasks] = await Promise.all([
      fetchCalendarEvents(token),
      fetchAllTasks(token),
    ]);

    const localEvents = [
      ...state.events.filter(isLocalItem),
      ...loadLocalEvents(),
    ];
    const localTasks = [
      ...state.tasks.filter(isLocalItem),
      ...loadLocalTasks(),
    ];

    const byId = (items) => {
      const map = new Map();
      items.forEach((i) => map.set(String(i.id), i));
      return [...map.values()];
    };

    const eventIds = new Set(events.map((e) => String(e.id)));
    const taskIds = new Set(tasks.map((t) => String(t.id)));

    state.events = [
      ...events,
      ...byId(localEvents).filter((e) => !eventIds.has(String(e.id))),
    ];
    state.tasks = [
      ...tasks,
      ...byId(localTasks).filter((t) => !taskIds.has(String(t.id))),
    ];

    persistLocals(state);
  } catch (err) {
    console.error(err);
    state.googleError = state.googleError || 'Could not sync Google data';
  }
}

function handleTokenResponse(tokenResponse) {
  state.googleLoading = false;

  if (tokenResponse.error || !tokenResponse.access_token) {
    state.googleError = tokenResponse.error || 'No access token';
    clearSession();
    render();
    return;
  }

  saveToken(tokenResponse);
  state.googleConnected = true;
  state.googleError = '';

  fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
    .then((r) => (r.ok ? r.json() : null))
    .then((profile) => {
      if (profile) {
        state.googleUser = {
          name: profile.name,
          email: profile.email,
          picture: profile.picture,
        };
        localStorage.setItem(USER_KEY, JSON.stringify(state.googleUser));
      }
      return syncGoogleData(accessToken);
    })
    .then(() => {
      render();
    })
    .catch(() => {
      syncGoogleData(accessToken).finally(() => render());
    });
}

export async function initGoogle() {
  if (!GOOGLE_CLIENT_ID) {
    console.warn('VITE_GOOGLE_CLIENT_ID is missing');
    return;
  }
  await loadGoogleScript();
  googleTokenClient = google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: GOOGLE_SCOPES,
    callback: handleTokenResponse,
    error_callback: (err) => {
      state.googleLoading = false;
      state.googleError = err?.type || 'Auth error';
      render();
    },
  });
}

export function connectGoogle() {
  if (!GOOGLE_CLIENT_ID) {
    state.googleError = 'Missing VITE_GOOGLE_CLIENT_ID in .env';
    render();
    return;
  }
  if (!googleTokenClient) {
    state.googleLoading = true;
    render();
    initGoogle().then(() => {
      googleTokenClient?.requestAccessToken({ prompt: 'consent' });
    });
    return;
  }
  state.googleLoading = true;
  state.googleError = '';
  render();
  googleTokenClient.requestAccessToken({ prompt: 'consent' });
}

export function disconnectGoogle() {
  const saved = loadSavedToken();
  if (saved?.access_token && window.google?.accounts?.oauth2) {
    google.accounts.oauth2.revoke(saved.access_token, () => {});
  }
  clearSession();
  render();
}

function requestSilentToken() {
  return new Promise((resolve) => {
    if (!googleTokenClient) {
      resolve(false);
      return;
    }
    const previous = googleTokenClient.callback;
    googleTokenClient.callback = (resp) => {
      googleTokenClient.callback = previous;
      if (resp?.access_token && !resp.error) {
        handleTokenResponse(resp);
        resolve(true);
      } else {
        resolve(false);
      }
    };
    googleTokenClient.requestAccessToken({ prompt: '' });
  });
}

export async function restoreSession() {
  const saved = loadSavedToken();
  const savedUser = localStorage.getItem(USER_KEY);
  if (savedUser) {
    try {
      state.googleUser = JSON.parse(savedUser);
    } catch (_) {}
  }

  if (isTokenValid(saved)) {
    accessToken = saved.access_token;
    state.googleConnected = true;
    state.googleLoading = true;
    render();
    try {
      await syncGoogleData(accessToken);
      state.googleLoading = false;
      return true;
    } catch (err) {
      console.warn('Saved token API failed', err);
    }
  }

  if (googleTokenClient) {
    state.googleLoading = true;
    render();
    const ok = await requestSilentToken();
    state.googleLoading = false;
    if (ok) return true;
  }

  clearSession();
  return false;
}