const Raven = require('raven-js'); // XXX: Has test coverage issues when using import

// clean up listeners for error capture before Sentry is loaded
window.removeEventListener('error', window.l);
window.removeEventListener('unhandledrejection', window.u);

Raven
  .config('https://fa953eecae7143afb7db0e926a6453de@sentry.io/282621', {
    release: chrome.runtime.getManifest().version_name,
  })
  .install();

window.addEventListener('unhandledrejection', (event) => {
  Raven.captureException(event.reason);
});

// report any error queued before Sentry tracker was loaded
window.q.forEach((event) => {
  Raven.captureException(event.reason || event, {
    extra: {
      event,
    },
  });
});
