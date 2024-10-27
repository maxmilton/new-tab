import { afterEach, expect, spyOn, test } from 'bun:test';
import { cleanup, render } from '@maxmilton/test-utils/dom';
import { Menu } from '../../src/components/Menu';
import { handleClick } from '../../src/utils';

afterEach(cleanup);

test('rendered DOM contains expected elements', () => {
  expect.assertions(10);
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
  expect.assertions(1);
  const rendered = render(Menu());
  expect(rendered.container.innerHTML).toMatchSnapshot();
});

test('clicking settings link calls chrome.runtime.openOptionsPage', () => {
  expect.assertions(2);
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
  document.onclick = null;
});
