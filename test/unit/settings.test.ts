import { afterEach, expect, mock, test } from 'bun:test';
import { reset } from '../setup';
import { consoleSpy } from './utils';

// Completely reset DOM and global state between tests
afterEach(reset);

const MODULE_PATH = import.meta.resolveSync('../../dist/settings.js');
const themes = Bun.file('dist/themes.json');

async function load() {
  global.fetch = mock((input: RequestInfo | URL) => {
    if (input === 'themes.json') {
      return Promise.resolve(new Response(themes));
    }
    throw new Error(`Unexpected fetch call: ${String(input)}`);
  });

  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  delete import.meta.require.cache[MODULE_PATH];
  await import(MODULE_PATH);
  await happyDOM.whenAsyncComplete();
}

test('renders entire settings app', async () => {
  const checkConsoleCalls = consoleSpy();
  await load();
  expect(document.body.innerHTML.length).toBeGreaterThan(600);

  // TODO: More/better assertions

  checkConsoleCalls();
});

test('fetches themes.json once and no other fetch calls', async () => {
  await load();
  expect(global.fetch).toHaveBeenCalledTimes(1);
  // TODO: Uncomment once bun supports this
  // expect(global.fetch).toHaveBeenCalledWith('themes.json');
});
