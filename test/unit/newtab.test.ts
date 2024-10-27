import { afterEach, describe, expect, spyOn, test } from 'bun:test';
import { DECLARATION, compile, lookup, walk } from '@maxmilton/test-utils/css';
import { performanceSpy } from '@maxmilton/test-utils/spy';
import { reset } from '../setup';

// Completely reset DOM and global state between tests
afterEach(reset);

const MODULE_PATH = import.meta.resolveSync('../../dist/newtab.js');

async function load() {
  // Workaround for hack in src/BookmarkBar.ts that waits for styles to be loaded
  document.head.appendChild(document.createElement('style'));

  Loader.registry.delete(MODULE_PATH);
  await import(MODULE_PATH);
  await happyDOM.waitUntilComplete();
}

test('renders entire newtab app', async () => {
  expect.assertions(5);
  await load();
  expect(document.body.innerHTML.length).toBeGreaterThan(1000);
  expect(document.body.querySelector('#b')).toBeTruthy();
  expect(document.body.querySelector('#s')).toBeTruthy();
  expect(document.body.querySelector('#m')).toBeTruthy();
  expect(document.body.querySelector('#d')).toBeTruthy();

  // TODO: More/better assertions
  // TODO: Check all section headings exist; a h2 with text 'Open Tabs' x5
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

test('does not call fetch()', async () => {
  expect.assertions(1);
  const spy = spyOn(global, 'fetch');
  await load();
  expect(spy).not.toHaveBeenCalled();
});

test('gets stored user settings once', async () => {
  expect.assertions(1);
  const spy = spyOn(chrome.storage.local, 'get');
  await load();
  expect(spy).toHaveBeenCalledTimes(1);
});

// TODO: Test with various settings
// TODO: Test themes logic
const css = await Bun.file('dist/newtab.css').text();

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
    expect(css).not.toInclude('//'); // inline comments or URL protocol
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

  // CSS custom properties (variables) should only defined in themes
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
