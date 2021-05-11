import fs from 'fs';
import os from 'os';
import path from 'path';
import { BrowserContext, chromium, Page } from 'playwright-chromium';

export interface E2ETestContext {
  tmpDir: string;
  browser: BrowserContext;
  pages: Set<{ page: Page }>;
}

export const distDir = path.join(__dirname, '../../dist');

export async function setup(context: E2ETestContext): Promise<void> {
  if (context.browser) {
    throw new Error(
      'browser instance already exists, did you forget to call teardown()?',
    );
  }

  // if no dist files the browser will hang so fail early
  fs.statSync(distDir);

  context.tmpDir = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), 'newtab-test-'),
  );
  context.browser = await chromium.launchPersistentContext(context.tmpDir, {
    // headless mode doesn't support extensions
    headless: false,
    args: [
      `--disable-extensions-except=${distDir}`,
      `--load-extension=${distDir}`,
    ],
    timeout: 10000,
  });

  context.pages = new Set<{ page: Page }>();
}

export async function teardown(context: E2ETestContext): Promise<void> {
  if (!context.browser) {
    throw new Error(
      'browser instance does not exist, did you forget to call setup()?',
    );
  }

  await context.browser.close();
  await fs.promises.rm(context.tmpDir, {
    force: true,
    recursive: true,
  });
}

interface RenderResult {
  page: Page;
}

export async function render(
  context: E2ETestContext,
  url: string,
): Promise<RenderResult> {
  const page = await context.browser.newPage();
  await page.goto(url);

  context.pages.add({ page });

  return { page };
}

export async function cleanup(context: E2ETestContext): Promise<void> {
  for (const { page } of context.pages) {
    // eslint-disable-next-line no-await-in-loop
    await page.close();
  }
}
