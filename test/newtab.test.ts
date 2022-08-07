import { test } from 'uvu';
import * as assert from 'uvu/assert';
import {
  mocksSetup, mocksTeardown, setup, sleep, teardown,
} from './utils';

test.before.each(setup);
test.before.each(mocksSetup);
test.after.each(mocksTeardown);
test.after.each(teardown);

test('renders entire newtab app', async () => {
  // eslint-disable-next-line global-require, import/extensions
  require('../dist/newtab.js');

  // TODO: Better assertions
  assert.is(document.body.innerHTML.length > 1000, true);
  assert.ok(document.body.querySelector('#b')); // bookmarks bar
  assert.ok(document.body.querySelector('#s')); // search input
  assert.ok(document.body.querySelector('#m')); // menu wrapper
  assert.ok(document.body.querySelector('#d')); // menu dropdown

  // Wait for async calls in the app to finish
  await sleep(10);
});

test.run();
