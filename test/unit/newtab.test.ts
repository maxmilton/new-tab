import { afterAll, beforeAll, expect, test } from 'bun:test';
import { reset } from '../setup';
import { consoleSpy } from './utils';

beforeAll(() => {
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

afterAll(reset);

test('renders entire newtab app', async () => {
  const checkConsoleCalls = consoleSpy();

  // @ts-expect-error - no allowJs in tsconfig
  // eslint-disable-next-line import/extensions
  await import('../../dist/newtab.js');
  await happyDOM.whenAsyncComplete();

  // TODO: Better assertions
  expect(document.body.innerHTML.length).toBeGreaterThan(1000);
  expect(document.body.querySelector('#b')).toBeTruthy();
  expect(document.body.querySelector('#s')).toBeTruthy();
  expect(document.body.querySelector('#m')).toBeTruthy();
  expect(document.body.querySelector('#d')).toBeTruthy();

  // TODO: Check there is a h2 with text 'Open Tabs'

  checkConsoleCalls(expect);
});
