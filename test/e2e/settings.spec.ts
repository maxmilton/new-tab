// oxlint-disable no-conditional-in-test

import { expect, test } from "./fixtures.ts";

test("settings page", async ({ page, extensionId }) => {
  await page.goto(`chrome-extension://${extensionId}/settings.html`);

  await expect(page).toHaveTitle("New Tab");
  await expect(page).toHaveURL(`chrome-extension://${extensionId}/settings.html`); // didn't redirect

  const h1 = await page.locator("h1").all();
  expect(h1).toHaveLength(0);

  const h2 = await page.locator("h2").all();
  await expect(h2[0]).toHaveText("Experimental");
  await expect(h2[0]).toBeAttached();
  expect(h2).toHaveLength(1);

  const h3 = await page.locator("h3").all();
  await expect(h3[0]).toHaveText("Sync Settings");
  await expect(h3[0]).toBeAttached();
  expect(h3).toHaveLength(1);

  const labels = await page.locator("label").all();
  await expect(labels[0]).toHaveText("Theme");
  await expect(labels[1]).toHaveText("Show bookmarks bar");
  await expect(labels[2]).toHaveText("Sections");
  await expect(labels[3]).toHaveText("Reset");
  await expect(labels[4]).toHaveText("Automatically sync settings");
  await expect(labels[0]).toBeAttached();
  await expect(labels[1]).toBeAttached();
  await expect(labels[2]).toBeAttached();
  await expect(labels[3]).toBeAttached();
  await expect(labels[4]).toBeAttached();
  expect(labels).toHaveLength(5);
});

test("matches screenshot", async ({ page, extensionId }) => {
  await page.goto(`chrome-extension://${extensionId}/settings.html`);
  await expect(page).toHaveScreenshot("settings-default.png");
});

test("has no console messages or unhandled errors", async ({ page, extensionId }) => {
  await page.goto(`chrome-extension://${extensionId}/settings.html`);
  expect(await page.consoleMessages()).toHaveLength(0);
  expect(await page.pageErrors()).toHaveLength(0);
});

test("makes no external or unexpected requests", async ({ page, extensionId }) => {
  await page.goto(`chrome-extension://${extensionId}/settings.html`, {
    waitUntil: "networkidle",
  });
  const requests = await page.requests();
  const expected = [];
  const unexpected = [];

  for (const request of requests) {
    const url = request.url();
    const type = request.resourceType();
    if (
      (url === `chrome-extension://${extensionId}/settings.html` && type === "document")
      || (url === `chrome-extension://${extensionId}/settings.css` && type === "stylesheet")
      || (url === `chrome-extension://${extensionId}/settings.js` && type === "script")
      || (url === `chrome-extension://${extensionId}/themes.json` && type === "fetch")
    ) {
      expected.push({ url, type });
    } else {
      unexpected.push({ url, type });
    }
  }

  expect(unexpected).toHaveLength(0);
  expect(expected).toHaveLength(4);
});
