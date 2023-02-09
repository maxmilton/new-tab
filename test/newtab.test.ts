import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { reset } from './setup';
import { consoleSpy } from './utils';

test.before(() => {
  // @ts-expect-error - mock
  // eslint-disable-next-line consistent-return
  global.chrome.storage.local.get = (_keys, callback) => {
    if (callback) {
      callback({ t: '' });
    } else {
      return Promise.resolve({ t: '' });
    }
  };
});
test.after(reset);

test('renders entire newtab app', async () => {
  const checkConsoleCalls = consoleSpy();

  // eslint-disable-next-line global-require, import/extensions
  require('../dist/newtab.js');

  await happyDOM.whenAsyncComplete();

  // TODO: Better assertions
  assert.is(document.body.innerHTML.length > 1000, true, 'body has content');
  assert.ok(document.body.querySelector('#b'), 'has bookmarks bar');
  assert.ok(document.body.querySelector('#s'), 'has search input');
  assert.ok(document.body.querySelector('#m'), 'has menu wrapper');
  assert.ok(document.body.querySelector('#d'), 'has menu dropdown');

  // TODO: Check there is a h2 with text 'Open Tabs'

  checkConsoleCalls(assert);
});

test.run();
