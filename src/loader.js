/* eslint-disable import/unambiguous */

// XXX: Update manifest CSP hash after any changes to this file!

// capture errors (before error tracking script is ready)
window.q = [];
const cb = (event) => { window.q.push(event); };
window.l = window.addEventListener('error', cb);
window.u = window.addEventListener('unhandledrejection', cb);

chrome.storage.sync.get(['e', 't'], (settings) => {
  // load alternate theme
  if (settings.t !== 'd') {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `${settings.t}.css`;
    document.head.appendChild(link);
  }

  // load error tracking unless opt-out
  if (!settings.e) {
    const script = document.createElement('script');
    script.src = 'e.js';
    document.head.appendChild(script);
  }
});
