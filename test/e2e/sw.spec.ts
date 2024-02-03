import { expect, test } from './fixtures';

test('background service worker', async ({ context }) => {
  let [background] = context.serviceWorkers();
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  background ??= await context.waitForEvent('serviceworker');

  // FIXME: Better assertions

  expect(background).toBeTruthy();
});
