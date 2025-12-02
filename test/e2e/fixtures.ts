// https://playwright.dev/docs/chrome-extensions

/* oxlint-disable no-empty-pattern */

import path from "node:path";
import { type BrowserContext, test as base, chromium } from "@playwright/test";

export const test = base.extend<{ context: BrowserContext; extensionId: string }>({
  // biome-ignore lint/correctness/noEmptyPattern: playwright setup
  async context({}, use) {
    const dist = path.join(import.meta.dirname, "../../dist");
    const context = await chromium.launchPersistentContext("", {
      channel: "chromium",
      args: [`--disable-extensions-except=${dist}`, `--load-extension=${dist}`],
    });
    await use(context);
    await context.close();
  },
  async extensionId({ context }, use) {
    let [sw] = context.serviceWorkers();
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    sw ??= await context.waitForEvent("serviceworker", { timeout: 200 });

    // oxlint-disable-next-line prefer-destructuring
    const extensionId = sw.url().split("/")[2];
    await use(extensionId);
  },
});

export const { describe, expect } = test;
