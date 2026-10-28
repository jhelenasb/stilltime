import './style.css';

import { state, setRender } from './state.js';
import { initGoogle, restoreSession } from './auth/google.js';
import { renderApp, getAppEl } from './ui/render.js';
import { bindListeners } from './events/listeners.js';
import { loadLocalTasks, loadLocalEvents } from './domain/storage.js';
function render() {
  renderApp();
}

setRender(render);
// Restore local-only items before first paint / Google sync
state.tasks = loadLocalTasks();
state.events = loadLocalEvents();

bindListeners(getAppEl());

async function boot() {
  render();
  try {
    await initGoogle();
  } catch (e) {
    console.error(e);
    state.googleError = 'Could not load Google services';
    render();
    return;
  }
  await restoreSession(); // merges Google + keeps locals (see auth merge)
  render();
}

boot();