/* eslint-disable no-console, unicorn/no-process-exit */

// XXX: To debug e2e set env var PWDEBUG=1 e.g., "PWDEBUG=1 pnpm run test:e2e"

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

// TODO: If we want to collect coverage during e2e testing, we might need
// something custom like https://github.com/bricss/dopant/blob/master/test/fixtures/index.mjs

import fs from 'node:fs';
import path from 'node:path';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import {
  cleanupPage,
  DIST_DIR,
  E2ETestContext,
  renderPage,
  setup,
  sleep,
  teardown,
} from './utils';

const fileTest = suite('file');
const test = suite<E2ETestContext>('e2e');

// FIXME: Use hooks normally once issue is fixed -- https://github.com/lukeed/uvu/issues/80
// test.before(setup);
// test.after(teardown);
// test.after.each(cleanupPage);
test.before(async (context) => {
  try {
    await setup(context);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
});
test.after(async (context) => {
  try {
    await teardown(context);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
});
test.after.each(async (context) => {
  try {
    await cleanupPage(context);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
});

[
  'icon128.png',
  'icon16.png',
  'icon48.png',
  'manifest.json',
  'newtab.css',
  'newtab.html',
  'newtab.js',
  'settings.css',
  'settings.html',
  'settings.js',
  'sw.js',
].forEach((filename) => {
  fileTest(`dist/${filename} exists`, () => {
    const filePath = path.join(DIST_DIR, filename);
    assert.ok(fs.statSync(filePath));
  });
});

test('renders newtab app', async (context) => {
  const { page } = await renderPage(
    context,
    // 'chrome-extension://cpcibnbdmpmcmnkhoiilpnlaepkepknb/newtab.html',
    `chrome-extension://${context.extensionId}/newtab.html`,
  );
  // TODO: Better assertions
  assert.ok(await page.$('#b'), 'has bookmarks bar');
  assert.ok(await page.$('#s'), 'has search input');
  assert.ok(await page.$('#m'), 'has menu wrapper');
  assert.ok(await page.$('#d'), 'has menu dropdown');
  await sleep(200);
  assert.is(context.unhandledErrors.length, 0, 'zero unhandled errors');
  assert.is(context.consoleMessages.length, 0, 'zero console messages');
});

test('renders settings app', async (context) => {
  const { page } = await renderPage(
    context,
    // 'chrome-extension://cpcibnbdmpmcmnkhoiilpnlaepkepknb/settings.html',
    `chrome-extension://${context.extensionId}/settings.html`,
  );
  // TODO: Better assertions
  assert.ok(await page.$('.row > select'));
  await sleep(200);
  assert.is(context.unhandledErrors.length, 0, 'zero unhandled errors');
  assert.is(context.consoleMessages.length, 0, 'zero console messages');
});

fileTest.run();
test.run();
