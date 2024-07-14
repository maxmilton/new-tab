import type { ConsoleMessage } from '@playwright/test';
import { expect, test } from './fixtures';

// TODO: Write tests to verify:
//  - No console logs/errors -- including/especially CSP violations
//  - Theme loader works
//  - Custom order of sections (default, reorder, remove one, remove all)
//  - Bookmarks load correctly
//  - Open tabs is correctly populated
//  - Open tabs events produce expected results
//  - Top sites is populated
//  - Search works
//  - Open extension settings link works
//  - Clicking on a link works:
//    - bookmark
//    - bookmark to chrome internal page
//    - open tab
//    - open tab to chrome internal page)
//  - Every use of the "chrome" API
//  - No external requests

test('newtab page', async ({ page, extensionId }) => {
  await page.goto(`chrome-extension://${extensionId}/newtab.html`);

  await expect(page).toHaveTitle('New Tab');
  await expect(page).toHaveURL(`chrome-extension://${extensionId}/newtab.html`); // didn't redirect

  const h2s = await page.locator('h2').all();
  await expect(h2s[0]).toHaveText('Open Tabs');
  await expect(h2s[1]).toHaveText('Bookmarks');
  await expect(h2s[2]).toHaveText('History');
  await expect(h2s[3]).toHaveText('Top Sites');
  await expect(h2s[4]).toHaveText('Recently Closed Tabs');
  await expect(h2s[0]).toBeAttached();
  await expect(h2s[1]).toBeAttached();
  await expect(h2s[2]).toBeAttached();
  await expect(h2s[3]).toBeAttached();
  await expect(h2s[4]).toBeAttached();
  expect(h2s).toHaveLength(5);

  await expect(page.locator('#b')).toBeAttached(); // bookmarks
  await expect(page.locator('#s')).toBeAttached(); // search
  await expect(page.locator('#m')).toBeAttached(); // menu
  await expect(page.locator('#d')).toBeAttached(); // menu dropdown

  // TODO: Move these to their own test.
  // const menuDropdown = page.locator('#d');
  // await expect(menuDropdown).toBeAttached();
  // await expect(menuDropdown).not.toBeVisible();

  // TODO: More and better assertions.
});

test.use({ bypassCSP: true });

test('matches screenshot', async ({ page, extensionId }) => {
  // page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
  // page.on('pageerror', (err) => console.error('PAGE ERROR:', err));
  // page.on('crash', (err) => console.error('CRASH:', err));
  // page.on('request', (req) => console.log('REQUEST:', req.url()));
  // page.on('response', (res) => console.log('RESPONSE:', res.url()));
  // page.on('requestfailed', (req) => console.log('REQUEST FAILED:', req.url()));

  // await page.addInitScript(() => {
  //   // const style = document.createElement('style');
  //   // style.textContent = "html, body { font-family: 'Noto Sans', Arial, sans-serif !important; }";
  //   // document.head.appendChild(style);

  //   const sheet = new CSSStyleSheet();
  //   sheet.replaceSync("html, body { font-family: 'Noto Sans', Arial, sans-serif !important; }");
  //   document.adoptedStyleSheets = [sheet];
  // });

  await page.goto(`chrome-extension://${extensionId}/newtab.html`);
  await expect(page).toHaveScreenshot('newtab-default.png');
});

test.use({ bypassCSP: false });

test('has no console calls or unhandled errors', async ({ page, extensionId }) => {
  const unhandledErrors: Error[] = [];
  const consoleMessages: ConsoleMessage[] = [];
  page.on('pageerror', (err) => unhandledErrors.push(err));
  page.on('console', (msg) => consoleMessages.push(msg));
  await page.goto(`chrome-extension://${extensionId}/newtab.html`);
  expect(unhandledErrors).toHaveLength(0);
  expect(consoleMessages).toHaveLength(0);
});
