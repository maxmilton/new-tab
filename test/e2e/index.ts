/* eslint-disable import/no-extraneous-dependencies */

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
  cleanup,
  distDir,
  E2ETestContext,
  render,
  setup,
  teardown,
} from './utils';

const test = suite<E2ETestContext>('test');

// FIXME: Use hooks normally once issue is fixed -- https://github.com/lukeed/uvu/issues/80
// test.before(setup);
// test.after(teardown);
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
test.after.each(cleanup);

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
  test(`dist/${filename} exists`, () => {
    const filePath = path.join(distDir, filename);
    assert.ok(fs.statSync(filePath));
  });
});

test('renders newtab app', async (context) => {
  const { page } = await render(
    context,
    'chrome-extension://cpcibnbdmpmcmnkhoiilpnlaepkepknb/newtab.html',
  );

  // await page.pause();

  // TODO: Better assertions
  assert.ok(await page.$('.bookmarks'));
  assert.ok(await page.$('#search'));
  assert.ok(await page.$('#menu'));
});

test('renders settings app', async (context) => {
  const { page } = await render(
    context,
    'chrome-extension://cpcibnbdmpmcmnkhoiilpnlaepkepknb/settings.html',
  );

  // await page.pause();

  // TODO: Better assertions
  assert.ok(await page.$('.row > select'));
});

test.run();
