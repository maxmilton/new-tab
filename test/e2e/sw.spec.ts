import { expect, test } from './fixtures';

test('background service worker', async ({ context }) => {
  let [background] = context.serviceWorkers();
  if (!background) background = await context.waitForEvent('serviceworker');

  // FIXME: Better assertions

  expect(background).toBeTruthy();
});
