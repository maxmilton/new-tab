// capture errors (before error tracking script is ready)
window.q = [];
window.p = (event) => { q.push(event); };
window.addEventListener('error', p);
window.addEventListener('unhandledrejection', p);
