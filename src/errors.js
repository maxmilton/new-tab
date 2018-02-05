/* global Raven */

const win = window;

win.removeEventListener('error', win.l);
win.removeEventListener('unhandledrejection', win.u);

Raven
  .config('https://fa953eecae7143afb7db0e926a6453de@sentry.io/282621', {
    release: chrome.runtime.getManifest().version_name,
  })
  .install();

win.addEventListener('unhandledrejection', (event) => {
  Raven.captureException(event.reason);
});

win.q.forEach((event) => {
  Raven.captureException(event.reason);
});
