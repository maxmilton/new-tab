import { expect, test } from './fixtures';

test('settings page', async ({ page, extensionId }) => {
  await page.goto(`chrome-extension://${extensionId}/settings.html`);

  // FIXME: Better assertions

  await expect(page).toHaveTitle('New Tab');
  await expect(page).toHaveURL(`chrome-extension://${extensionId}/settings.html`); // didn't redirect

  const labels = await page.locator('label').all();
  expect(labels).toHaveLength(3);
  await expect(labels[0]).toHaveText('Theme');
  await expect(labels[1]).toHaveText('Sections');
  await expect(labels[2]).toHaveText('Reset');
});

test('matches screenshot', async ({ page, extensionId }) => {
  await page.goto(`chrome-extension://${extensionId}/settings.html`);
  await expect(page).toHaveScreenshot('settings-default.png', { fullPage: true });
});

// TODO: Test it makes no external requests
