import { afterEach, expect, spyOn, test } from 'bun:test';
import { deleteSyntheticEvent, setupSyntheticEvent } from 'stage1/runtime';
import { Menu } from '../../src/components/Menu';
import { cleanup, render } from './utils';

afterEach(cleanup);

test('rendered DOM contains expected elements', () => {
  const rendered = render(Menu());
  expect(rendered.container.querySelector('#m')).toBeTruthy();
  expect(rendered.container.querySelector('svg#im')).toBeTruthy();
  expect(rendered.container.querySelector('#d')).toBeTruthy();
  expect(rendered.container.querySelector('a[href="chrome://new-tab-page"]')).toBeTruthy();
  expect(rendered.container.querySelector('a[href="chrome://bookmarks"]')).toBeTruthy();
  expect(rendered.container.querySelector('a[href="chrome://downloads"]')).toBeTruthy();
  expect(rendered.container.querySelector('a[href="chrome://history"]')).toBeTruthy();
  expect(rendered.container.querySelector('a[href="chrome://settings/passwords"]')).toBeTruthy();
  expect(
    rendered.container.querySelector('a[href="https://github.com/maxmilton/new-tab/issues"]'),
  ).toBeTruthy();
});

test('rendered DOM matches snapshot', () => {
  const rendered = render(Menu());
  expect(rendered.container.innerHTML).toMatchSnapshot();
});

test('clicking settings link calls chrome.runtime.openOptionsPage', () => {
  setupSyntheticEvent('click'); // same click event logic as in src/newtab.ts
  const spy = spyOn(global.chrome.runtime, 'openOptionsPage');
  const rendered = render(Menu());
  // TODO: Use a less brittle selector, however currently the settings link is
  // the only one with a href attribute...
  rendered.container.querySelector<HTMLAnchorElement>('a:not([href])')?.click();
  expect(spy).toHaveBeenCalledTimes(1);
  deleteSyntheticEvent('click');
});
