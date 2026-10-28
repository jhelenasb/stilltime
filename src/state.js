export const state = {
  googleConnected: false,
  googleLoading: false,
  googleError: '',
  googleUser: null,
  view: 'Month',
  anchor: new Date(),
  theme: localStorage.getItem('stilltime-theme') || 'light',
  taskFilter: 'all',
  search: '',
  tasks: [],
  events: [],
  modal: null,
  contextMenu: null,
};

/** Optional: central place to re-render (wired in Step 2). */

let _render = () => {};

export function setRender(fn) {
  _render = fn;
}

export function render() {
  _render();
}