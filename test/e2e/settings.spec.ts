import { expect, test } from "./fixtures.ts";

/** Whether the page is expected to request `url` as a `type` resource. */
function isExpected(origin: string, url: string, type: string): boolean {
  return (
    (type === "document" && url === `${origin}/settings.html`)
    || (type === "stylesheet" && url === `${origin}/settings.css`)
    || (type === "script" && url === `${origin}/settings.js`)
    || (type === "fetch" && url === `${origin}/themes.json`)
  );
}

test.describe("settings page", () => {
  test("has title and does not redirect", async ({ page, extensionId }) => {
    await page.goto(`chrome-extension://${extensionId}/settings.html`);
    await expect(page).toHaveTitle("New Tab");
    await expect(page).toHaveURL(`chrome-extension://${extensionId}/settings.html`); // didn't redirect
  });

  test("renders headings", async ({ page, extensionId }) => {
    await page.goto(`chrome-extension://${extensionId}/settings.html`);
    expect(await page.locator("h1").all()).toHaveLength(0);
    const h2 = await page.locator("h2").all();
    await expect(h2[0]).toHaveText("Experimental");
    await expect(h2[0]).toBeAttached();
    expect(h2).toHaveLength(1);
    const h3 = await page.locator("h3").all();
    await expect(h3[0]).toHaveText("Sync Settings");
    await expect(h3[0]).toBeAttached();
    expect(h3).toHaveLength(1);
  });

  test("renders setting labels in order", async ({ page, extensionId }) => {
    await page.goto(`chrome-extension://${extensionId}/settings.html`);
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

  // accepted tradeoff: visual regression
  test("matches screenshot", async ({ page, extensionId }) => {
    await page.goto(`chrome-extension://${extensionId}/settings.html`);
    await expect(page).toHaveScreenshot("settings-default.png");
  });

  test("has no console messages", async ({ page, extensionId }) => {
    const themes = page.waitForResponse(`chrome-extension://${extensionId}/themes.json`);
    await page.goto(`chrome-extension://${extensionId}/settings.html`);
    await themes; // last async load step finished
    expect(await page.consoleMessages()).toHaveLength(0);
  });

  test("has no unhandled errors", async ({ page, extensionId }) => {
    const themes = page.waitForResponse(`chrome-extension://${extensionId}/themes.json`);
    await page.goto(`chrome-extension://${extensionId}/settings.html`);
    await themes; // last async load step finished
    expect(await page.pageErrors()).toHaveLength(0);
  });

  test("makes no external or unexpected requests", async ({ page, extensionId }) => {
    await page.goto(`chrome-extension://${extensionId}/settings.html`, {
      waitUntil: "networkidle",
    });
    const rawRequests = await page.requests();
    const requests = rawRequests.map((req) => ({
      url: req.url(),
      type: req.resourceType(),
    }));
    const expected = requests.filter((req) =>
      isExpected(`chrome-extension://${extensionId}`, req.url, req.type),
    );
    const unexpected = requests.filter(
      (req) => !isExpected(`chrome-extension://${extensionId}`, req.url, req.type),
    );

    expect(unexpected).toEqual([]); // guard: lists the offending requests
    expect(unexpected).toHaveLength(0);
    expect(expected).toHaveLength(4);
  });
});
