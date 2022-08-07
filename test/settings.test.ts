import { test } from 'uvu';
import * as assert from 'uvu/assert';
import {
  mocksSetup, mocksTeardown, setup, sleep, teardown,
} from './utils';

test.before.each(setup);
test.before.each(mocksSetup);
test.after.each(mocksTeardown);
test.after.each(teardown);

test('renders entire settings app', async () => {
  // eslint-disable-next-line global-require, import/extensions
  require('../dist/settings.js');

  // Wait for async calls in the app to finish
  await sleep(10);

  // TODO: Better assertions
  assert.is(document.body.innerHTML.length > 600, true);

  await sleep(0);
});

test.run();
