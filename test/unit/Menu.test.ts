import { afterEach, expect, spyOn, test } from 'bun:test';
import { Menu } from '../../src/components/Menu';
import { handleClick } from '../../src/utils';
import { cleanup, render } from './utils';
// import { deleteSyntheticEvent, setupSyntheticEvent } from 'stage1/runtime';

afterEach(cleanup);

test('rendered DOM contains expected elements', () => {
  const rendered = render(Menu());
  const root = rendered.container.firstChild as HTMLElement;
  expect(root).toBeInstanceOf(window.HTMLDivElement);
  expect(root.id).toBe('m');
  expect(root.querySelector('svg#im')).toBeTruthy();
  expect(root.querySelector('div#d')).toBeTruthy();
  expect(root.querySelector('a[href="chrome://bookmarks"]')).toBeTruthy();
  expect(root.querySelector('a[href="chrome://password-manager"]')).toBeTruthy();
  expect(root.querySelector('a[href="chrome://downloads"]')).toBeTruthy();
  expect(root.querySelector('a[href="chrome://history"]')).toBeTruthy();
  expect(root.querySelector('a[href="chrome://extensions"]')).toBeTruthy();
  expect(root.querySelector('a[href="https://github.com/maxmilton/new-tab/issues"]')).toBeTruthy();
});

test('rendered DOM matches snapshot', () => {
  const rendered = render(Menu());
  expect(rendered.container.innerHTML).toMatchSnapshot();
});

test('clicking settings link calls chrome.runtime.openOptionsPage', () => {
  // setupSyntheticEvent('click'); // same click event logic as in src/newtab.ts
  document.onclick = handleClick; // same click event logic as in src/newtab.ts
  const spy = spyOn(chrome.runtime, 'openOptionsPage');
  const rendered = render(Menu());
  // TODO: Use a less brittle selector, however currently the settings link is
  // the only one without a href attribute...
  const link = rendered.container.querySelector<HTMLAnchorElement>('a:not([href])');
  expect(link).toBeInstanceOf(window.HTMLAnchorElement);
  link?.click();
  expect(spy).toHaveBeenCalledTimes(1);
  spy.mockRestore();
  // deleteSyntheticEvent('click');
  document.onclick = null;
});
