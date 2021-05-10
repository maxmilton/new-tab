import { test } from 'uvu';
import * as assert from 'uvu/assert';
import {
  mocksSetup, mocksTeardown, setup, teardown,
} from './utils';

test.before.each(setup);
test.before.each(mocksSetup);
test.after.each(mocksTeardown);
test.after.each(teardown);

test('renders entire settings app', () => {
  // eslint-disable-next-line global-require
  require('../dist/settings');

  // TODO: Better assertions
  assert.is(document.body.innerHTML.length > 600, true);
});

test.run();
