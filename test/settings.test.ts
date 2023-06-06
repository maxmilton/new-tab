import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { reset } from './setup';
import { consoleSpy } from './utils';

test.after(reset);

test('renders entire settings app', async () => {
  const checkConsoleCalls = consoleSpy();

  // eslint-disable-next-line global-require, import/extensions
  require('../dist/settings.js');

  await happyDOM.whenAsyncComplete();

  // TODO: Better assertions
  assert.is(document.body.innerHTML.length > 600, true);

  checkConsoleCalls(assert);
});

test.run();
