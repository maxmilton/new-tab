import { describe, expect, test } from 'bun:test';
import { VirtualConsole } from 'happy-dom';
import * as setupExports from '../setup';
import { originalConsoleCtor, reset } from '../setup';

describe('exports', () => {
  const exports = ['originalConsoleCtor', 'reset'];

  test.each(exports)('has "%s" named export', (exportName) => {
    expect(setupExports).toHaveProperty(exportName);
  });

  test('does not have a default export', () => {
    expect(setupExports).not.toHaveProperty('default');
  });

  test('does not export anything else', () => {
    expect(Object.keys(setupExports)).toHaveLength(exports.length);
  });
});

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

  test('is the original console', () => {
    expect(console2).toBeInstanceOf(originalConsoleCtor);
  });

  test('is not the happy-dom virtual console', () => {
    expect(console2).not.toBeInstanceOf(VirtualConsole);
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
    'fetch',
    'setTimeout',
    'clearTimeout',
    'DocumentFragment',
    'CSSStyleSheet',
    'Text',
  ];

  test.each(globals)('"%s" global exists', (global) => {
    expect(global).toBeDefined();
  });

  test('console is a virtual console', () => {
    expect(window.console).toBeInstanceOf(VirtualConsole);
    expect(console).toBeInstanceOf(VirtualConsole);
    expect(console).toBe(window.console); // same instance
  });

  test('console is not the original console', () => {
    expect(console).not.toBeInstanceOf(originalConsoleCtor);
    expect(console).not.toBe(console2);
  });

  describe('virtual console', () => {
    test('has no log entries by default', () => {
      const logs = happyDOM.virtualConsolePrinter.read();
      expect(logs).toBeArray();
      expect(logs).toHaveLength(0);
    });

    // types shouldn't include @types/node Console['Console'] property
    const methods: (keyof Omit<Console, 'Console'>)[] = [
      'assert',
      // 'clear', // clears log entries so we can't test it
      'count',
      'countReset',
      'debug',
      'dir',
      'dirxml',
      'error',
      // @ts-expect-error - alias for console.error
      'exception',
      'group',
      'groupCollapsed',
      // 'groupEnd', // doesn't log anything
      'info',
      'log',
      // 'profile', // not implemented in happy-dom
      // 'profileEnd',
      'table',
      // 'time', // doesn't log anything
      // 'timeStamp',
      // 'timeLog',
      // 'timeEnd',
      'trace',
      'warn',
    ];

    test.each(methods)('has log entry after "%s" call', (method) => {
      // eslint-disable-next-line no-console
      console[method]();
      expect(happyDOM.virtualConsolePrinter.read()).toHaveLength(1);
    });

    test('clears log entries after read', () => {
      expect(happyDOM.virtualConsolePrinter.read()).toHaveLength(0);
      // eslint-disable-next-line no-console
      console.log();
      expect(happyDOM.virtualConsolePrinter.read()).toHaveLength(1);
      expect(happyDOM.virtualConsolePrinter.read()).toHaveLength(0);
    });
  });
});

describe('reset', () => {
  test('is a function', () => {
    expect(reset).toBeFunction();
  });

  test('takes no arguments', () => {
    expect(reset).toHaveLength(0);
  });

  test('resets global chrome instance', async () => {
    (chrome as typeof chrome & { foo?: string }).foo = 'bar';
    expect(chrome).toHaveProperty('foo', 'bar');
    await reset();
    expect(chrome).not.toHaveProperty('foo');
  });

  test('resets global window instance', async () => {
    (window as Window & { foo?: string }).foo = 'bar';
    expect(window).toHaveProperty('foo', 'bar');
    await reset();
    expect(window).not.toHaveProperty('foo');
  });

  test('resets global document instance', async () => {
    const h1 = document.createElement('h1');
    h1.textContent = 'foo';
    document.body.appendChild(h1);
    expect(document.documentElement.innerHTML).toBe('<head></head><body><h1>foo</h1></body>');
    await reset();
    expect(document.documentElement.innerHTML).toBe('<head></head><body></body>');
  });

  test('resets expected globals instances', async () => {
    const oldChrome = chrome;
    const oldHappyDOM = happyDOM;
    const oldWindow = window;
    const oldDocument = document;
    const oldConsole = console;
    const oldFetch = fetch;
    const oldSetTimeout = setTimeout;
    const oldClearTimeout = clearTimeout;
    const oldDocumentFragment = DocumentFragment;
    await reset();
    expect(chrome).not.toBe(oldChrome);
    expect(happyDOM).not.toBe(oldHappyDOM);
    expect(window).not.toBe(oldWindow);
    expect(document).not.toBe(oldDocument);
    expect(console).not.toBe(oldConsole);
    expect(fetch).not.toBe(oldFetch);
    expect(setTimeout).not.toBe(oldSetTimeout);
    expect(clearTimeout).not.toBe(oldClearTimeout);
    expect(DocumentFragment).not.toBe(oldDocumentFragment);
  });
});
