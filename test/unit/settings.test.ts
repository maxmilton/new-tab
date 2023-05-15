import { afterAll, expect, test } from 'bun:test';
import { reset } from '../setup';
import { consoleSpy } from './utils';

afterAll(reset);

test('renders entire settings app', async () => {
  const checkConsoleCalls = consoleSpy();

  // @ts-expect-error - no allowJs in tsconfig
  // eslint-disable-next-line import/extensions
  await import('../../dist/settings.js');
  await happyDOM.whenAsyncComplete();

  // TODO: Better assertions
  expect(document.body.innerHTML.length).toBeGreaterThan(600);

  // FIXME: fetch('themes.json') currently errors but does not fail the test
  //  ↳ A bad fetch should fail the test (bun test bug)
  //  ↳ It should actually get the themes.json file correctly (happy-dom bug)

  checkConsoleCalls(expect);
});
