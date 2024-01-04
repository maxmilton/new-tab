import { afterEach, describe, expect, mock, spyOn, test } from 'bun:test';
import { reset } from '../setup';
import { DECLARATION, compile, lookup, walk } from './css-engine';
import { consoleSpy } from './utils';

// Completely reset DOM and global state between tests
afterEach(reset);

const MODULE_PATH = import.meta.resolveSync('../../dist/settings.js');
const themes = Bun.file('dist/themes.json');

async function load() {
  const fetchMock = mock((input: RequestInfo | URL) => {
    if (input === 'themes.json') {
      return Promise.resolve(new Response(themes));
    }
    throw new Error(`Unexpected fetch call: ${String(input)}`);
  });
  // eslint-disable-next-line no-multi-assign
  global.fetch = window.fetch = fetchMock;

  Loader.registry.delete(MODULE_PATH);
  await import(MODULE_PATH);
  await happyDOM.whenAsyncComplete();

  return fetchMock;
}

test('renders entire settings app', async () => {
  const checkConsoleSpy = consoleSpy();
  await load();
  expect(document.body.innerHTML.length).toBeGreaterThan(600);

  // TODO: More/better assertions

  checkConsoleSpy();
});

test('gets stored user settings once on load', async () => {
  const spy = spyOn(chrome.storage.local, 'get');
  await load();
  expect(spy).toHaveBeenCalledTimes(1);
});

test('fetches themes.json once and makes no other fetch calls', async () => {
  const fetchMock = await load();
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(fetchMock).toHaveBeenCalledWith('themes.json');
});

const css = await Bun.file('dist/settings.css').text();

describe('CSS', () => {
  const ast = compile(css);

  test('does not contain any @media queries', () => {
    expect(css).not.toInclude('@media');
  });

  test('does not contain any @font-face rules', () => {
    expect(css).not.toInclude('@font-face');
  });

  test('does not contain any @import rules', () => {
    expect(css).not.toInclude('@import');
  });

  test('does not contain any comments', () => {
    expect(css).not.toInclude('/*');
    expect(css).not.toInclude('*/');
    expect(css).not.toInclude('//');
    expect(css).not.toInclude('<!');
  });

  test('does not contain ":root"', () => {
    expect(css).not.toInclude(':root');
  });

  test('compiled AST is not empty', () => {
    expect(ast).not.toBeEmpty();
  });

  test('does not have any rules with a ":root" selector', () => {
    const elements = lookup(ast, ':root');
    expect(elements).toBeUndefined();
  });

  test('does not have any CSS variable declarations', () => {
    let found = 0;
    walk(ast, (element) => {
      if (element.type === DECLARATION && (element.props as string).startsWith('--')) {
        found += 1;
      }
    });
    expect(found).toBe(0);
  });
});
