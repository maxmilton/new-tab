/* eslint-disable no-console, no-multi-assign */

import colors from 'kleur';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  chromium,
  type BrowserContext,
  type ConsoleMessage,
  type Page,
  type Worker,
} from 'playwright-chromium';

export interface E2ETestContext {
  tmpDir: string;
  browser: BrowserContext;
  background: Worker;
  pages: Set<Page>;
  extensionId: string;
  consoleMessages: ConsoleMessage[];
  unhandledErrors: Error[];
}

interface RenderResult {
  page: Page;
}

// increase limit from 10
global.Error.stackTraceLimit = 100;

export const DIST_DIR = path.join(__dirname, '../../dist');

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function setup(context: E2ETestContext): Promise<void> {
  if (context.browser) {
    throw new Error(
      'Browser instance already exists, did you forget to call teardown()?',
    );
  }

  // if no dist files the browser will hang so fail early
  fs.statSync(DIST_DIR);

  context.tmpDir = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), 'newtab-test-'),
  );
  context.browser = await chromium.launchPersistentContext(context.tmpDir, {
    // headless mode doesn't support extensions
    headless: false,
    args: [
      `--disable-extensions-except=${DIST_DIR}`,
      `--load-extension=${DIST_DIR}`,
    ],
    timeout: 10_000,
  });

  let [background] = context.browser.serviceWorkers();
  if (!background) {
    background = await context.browser.waitForEvent('serviceworker');
  }
  context.background = background;
  // eslint-disable-next-line prefer-destructuring
  context.extensionId = background.url().split('/')[2];

  context.pages = new Set<Page>();
}

export async function teardown(context: E2ETestContext): Promise<void> {
  if (!context.browser) {
    throw new Error(
      'Browser instance does not exist, did you forget to call setup()?',
    );
  }

  await context.browser.close();
  await fs.promises.rm(context.tmpDir, {
    force: true,
    recursive: true,
  });
}

export async function renderPage(
  context: E2ETestContext,
  url: string,
): Promise<RenderResult> {
  if (!context.browser) {
    throw new Error(
      'Browser instance does not exist, did you forget to call setup()?',
    );
  }

  const page = await context.browser.newPage();
  context.pages.add(page);
  context.unhandledErrors = [];
  context.consoleMessages = [];
  page.on('crash', (crashedPage) => {
    throw new Error(`Page crashed: ${crashedPage.url()}`);
  });
  page.on('pageerror', (err) => {
    console.error(colors.red('Page Error:'), err);
    context.unhandledErrors.push(err);
  });
  page.on('console', (msg) => {
    const loc = msg.location();
    console.log(
      colors.dim(
        `${loc.url}:${loc.lineNumber}:${loc.columnNumber} [${msg.type()}]`,
      ),
      msg.text(),
    );
    context.consoleMessages.push(msg);
  });
  await page.goto(url);
  return { page };
}

export async function cleanupPage(context: E2ETestContext): Promise<void> {
  if (!context.pages || context.pages.size === 0) {
    throw new Error('No pages exist, did you forget to call renderPage()?');
  }

  for (const page of context.pages) {
    // eslint-disable-next-line no-await-in-loop
    await page.close();
  }
  // @ts-expect-error - reset for next renderPage
  context.unhandledErrors = context.consoleMessages = undefined;
}
