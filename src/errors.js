import * as Sentry from '@sentry/browser';

// clean up listeners for error capture before Sentry was loaded
window.removeEventListener('error', window.p);
window.removeEventListener('unhandledrejection', window.p);

Sentry.init({
  dsn: 'https://fa953eecae7143afb7db0e926a6453de@sentry.io/282621',
  release: chrome.runtime.getManifest().version_name,
});

window.addEventListener('unhandledrejection', (event) => {
  Sentry.captureException(event.reason);
});

// report any errors queued before Sentry tracker was loaded
window.q.forEach((event) => {
  Sentry.captureException(event.reason || event, {
    extra: { event },
  });
});
