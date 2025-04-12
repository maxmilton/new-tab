import { afterEach, beforeEach, expect, test } from 'bun:test';
import { cleanup, render } from '@maxmilton/test-utils/dom';
import type { Search as SearchComponent } from '../../src/components/Search';

// HACK: The Search component is designed to be rendered once (does not clone
// its view), for byte savings. Given its mutation of the view (affecting global
// state) when run, it's vital to reset its module state between tests to
// maintain accurate test conditions.
const MODULE_PATH = Bun.resolveSync('./src/components/Search', '.');
let Search: typeof SearchComponent;

beforeEach(async () => {
  Loader.registry.delete(MODULE_PATH);
  Search = (await import('../../src/components/Search')).Search;
});

afterEach(cleanup);

// XXX: Because async chrome APIs are called within Search, we need to wait for
// them to complete before we assert anything.

test('rendered DOM contains expected elements', async () => {
  expect.assertions(7);
  const rendered = render(Search());
  await happyDOM.waitUntilComplete();
  const root = rendered.container.firstChild as HTMLElement;
  expect(root).toBeInstanceOf(window.HTMLDivElement);
  expect(root.id).toBe('c');
  const input = root.querySelector('input#s');
  expect(input).toBeTruthy();
  expect(root.firstChild).toBe(input);
  expect(input?.parentElement).toBe(root);
  const icon = root.querySelector('svg#i');
  expect(icon).toBeTruthy();
  expect(icon?.parentElement).toBe(root);

  // TODO: Check for other elements (but probably only those which are part of
  // the Search component and not its children?).
});

test('rendered DOM matches snapshot', async () => {
  expect.assertions(1);
  const rendered = render(Search());
  await happyDOM.waitUntilComplete();
  expect(rendered.container.innerHTML).toMatchSnapshot();
});

// TODO: Test with various settings, especially section order
// TODO: Test the search functionality
