import { expect, test } from './fixtures.ts';

test('has a single background service worker (sw.js)', ({ context, extensionId }) => {
  const workers = context.serviceWorkers();
  expect(workers).toHaveLength(1);
  expect(workers[0]?.url()).toBe(`chrome-extension://${extensionId}/sw.js`);
});

// TODO: Check there are no console messages or unhandled errors in the worker.
