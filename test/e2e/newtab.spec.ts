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

/** Whether the page is expected to request `url` as a `type` resource. */
function isExpected(origin: string, url: string, type: string): boolean {
  return (
    (type === "document" && url === `${origin}/newtab.html`)
    || (type === "stylesheet" && url === `${origin}/newtab.css`)
    || (type === "script" && url === `${origin}/newtab.js`)
    || (type === "image" && url.startsWith(`${origin}/_favicon?`))
  );
}

test.describe("newtab page", () => {
  test("has title and does not redirect", async ({ page, extensionId }) => {
    await page.goto(`chrome-extension://${extensionId}/newtab.html`);
    await expect(page).toHaveTitle("New Tab");
    await expect(page).toHaveURL(`chrome-extension://${extensionId}/newtab.html`); // didn't redirect
  });

  test("renders section headings in default order", async ({ page, extensionId }) => {
    await page.goto(`chrome-extension://${extensionId}/newtab.html`);
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
  });

  test("has only h2 headings, five of them", async ({ page, extensionId }) => {
    await page.goto(`chrome-extension://${extensionId}/newtab.html`);
    expect(await page.locator("h1").all()).toHaveLength(0);
    expect(await page.locator("h2").all()).toHaveLength(5);
    expect(await page.locator("h3").all()).toHaveLength(0);
  });

  test("renders bookmarks, search and menu", async ({ page, extensionId }) => {
    await page.goto(`chrome-extension://${extensionId}/newtab.html`);
    await expect(page.locator("#b")).toBeAttached(); // bookmarks
    await expect(page.locator("#s")).toBeAttached(); // search
    await expect(page.locator("#m")).toBeAttached(); // menu
    await expect(page.locator("#d")).toBeAttached(); // menu dropdown

    // TODO: Move these to their own test.
    // const menuDropdown = page.locator("#d");
    // await expect(menuDropdown).toBeAttached();
    // await expect(menuDropdown).not.toBeVisible();
  });

  // accepted tradeoff: visual regression
  test("matches screenshot", async ({ page, extensionId }) => {
    await page.goto(`chrome-extension://${extensionId}/newtab.html`);
    await expect(page).toHaveScreenshot("newtab-default.png");
  });

  test("has no console messages", async ({ page, extensionId }) => {
    await page.goto(`chrome-extension://${extensionId}/newtab.html`);
    await expect(page.locator("#b .f")).toBeAttached(); // last async render step finished
    expect(await page.consoleMessages()).toHaveLength(0);
  });

  test("has no unhandled errors", async ({ page, extensionId }) => {
    await page.goto(`chrome-extension://${extensionId}/newtab.html`);
    await expect(page.locator("#b .f")).toBeAttached(); // last async render step finished
    expect(await page.pageErrors()).toHaveLength(0);
  });

  test("has no external or unexpected requests", async ({ page, extensionId }) => {
    await page.goto(`chrome-extension://${extensionId}/newtab.html`, {
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
    expect(expected).toHaveLength(6);
    expect(expected.filter((req) => req.type === "image")).toHaveLength(3); // 3 favicons
  });
});
