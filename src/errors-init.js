// XXX: Update manifest CSP hash after any changes to this file!

// capture errors (before error tracking script is ready)
window.q = [];
const cb = (event) => { window.q.push(event); };
window.l = window.addEventListener('error', cb);
window.u = window.addEventListener('unhandledrejection', cb);
