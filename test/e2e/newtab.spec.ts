// oxlint-disable no-conditional-in-test

import { expect, test } from "./fixtures.ts";

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

test("newtab page", async ({ page, extensionId }) => {
  await page.goto(`chrome-extension://${extensionId}/newtab.html`);

  await expect(page).toHaveTitle("New Tab");
  await expect(page).toHaveURL(`chrome-extension://${extensionId}/newtab.html`); // didn't redirect

  const h1 = await page.locator("h1").all();
  expect(h1).toHaveLength(0);

  const h2 = await page.locator("h2").all();
  await expect(h2[0]).toHaveText("Open Tabs");
  await expect(h2[1]).toHaveText("Bookmarks");
  await expect(h2[2]).toHaveText("History");
  await expect(h2[3]).toHaveText("Top Sites");
  await expect(h2[4]).toHaveText("Recently Closed Tabs");
  await expect(h2[0]).toBeAttached();
  await expect(h2[1]).toBeAttached();
  await expect(h2[2]).toBeAttached();
  await expect(h2[3]).toBeAttached();
  await expect(h2[4]).toBeAttached();
  expect(h2).toHaveLength(5);

  const h3 = await page.locator("h3").all();
  expect(h3).toHaveLength(0);

  await expect(page.locator("#b")).toBeAttached(); // bookmarks
  await expect(page.locator("#s")).toBeAttached(); // search
  await expect(page.locator("#m")).toBeAttached(); // menu
  await expect(page.locator("#d")).toBeAttached(); // menu dropdown

  // TODO: Move these to their own test.
  // const menuDropdown = page.locator("#d");
  // await expect(menuDropdown).toBeAttached();
  // await expect(menuDropdown).not.toBeVisible();

  // TODO: More and better assertions.
});

test("matches screenshot", async ({ page, extensionId }) => {
  await page.goto(`chrome-extension://${extensionId}/newtab.html`);
  await expect(page).toHaveScreenshot("newtab-default.png");
});

test("has no console messages or unhandled errors", async ({ page, extensionId }) => {
  await page.goto(`chrome-extension://${extensionId}/newtab.html`);
  expect(await page.consoleMessages()).toHaveLength(0);
  expect(await page.pageErrors()).toHaveLength(0);
});

test("has no external or unexpected requests", async ({ page, extensionId }) => {
  await page.goto(`chrome-extension://${extensionId}/newtab.html`, {
    waitUntil: "networkidle",
  });
  const requests = await page.requests();
  const expected = [];
  const unexpected = [];

  for (const request of requests) {
    const url = request.url();
    const type = request.resourceType();
    if (
      (url === `chrome-extension://${extensionId}/newtab.html` && type === "document")
      || (url === `chrome-extension://${extensionId}/newtab.css` && type === "stylesheet")
      || (url === `chrome-extension://${extensionId}/newtab.js` && type === "script")
      || (url.startsWith(`chrome-extension://${extensionId}/_favicon?`) && type === "image")
    ) {
      expected.push({ url, type });
    } else {
      unexpected.push({ url, type });
    }
  }

  expect(unexpected).toHaveLength(0);
  expect(expected).toHaveLength(6);
  expect(expected.filter((req) => req.type === "image")).toHaveLength(3); // 3 favicons
});
