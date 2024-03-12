import { afterAll, afterEach, beforeAll, expect, test } from 'bun:test';
import { BookmarkBar } from '../../src/components/BookmarkBar';
import { cleanup, render } from './utils';

let style: HTMLStyleElement;

beforeAll(() => {
  // Workaround for hack that waits for styles to be loaded
  style = document.head.appendChild(document.createElement('style'));
});
afterAll(() => {
  style.remove();
});

afterEach(cleanup);

// XXX: Because chrome.bookmarks.getChildren is async, which is called within
// BookmarkBar, we need to wait for it to complete before we assert anything.

test('rendered DOM contains expected elements', async () => {
  expect.assertions(2);
  const rendered = render(BookmarkBar());
  await happyDOM.waitUntilComplete();
  const root = rendered.container.firstChild as HTMLElement;
  expect(root).toBeInstanceOf(window.HTMLDivElement);
  expect(root.id).toBe('b');
});

test('rendered DOM matches snapshot', async () => {
  expect.assertions(1);
  const rendered = render(BookmarkBar());
  await happyDOM.waitUntilComplete();
  expect(rendered.container.innerHTML).toMatchSnapshot();
});
