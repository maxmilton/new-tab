import { test } from 'uvu';
import * as assert from 'uvu/assert';
import {
  mocksSetup, mocksTeardown, setup, teardown,
} from './utils';

test.before.each(setup);
test.before.each(mocksSetup);
test.after.each(mocksTeardown);
test.after.each(teardown);

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

test('renders entire settings app', async () => {
  // eslint-disable-next-line global-require, import/extensions
  require('../dist/settings.js');

  // TODO: Better assertions
  assert.is(document.body.innerHTML.length > 600, true);

  // XXX: Async code in settings init fails if this test ends prematurely
  await sleep(0);
});

test.run();
