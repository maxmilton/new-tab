import { afterEach, describe, expect, spyOn, test } from 'bun:test';
import { reset } from '../setup';
import { DECLARATION, compile, lookup, walk } from './css-engine';
import { consoleSpy } from './utils';

// Completely reset DOM and global state between tests
afterEach(reset);

const MODULE_PATH = import.meta.resolveSync('../../dist/newtab.js');

async function load() {
  // Workaround for hack in src/BookmarkBar.ts that waits for styles to be loaded
  document.head.appendChild(document.createElement('style'));

  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  delete import.meta.require.cache[MODULE_PATH];
  await import(MODULE_PATH);
  await happyDOM.whenAsyncComplete();
}

test('renders entire newtab app', async () => {
  const checkConsoleCalls = consoleSpy();
  await load();
  expect(document.body.innerHTML.length).toBeGreaterThan(1000);
  expect(document.body.querySelector('#b')).toBeTruthy();
  expect(document.body.querySelector('#s')).toBeTruthy();
  expect(document.body.querySelector('#m')).toBeTruthy();
  expect(document.body.querySelector('#d')).toBeTruthy();

  // TODO: More/better assertions
  // TODO: Check all section headings exist; a h2 with text 'Open Tabs' x5

  checkConsoleCalls();
});

test('gets stored user settings once', async () => {
  const spy = spyOn(chrome.storage.local, 'get');
  await load();
  expect(spy).toHaveBeenCalledTimes(1);
});

test('makes no fetch() calls', async () => {
  const spy = spyOn(global, 'fetch');
  await load();
  expect(spy).not.toHaveBeenCalled();
});

// TODO: Test with various settings
// TODO: Test themes logic
const css = await Bun.file('dist/newtab.css').text();

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

  // CSS custom properties (variables) should only defined in themes
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
