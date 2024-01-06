import { describe, expect, test } from 'bun:test';
import { VirtualConsole } from 'happy-dom';

describe('matcher: toBePlainObject', () => {
  const plainObjects = [
    {},
    { foo: 'bar' },
    Object.create(null),
    Object.create({}),
    // eslint-disable-next-line no-new-object
    new Object(),
  ];

  const nonPlainObjects = [
    null,
    // eslint-disable-next-line unicorn/no-new-array
    new Array(1),
    [[{}]], // double array due to quirk of bun test; resolves to [{}]
    [[null]], // double array due to quirk of bun test; resolves to [null]
    () => {},
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    new Function(),
    Function,
    Object,
    new Date(),
    // eslint-disable-next-line prefer-regex-literals
    new RegExp(''),
    // eslint-disable-next-line unicorn/error-message
    new Error(),
    new Map(),
    new Set(),
    new WeakMap(),
    new WeakSet(),
    new Promise(() => {}),
    new Int8Array(),
  ];

  const nonObjects = [
    'Hello',
    123,
    true,
    false,
    undefined,
    Symbol('sym'),
    BigInt(1234),
    // eslint-disable-next-line unicorn/prefer-number-properties
    NaN,
    // eslint-disable-next-line unicorn/prefer-number-properties
    Infinity,
  ];

  test.each(plainObjects)('matches plain object %#', (item) => {
    expect(item).toBePlainObject();
  });

  test.each(nonPlainObjects)('does not match non-plain object %#', (item) => {
    expect(item).not.toBePlainObject();
  });

  test.each(nonObjects)('does not match non-object %#', (item) => {
    expect(item).not.toBePlainObject();
  });
});

describe('console2', () => {
  test('global exists', () => {
    expect(console2).toBeDefined();
  });

  // TODO: How to test this? Since setup.ts is preloaded, there's no way to get
  // the original console.
  // test('is the original console', () => {
  //   expect(console2).toBe(originalConsole);
  // });

  test('is not a happy-dom virtual console', () => {
    expect(window.console).toBeInstanceOf(VirtualConsole);
    expect(console).toStrictEqual(window.console);
    expect(console2).not.toBe(console);
    expect(console2).not.toBe(window.console);
  });
});

describe('happy-dom', () => {
  const globals = [
    'happyDOM',
    'window',
    'document',
    'console',
    'setTimeout',
    'clearTimeout',
    'DocumentFragment',
    'CSSStyleSheet',
    'Text',
    'fetch',
    'MutationObserver',
  ];

  test.each(globals)('"%s" global exists', (global) => {
    expect(global).toBeDefined();
  });

  test('console is a virtual console', () => {
    expect(window.console).toBeInstanceOf(VirtualConsole);
    expect(console).toBeInstanceOf(VirtualConsole);
    expect(console).toStrictEqual(window.console);
  });
});
