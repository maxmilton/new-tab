// XXX: Update manifest CSP hash after any changes to this file!

// capture errors (before error tracking script is ready)
const win = window;
const cb = (event) => { win.q.push(event); };
win.q = [];
win.l = win.addEventListener('error', cb);
win.u = win.addEventListener('unhandledrejection', cb);

// load error tracking unless opt-out
chrome.storage.local.get('e', (state) => {
  if (!state.e) {
    const doc = document;
    const script = doc.createElement('script');
    script.src = 'err.js';
    doc.head.appendChild(script);
  }
});
