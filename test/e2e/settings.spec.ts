import { expect, test } from './fixtures';

test('settings page', async ({ page, extensionId }) => {
  await page.goto(`chrome-extension://${extensionId}/settings.html`);

  // FIXME: Better assertions

  const labels = await page.locator('label').all();
  expect(labels).toHaveLength(3);
  await expect(labels[0]).toHaveText('Theme');
  await expect(labels[1]).toHaveText('Sections');
  await expect(labels[2]).toHaveText('Reset');
});
