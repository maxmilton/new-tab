import { afterEach, describe, expect, mock, spyOn, test } from 'bun:test';
import { reset } from '../setup';
import { DECLARATION, compile, lookup, walk } from './css-engine';
import { performanceSpy } from './utils';

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
  await happyDOM.waitUntilComplete();

  return fetchMock;
}

test('renders entire settings app', async () => {
  expect.assertions(1);
  await load();
  expect(document.body.innerHTML.length).toBeGreaterThan(600);

  // TODO: More/better assertions
});

test('does not call any console methods', async () => {
  expect.assertions(1);
  await load();
  expect(happyDOM.virtualConsolePrinter.read()).toBeArrayOfSize(0);
});

test('does not call any performance methods', async () => {
  expect.hasAssertions(); // variable number of assertions
  const check = performanceSpy();
  await load();
  check();
});

test('fetches themes.json once and does no other fetch calls', async () => {
  expect.assertions(2);
  const fetchMock = await load();
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(fetchMock).toHaveBeenCalledWith('themes.json');
});

test('gets stored user settings once on load', async () => {
  expect.assertions(1);
  const spy = spyOn(chrome.storage.local, 'get');
  await load();
  expect(spy).toHaveBeenCalledTimes(1);
});

const css = await Bun.file('dist/settings.css').text();

describe('CSS', () => {
  const ast = compile(css);

  test('does not contain any @media queries', () => {
    expect.assertions(1);
    expect(css).not.toInclude('@media');
  });

  test('does not contain any @font-face rules', () => {
    expect.assertions(1);
    expect(css).not.toInclude('@font-face');
  });

  test('does not contain any @import rules', () => {
    expect.assertions(1);
    expect(css).not.toInclude('@import');
  });

  test('does not contain any comments', () => {
    expect.assertions(4);
    expect(css).not.toInclude('/*');
    expect(css).not.toInclude('*/');
    expect(css).not.toInclude('//');
    expect(css).not.toInclude('<!');
  });

  test('does not contain ":root"', () => {
    expect.assertions(1);
    expect(css).not.toInclude(':root');
  });

  test('compiled AST is not empty', () => {
    expect.assertions(1);
    expect(ast).not.toBeEmpty();
  });

  test('does not have any rules with a ":root" selector', () => {
    expect.assertions(1);
    const elements = lookup(ast, ':root');
    expect(elements).toBeUndefined();
  });

  test('does not have any CSS variable declarations', () => {
    expect.assertions(1);
    let found = 0;
    walk(ast, (element) => {
      if (element.type === DECLARATION && (element.props as string).startsWith('--')) {
        found += 1;
      }
    });
    expect(found).toBe(0);
  });
});
