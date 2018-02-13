// XXX: Update manifest CSP hash after any changes to this file!

// capture errors (before error tracking script is ready)
const w = window;
const d = document;
const cb = (event) => { w.q.push(event); };
w.q = [];
w.l = w.addEventListener('error', cb);
w.u = w.addEventListener('unhandledrejection', cb);

chrome.storage.sync.get(['e', 't'], (settings) => {
  // load alternate theme
  if (settings.t !== 'd') {
    const link = d.createElement('link');
    link.rel = 'stylesheet';
    link.href = `${settings.t}.css`;
    d.head.appendChild(link);
  }

  // load error tracking unless opt-out
  if (!settings.e) {
    const script = d.createElement('script');
    script.src = 'e.js';
    d.head.appendChild(script);
  }
});
