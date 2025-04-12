// https://playwright.dev/docs/chrome-extensions

/* eslint-disable unicorn/prefer-module */
/* oxlint-disable no-empty-pattern */

import path from 'node:path';
import { type BrowserContext, test as baseTest, chromium } from '@playwright/test';

export const test = baseTest.extend<{
  context: BrowserContext;
  extensionId: string;
}>({
  // biome-ignore lint/correctness/noEmptyPattern: empty initial context
  async context({}, use) {
    const extensionPath = path.join(__dirname, '../../dist');
    const context = await chromium.launchPersistentContext('', {
      channel: 'chromium', // enables headless mode with extensions
      args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`],
      acceptDownloads: false,
      strictSelectors: true,
      offline: true, // the extension must work 100% offline
    });
    await use(context);
    await context.close();
  },
  async extensionId({ context }, use) {
    let [sw] = context.serviceWorkers();
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    sw ??= await context.waitForEvent('serviceworker', { timeout: 200 });

    const extensionId = sw.url().split('/')[2];
    await use(extensionId);
  },
});

export const { describe, expect } = test;
