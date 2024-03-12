import { afterEach, describe, expect, test } from 'bun:test';
import { BookmarkNode, type BookmarkTreeNode } from '../../src/components/BookmarkNode';
import type { LinkProps } from '../../src/components/Link';
import { cleanup, render } from './utils';

afterEach(cleanup);

test('renders a link when url is provided', () => {
  expect.assertions(2);
  // @ts-expect-error - intentional partial props
  const rendered = render(BookmarkNode({ url: 'x' }));
  expect(rendered.container.querySelector('a')).toBeTruthy();
  expect(rendered.container.querySelector('div.f')).toBeFalsy();
});

test('renders a folder when url is not provided', () => {
  expect.assertions(2);
  // @ts-expect-error - intentional partial props
  const rendered = render(BookmarkNode({}));
  expect(rendered.container.querySelector('div.f')).toBeTruthy();
  expect(rendered.container.querySelector('a')).toBeFalsy();
});

describe('Bookmark (Link)', () => {
  test('rendered DOM contains expected elements', () => {
    expect.assertions(1);
    const rendered = render(
      BookmarkNode({ title: 'Example', url: 'https://example.com' } satisfies LinkProps),
    );
    const root = rendered.container.firstChild as HTMLElement;
    expect(root).toBeInstanceOf(window.HTMLAnchorElement);

    // TODO: More/better assertions to prove it's a Link component.
  });

  test('rendered DOM matches snapshot', () => {
    expect.assertions(1);
    const rendered = render(BookmarkNode({ title: 'Example', url: 'https://example.com' }));
    expect(rendered.container.innerHTML).toMatchSnapshot();
  });

  // TODO: Consider running the same tests as for Link component.
  //  ↳ How might we do this elegantly without duplicating the tests?
});

describe('Folder', () => {
  test('rendered DOM contains expected elements', () => {
    expect.assertions(2);
    const rendered = render(BookmarkNode({ id: '1', title: 'Example' } satisfies BookmarkTreeNode));
    const root = rendered.container.firstChild as HTMLElement;
    expect(root).toBeInstanceOf(window.HTMLDivElement);
    expect(root.className).toBe('f');
  });

  test('rendered DOM matches snapshot', () => {
    expect.assertions(1);
    const rendered = render(BookmarkNode({ id: '1', title: 'Example' }));
    expect(rendered.container.innerHTML).toMatchSnapshot();
  });

  // TODO: Consider running the most tests twice, once for BookmarkNode and again for Folder directly (except for tests which use the Folder 3rd argument; "children").
  // TODO: Test BookmarkNode 2nd argument; "nested"
  // TODO: Test open/close state on top level
  // TODO: Test open/close state of sub folders ("popup")
  // TODO: Rendered DOM snapshot when popup is open
  // TODO: Test openning another folder closes the previous one if on the same or lower level
  // TODO: Test openned sub folder positions
  // TODO: Test openned sub folder is scrollable when overflowing (might not be possible with happy-dom, but should definately write an e2e test for this)
});
