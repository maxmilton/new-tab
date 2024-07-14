import type { ConsoleMessage } from '@playwright/test';
import { expect, test } from './fixtures';

test('settings page', async ({ page, extensionId }) => {
  await page.goto(`chrome-extension://${extensionId}/settings.html`);

  // FIXME: Better assertions

  await expect(page).toHaveTitle('New Tab');
  await expect(page).toHaveURL(`chrome-extension://${extensionId}/settings.html`); // didn't redirect

  const labels = await page.locator('label').all();
  expect(labels).toHaveLength(4);
  await expect(labels[0]).toHaveText('Theme');
  await expect(labels[1]).toHaveText('Show bookmarks bar');
  await expect(labels[2]).toHaveText('Sections');
  await expect(labels[3]).toHaveText('Reset');
});

test.use({ bypassCSP: true });

test('matches screenshot', async ({ page, extensionId }) => {
  await page.goto(`chrome-extension://${extensionId}/settings.html`);
  await expect(page).toHaveScreenshot('settings-default.png');
});

test.use({ bypassCSP: false });

test('has no console calls or unhandled errors', async ({ page, extensionId }) => {
  const unhandledErrors: Error[] = [];
  const consoleMessages: ConsoleMessage[] = [];
  page.on('pageerror', (err) => unhandledErrors.push(err));
  page.on('console', (msg) => consoleMessages.push(msg));
  await page.goto(`chrome-extension://${extensionId}/settings.html`);
  expect(unhandledErrors).toHaveLength(0);
  expect(consoleMessages).toHaveLength(0);
});

// TODO: Test it makes no external requests (other than fetch themes)
