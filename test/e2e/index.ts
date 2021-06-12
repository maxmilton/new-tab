/* eslint-disable no-console */

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

import fs from 'fs';
import path from 'path';
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
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
});
test.after(async (context) => {
  try {
    await teardown(context);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
});
test.after.each(async (context) => {
  try {
    await cleanupPage(context);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
});

[
  'icon16.png',
  'icon48.png',
  'icon128.png',
  'manifest.json',
  'newtab.js',
  'newtab.html',
  'settings.js',
  'settings.html',
].forEach((filename) => {
  fileTest(`dist/${filename} exists`, () => {
    const filePath = path.join(DIST_DIR, filename);
    assert.ok(fs.statSync(filePath));
  });
});

test('renders newtab app', async (context) => {
  const { page } = await renderPage(
    context,
    'chrome-extension://cpcibnbdmpmcmnkhoiilpnlaepkepknb/newtab.html',
  );
  // TODO: Better assertions
  assert.ok(await page.$('.bookmarks'));
  assert.ok(await page.$('#search'));
  assert.ok(await page.$('#menu'));
  await sleep(200);
  assert.is(context.unhandledErrors.length, 0, 'zero unhandled errors');
  assert.is(context.consoleMessages.length, 0, 'zero console messages');
});

test('renders settings app', async (context) => {
  const { page } = await renderPage(
    context,
    'chrome-extension://cpcibnbdmpmcmnkhoiilpnlaepkepknb/settings.html',
  );
  // TODO: Better assertions
  assert.ok(await page.$('.row > select'));
  await sleep(200);
  assert.is(context.unhandledErrors.length, 0, 'zero unhandled errors');
  assert.is(context.consoleMessages.length, 0, 'zero console messages');
});

fileTest.run();
test.run();
