/* global q */

// capture errors (before error tracking script is ready)
window.q = [];
const cb = (event) => { q.push(event); };
window.l = window.addEventListener('error', cb);
window.u = window.addEventListener('unhandledrejection', cb);
