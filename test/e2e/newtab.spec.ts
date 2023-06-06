import { expect, test } from './fixtures';

test('newtab page', async ({ page, extensionId }) => {
  await page.goto(`chrome-extension://${extensionId}/newtab.html`);

  // FIXME: Better assertions

  const h2s = await page.locator('h2').all();
  expect(h2s).toHaveLength(5);
  await expect(h2s[0]).toHaveText('Open Tabs');
  await expect(h2s[1]).toHaveText('Bookmarks');
  await expect(h2s[2]).toHaveText('History');
  await expect(h2s[3]).toHaveText('Top Sites');
  await expect(h2s[4]).toHaveText('Recently Closed Tabs');
});
