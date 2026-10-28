import { state } from '../state.js';
import { escapeHTML, icon } from '../utils/dom.js';

export function renderLogin() {
  return `
    <div class="login-screen">
      <div class="login-card">
        <div class="login-brand">
          <div class="brand-mark login-mark"><span></span><span></span><span></span><span></span></div>
          <div class="login-name">stilltime<span class="brand-period">.</span></div>
          <p class="login-tagline">Make room for life</p>
        </div>
        <div class="login-copy">
          <h1>Your calm space for plans & priorities</h1>
          <p>Connect your Google account to sync Calendar and Tasks. Private and under your control.</p>
        </div>
        <button class="login-google-btn" data-action="connect-google" ${state.googleLoading ? 'disabled' : ''}>
          <span class="google-icon">${icon('google', 20)}</span>
          <span>${state.googleLoading ? 'Connecting…' : 'Continue with Google'}</span>
        </button>
        ${state.googleError ? `<p class="login-error">${escapeHTML(state.googleError)}</p>` : ''}
        <p class="login-footnote">We only request Calendar and Tasks access.<br>You can disconnect anytime.</p>
      </div>
    </div>`;
}