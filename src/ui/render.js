import { state } from '../state.js';
import { renderLogin } from './login.js';
import { renderHeader } from './header.js';
import { renderTaskPanel } from './taskPanel.js';
import { renderCalendar } from './calendar/index.js';
import { renderModal, renderContextMenu } from './modal.js';

const app = document.querySelector('#app');

export function renderApp() {
  document.documentElement.dataset.theme = state.theme;

  if (!state.googleConnected) {
    app.innerHTML = renderLogin();
    return;
  }

  app.innerHTML = `
    <div class="app-shell no-sidebar">
      <main class="main-area">
        ${renderHeader()}
        <div class="calendar-content">
          <div class="calendar-note"><span class="note-dot"></span>Showing ${state.view.toLowerCase()} · data from Google</div>
          ${renderCalendar()}
        </div>
        <footer class="workspace-footer"><span>✳</span> One thing at a time.</footer>
      </main>
      ${renderTaskPanel()}
      ${renderModal()}
      ${renderContextMenu()}
      <div class="toast" id="toast" aria-live="polite"></div>
    </div>`;
}

export function getAppEl() {
  return app;
}