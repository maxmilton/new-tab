import { afterEach, expect, spyOn, test } from 'bun:test';
import { reset } from '../setup';
import { consoleSpy } from './utils';

// Completely reset DOM and global state between tests
afterEach(reset);

const MODULE_PATH = import.meta.resolveSync('../../dist/newtab.js');

async function load() {
  // Workaround for hack in src/BookmarkBar.ts that waits for styles to be loaded
  document.head.appendChild(document.createElement('style'));

  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  delete import.meta.require.cache[MODULE_PATH];
  await import(MODULE_PATH);
  await happyDOM.whenAsyncComplete();
}

test('renders entire newtab app', async () => {
  const checkConsoleCalls = consoleSpy();
  await load();
  expect(document.body.innerHTML.length).toBeGreaterThan(1000);
  expect(document.body.querySelector('#b')).toBeTruthy();
  expect(document.body.querySelector('#s')).toBeTruthy();
  expect(document.body.querySelector('#m')).toBeTruthy();
  expect(document.body.querySelector('#d')).toBeTruthy();

  // TODO: More/better assertions
  // TODO: Check all section headings exist; a h2 with text 'Open Tabs' x5

  checkConsoleCalls();
});

test('gets stored user settings once', async () => {
  const spy = spyOn(chrome.storage.local, 'get');
  await load();
  expect(spy).toHaveBeenCalledTimes(1);
});

// TODO: Test with various settings
// TODO: Test themes logic
