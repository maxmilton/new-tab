/* eslint-disable @typescript-eslint/no-unused-vars, max-classes-per-file, no-console, unicorn/consistent-function-scoping */

import { describe, expect, spyOn, test } from 'bun:test';
import { VirtualConsole } from 'happy-dom';
import * as setupExports from '../setup';
import { originalConsoleCtor, parameters, reset } from '../setup';

describe('exports', () => {
  const exports = ['originalConsoleCtor', 'parameters', 'reset'];

  test.each(exports)('has "%s" named export', (exportName) => {
    expect.assertions(1);
    expect(setupExports).toHaveProperty(exportName);
  });

  test('does not have a default export', () => {
    expect.assertions(1);
    expect(setupExports).not.toHaveProperty('default');
  });

  test('does not export anything else', () => {
    expect.assertions(1);
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
  const notPlainObjects = [
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
    /(?:)/,
    new Date(),
    // biome-ignore lint/nursery/useErrorMessage: simple test case
    new Error(), // eslint-disable-line unicorn/error-message
    new Map(),
    new Set(),
    new WeakMap(),
    new WeakSet(),
    new Promise(() => {}),
    new Int8Array(),
  ];
  const notObjects = [
    'Hello',
    123,
    true,
    false,
    undefined,
    Symbol('sym'),
    BigInt(1234),
    // biome-ignore lint/style/useNumberNamespace: for tests
    NaN, // eslint-disable-line unicorn/prefer-number-properties
    // biome-ignore lint/style/useNumberNamespace: for tests
    Infinity,
  ];

  test.each(plainObjects)('matches plain object %#', (item) => {
    expect.assertions(1);
    expect(item).toBePlainObject();
  });

  test.each(notPlainObjects)('does not match non-plain object %#', (item) => {
    expect.assertions(1);
    expect(item).not.toBePlainObject();
  });

  test.each(notObjects)('does not match non-object %#', (item) => {
    expect.assertions(1);
    expect(item).not.toBePlainObject();
  });
});

describe('matcher: toBeClass', () => {
  // eslint-disable-next-line @typescript-eslint/no-extraneous-class
  class Foo {}
  const classes = [
    Foo,
    class Bar extends Foo {},
    // eslint-disable-next-line @typescript-eslint/no-extraneous-class
    class {},
    class extends Foo {},
    Foo.prototype.constructor,
  ];
  const notClasses = [
    'Hello',
    123,
    true,
    false,
    undefined,
    Symbol('sym'),
    BigInt(1234),
    // biome-ignore lint/style/useNumberNamespace: for tests
    NaN, // eslint-disable-line unicorn/prefer-number-properties
    // biome-ignore lint/style/useNumberNamespace: for tests
    Infinity,
    {},
    { foo: 'bar' },
    Object.create(null),
    Object.create({}),
    // eslint-disable-next-line no-new-object
    new Object(),
    null,
    // eslint-disable-next-line unicorn/no-new-array
    new Array(1),
    [[{}]], // double array due to quirk of bun test; resolves to [{}]
    [[null]], // double array due to quirk of bun test; resolves to [null]
    function foo() {},
    () => {},
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    new Function(),
    Function,
    Object,
    /(?:)/,
    new Date(),
    // biome-ignore lint/nursery/useErrorMessage: simple test case
    new Error(), // eslint-disable-line unicorn/error-message
    new Map(),
    new Set(),
    new WeakMap(),
    new WeakSet(),
    new Promise(() => {}),
    new Int8Array(),

    // XXX: These are built-in classes but accessing directly calls their
    // constructor, so they behave like functions.
    Function,
    Object,
    Array,
    String,
    Number,
    Boolean,
    Symbol,
    BigInt,
    Buffer,
  ];

  test.each(classes)('matches class %#: %p', (item) => {
    expect.assertions(1);
    expect(item).toBeClass();
  });

  test.each(notClasses)('does not match non-class %#: %p', (item) => {
    expect.assertions(1);
    expect(item).not.toBeClass();
  });
});

describe('matcher: toHaveParameters', () => {
  const funcs: [required: number, optional: number, func: unknown][] = [
    [0, 0, function foo() {}],
    [1, 0, function foo(_a: unknown) {}],
    [0, 1, function foo(_a = 1) {}],
    [2, 0, function foo(_a: unknown, _b: unknown) {}],
    [1, 1, function foo(_a: unknown, _b = 1) {}],
    [0, 2, function foo(_a = 1, _b = 2) {}],
    [0, 3, function foo(_a = 1, _b = 2, ..._rest: unknown[]) {}],
    // biome-ignore lint/complexity/useArrowFunction: explicit test case
    [0, 0, function () {}], // eslint-disable-line func-names
    // biome-ignore lint/complexity/useArrowFunction: explicit test case
    [1, 0, function (_a: unknown) {}], // eslint-disable-line func-names
    // biome-ignore lint/complexity/useArrowFunction: explicit test case
    [0, 1, function (_a = 1) {}], // eslint-disable-line func-names
    // biome-ignore lint/complexity/useArrowFunction: explicit test case
    [2, 0, function (_a: unknown, _b: unknown) {}], // eslint-disable-line func-names
    // biome-ignore lint/complexity/useArrowFunction: explicit test case
    [1, 1, function (_a: unknown, _b = 1) {}], // eslint-disable-line func-names
    // biome-ignore lint/complexity/useArrowFunction: explicit test case
    [0, 2, function (_a = 1, _b = 2) {}], // eslint-disable-line func-names
    // biome-ignore lint/complexity/useArrowFunction: explicit test case
    [0, 3, function (_a = 1, _b = 2, ..._rest: unknown[]) {}], // eslint-disable-line func-names
    [0, 0, () => {}],
    [1, 0, (_a: unknown) => {}],
    [0, 1, (_a = 1) => {}],
    [2, 0, (_a: unknown, _b: unknown) => {}],
    [1, 1, (_a: unknown, _b = 1) => {}],
    [0, 2, (_a = 1, _b = 2) => {}],
    [0, 3, (_a = 1, _b = 2, ..._rest: unknown[]) => {}],
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    [0, 0, function* foo() {}],
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    [1, 0, function* foo(_a: unknown) {}],
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    [0, 1, function* foo(_a = 1) {}],
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    [2, 0, function* foo(_a: unknown, _b: unknown) {}],
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    [1, 1, function* foo(_a: unknown, _b = 1) {}],
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    [0, 2, function* foo(_a = 1, _b = 2) {}],
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    [0, 3, function* foo(_a = 1, _b = 2, ..._rest: unknown[]) {}],
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    [0, 0, async function foo() {}],
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    [1, 0, async function foo(_a: unknown) {}],
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    [0, 1, async function foo(_a = 1) {}],
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    [2, 0, async function foo(_a: unknown, _b: unknown) {}],
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    [1, 1, async function foo(_a: unknown, _b = 1) {}],
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    [0, 2, async function foo(_a = 1, _b = 2) {}],
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    [0, 3, async function foo(_a = 1, _b = 2, ..._rest: unknown[]) {}],
    // eslint-disable-next-line @typescript-eslint/no-empty-function, func-names
    [0, 0, function* () {}],
    // eslint-disable-next-line @typescript-eslint/no-empty-function, func-names
    [1, 0, function* (_a: unknown) {}],
    // eslint-disable-next-line @typescript-eslint/no-empty-function, func-names
    [0, 1, function* (_a = 1) {}],
    // eslint-disable-next-line @typescript-eslint/no-empty-function, func-names
    [2, 0, function* (_a: unknown, _b: unknown) {}],
    // eslint-disable-next-line @typescript-eslint/no-empty-function, func-names
    [1, 1, function* (_a: unknown, _b = 1) {}],
    // eslint-disable-next-line @typescript-eslint/no-empty-function, func-names
    [0, 2, function* (_a = 1, _b = 2) {}],
    // eslint-disable-next-line @typescript-eslint/no-empty-function, func-names
    [0, 3, function* (_a = 1, _b = 2, ..._rest: unknown[]) {}],
    // biome-ignore lint/complexity/useArrowFunction: explicit test case
    [0, 0, async function () {}], // eslint-disable-line @typescript-eslint/no-empty-function, func-names
    // biome-ignore lint/complexity/useArrowFunction: explicit test case
    [1, 0, async function (_a: unknown) {}], // eslint-disable-line @typescript-eslint/no-empty-function, func-names
    // biome-ignore lint/complexity/useArrowFunction: explicit test case
    [0, 1, async function (_a = 1) {}], // eslint-disable-line @typescript-eslint/no-empty-function, func-names
    // biome-ignore lint/complexity/useArrowFunction: explicit test case
    [2, 0, async function (_a: unknown, _b: unknown) {}], // eslint-disable-line @typescript-eslint/no-empty-function, func-names
    // biome-ignore lint/complexity/useArrowFunction: explicit test case
    [1, 1, async function (_a: unknown, _b = 1) {}], // eslint-disable-line @typescript-eslint/no-empty-function, func-names
    // biome-ignore lint/complexity/useArrowFunction: explicit test case
    [0, 2, async function (_a = 1, _b = 2) {}], // eslint-disable-line @typescript-eslint/no-empty-function, func-names
    // biome-ignore lint/complexity/useArrowFunction: explicit test case
    [0, 3, async function (_a = 1, _b = 2, ..._rest: unknown[]) {}], // eslint-disable-line @typescript-eslint/no-empty-function, func-names
    [0, 0, async () => {}],
    [1, 0, async (_a: unknown) => {}],
    [0, 1, async (_a = 1) => {}],
    [2, 0, async (_a: unknown, _b: unknown) => {}],
    [1, 1, async (_a: unknown, _b = 1) => {}],
    [0, 2, async (_a = 1, _b = 2) => {}],
    [0, 3, async (_a = 1, _b = 2, ..._rest: unknown[]) => {}],
  ];

  test.each(funcs)(
    'matches function %# with %i required and %i optional parameters',
    (required, optional, func) => {
      expect.assertions(2);
      expect(func).toHaveParameters(required, optional);
      expect(func).toHaveLength(required);
    },
  );

  // TODO: Add test for failing case when passing non-function once bun supports it
});

describe('$console', () => {
  test('global exists', () => {
    expect.assertions(1);
    expect($console).toBeDefined();
  });

  test('is the original console', () => {
    expect.assertions(1);
    expect($console).toBeInstanceOf(originalConsoleCtor);
  });

  test('is not the happy-dom virtual console', () => {
    expect.assertions(3);
    expect($console).not.toBeInstanceOf(VirtualConsole);
    expect($console).not.toBe(console);
    expect($console).not.toBe(window.console);
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
    expect.assertions(1);
    expect(global).toBeDefined();
  });

  test('console is a virtual console', () => {
    expect.assertions(3);
    expect(window.console).toBeInstanceOf(VirtualConsole);
    expect(console).toBeInstanceOf(VirtualConsole);
    expect(console).toBe(window.console); // same instance
  });

  test('console is not the original console', () => {
    expect.assertions(2);
    expect(console).not.toBeInstanceOf(originalConsoleCtor);
    expect(console).not.toBe($console);
  });

  describe('virtual console', () => {
    test('has no log entries by default', () => {
      expect.assertions(2);
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
      expect.assertions(1);
      console[method]();
      expect(happyDOM.virtualConsolePrinter.read()).toHaveLength(1);
    });

    test('clears log entries after read', () => {
      expect.assertions(3);
      expect(happyDOM.virtualConsolePrinter.read()).toHaveLength(0);
      // biome-ignore lint/suspicious/noConsoleLog: for testing
      console.log();
      expect(happyDOM.virtualConsolePrinter.read()).toHaveLength(1);
      expect(happyDOM.virtualConsolePrinter.read()).toHaveLength(0);
    });
  });
});

describe('reset', () => {
  test('is a function', () => {
    expect.assertions(2);
    expect(reset).toBeFunction();
    expect(reset).not.toBeClass();
  });

  test('expects no parameters', () => {
    expect.assertions(1);
    expect(reset).toHaveParameters(0, 0);
  });

  test('resets global chrome instance', async () => {
    expect.assertions(2);
    (chrome as typeof chrome & { foo?: string }).foo = 'bar';
    expect(chrome).toHaveProperty('foo', 'bar');
    await reset();
    expect(chrome).not.toHaveProperty('foo');
  });

  test('resets global window instance', async () => {
    expect.assertions(2);
    (window as Window & { foo?: string }).foo = 'bar';
    expect(window).toHaveProperty('foo', 'bar');
    await reset();
    expect(window).not.toHaveProperty('foo');
  });

  test('resets global document instance', async () => {
    expect.assertions(2);
    const h1 = document.createElement('h1');
    h1.textContent = 'foo';
    document.body.appendChild(h1);
    expect(document.documentElement.innerHTML).toBe('<head></head><body><h1>foo</h1></body>');
    await reset();
    expect(document.documentElement.innerHTML).toBe('<head></head><body></body>');
  });

  test('resets expected globals instances', async () => {
    expect.assertions(9);
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

describe('parameters', () => {
  describe('no parameters', () => {
    test('simple function', () => {
      expect.assertions(1);
      function foo() {}
      expect(parameters(foo)).toBe(0);
    });

    test('generator function', () => {
      expect.assertions(1);
      function* foo() {
        yield null;
      }
      expect(parameters(foo)).toBe(0);
    });

    test('async function', () => {
      expect.assertions(1);
      async function foo() {
        await Promise.resolve();
      }
      expect(parameters(foo)).toBe(0);
    });

    test('arrow function', () => {
      expect.assertions(1);
      const foo = () => {};
      expect(parameters(foo)).toBe(0);
    });

    test('async arrow function', () => {
      expect.assertions(1);
      const foo = async () => {
        await Promise.resolve();
      };
      expect(parameters(foo)).toBe(0);
    });
  });

  describe('default parameters', () => {
    test('basic', () => {
      expect.assertions(1);
      function foo(_a = 1, _b = 2) {}
      expect(parameters(foo)).toBe(2);
    });

    test('scoped variables', () => {
      expect.assertions(1);
      const x = 1;
      const y = 2;
      function foo(_a = x, _b = y) {}
      expect(parameters(foo)).toBe(2);
    });

    // FIXME: How to test this? Bun trims the whitespace
    test.skip('excess whitespace', () => {
      expect.assertions(1);
      // biome-ignore format: explicit test case
      // eslint-disable-next-line no-multi-spaces, @typescript-eslint/space-before-function-paren, space-in-parens
      function   foo (  _a  =
          // eslint-disable-next-line no-multi-spaces, @typescript-eslint/comma-spacing
          1  ,
         // eslint-disable-next-line @typescript-eslint/comma-dangle
         _b = 2

         // x

        ) {}
      // console.log('#####', foo.toString());
      expect(parameters(foo)).toBe(2);
    });
  });

  describe('rest parameters', () => {
    test('case 1', () => {
      expect.assertions(1);
      function foo(..._args: unknown[]) {}
      expect(parameters(foo)).toBe(1);
    });

    test('case 2', () => {
      expect.assertions(1);
      function foo(_a: unknown, _b: unknown, ..._args: unknown[]) {}
      expect(parameters(foo)).toBe(3);
    });
  });

  describe('destructured parameters', () => {
    describe('Object destructuring', () => {
      test('case 1', () => {
        expect.assertions(1);
        function foo({ _a, _b }: Record<string, unknown>) {}
        expect(parameters(foo)).toBe(1);
      });

      test('case 2', () => {
        expect.assertions(1);
        function foo({ _a, _b }: Record<string, unknown> = {}) {}
        expect(parameters(foo)).toBe(1);
      });
    });

    describe('Array destructuring', () => {
      test('case 1', () => {
        expect.assertions(1);
        function foo([_a, _b]: unknown[]) {}
        expect(parameters(foo)).toBe(1);
      });

      test('case 2', () => {
        expect.assertions(1);
        function foo([_a, _b]: unknown[] = []) {}
        expect(parameters(foo)).toBe(1);
      });
    });
  });

  describe('nested destructuring', () => {
    test('case 1', () => {
      expect.assertions(1);
      // @ts-expect-error - explicit test case
      function foo({ a: { _b, _c } }) {}
      expect(parameters(foo)).toBe(1);
    });

    test('case 2', () => {
      expect.assertions(1);
      // @ts-expect-error - explicit test case
      function foo([_a, [_b, _c]]) {}
      expect(parameters(foo)).toBe(1);
    });

    test('case 3', () => {
      expect.assertions(1);
      // @ts-expect-error - explicit test case
      function foo({ a: { _b, _c } }, [[_d, _e]]) {}
      expect(parameters(foo)).toBe(2);
    });
  });

  describe('default values in destructuring', () => {
    test('case 1', () => {
      expect.assertions(1);
      function foo({ _a = 1, _b = 2 }: Record<string, unknown> = {}) {}
      expect(parameters(foo)).toBe(1);
    });

    test('case 2', () => {
      expect.assertions(1);
      function foo([_a = 1, _b = 2]: unknown[] = []) {}
      expect(parameters(foo)).toBe(1);
    });

    test('case 3', () => {
      expect.assertions(1);
      function foo({ _a = 1, _b = 2 }, [_c = 3, _d = 4]) {}
      expect(parameters(foo)).toBe(2);
    });

    test('case 4', () => {
      expect.assertions(1);
      // eslint-disable-next-line unicorn/no-object-as-default-parameter
      function foo({ _a = 1, _b = 2 } = { _a: 5 }, [_c = 3, _d = 4] = [6]) {}
      expect(parameters(foo)).toBe(2);
    });
  });

  describe('trailing commas', () => {
    test('case 1', () => {
      expect.assertions(1);
      // biome-ignore format: explicit test case
      // eslint-disable-next-line @typescript-eslint/comma-dangle
      function foo(_a: unknown, _b: unknown,) {}
      expect(parameters(foo)).toBe(2);
    });

    test('case 2', () => {
      expect.assertions(1);
      // biome-ignore format: explicit test case
      // eslint-disable-next-line @typescript-eslint/comma-dangle, space-in-parens
      function foo(_a: unknown, _b: unknown, ) {}
      expect(parameters(foo)).toBe(2);
    });

    test('case 3', () => {
      expect.assertions(1);
      // biome-ignore format: explicit test case
      function foo(
        _a: unknown,
        _b: unknown,
      ) {}
      expect(parameters(foo)).toBe(2);
    });
  });

  describe('parameter without parentheses in arrow functions', () => {
    test('case 1', () => {
      expect.assertions(1);
      // biome-ignore format: explicit test case
      const foo: ((_a: unknown) => void) = _a => {}; // eslint-disable-line arrow-parens
      expect(parameters(foo)).toBe(1);
    });
  });

  describe('multiple arrow function syntaxes', () => {
    test('case 1', () => {
      expect.assertions(1);
      const foo = (_a: unknown, _b: unknown) => {};
      expect(parameters(foo)).toBe(2);
    });

    test('case 2', () => {
      expect.assertions(1);
      const foo = (_a = 1, _b = 2) => {};
      expect(parameters(foo)).toBe(2);
    });

    test('case 3', () => {
      expect.assertions(1);
      const foo = ([_a, _b]: unknown[]) => {};
      expect(parameters(foo)).toBe(1);
    });
  });

  describe('strings within parameters', () => {
    test('case 1', () => {
      expect.assertions(1);
      function foo(_a = '', _b = '') {}
      expect(parameters(foo)).toBe(2);
    });

    test('case 2', () => {
      expect.assertions(1);
      function foo(_a = ',', _b = ',,,') {}
      expect(parameters(foo)).toBe(2);
    });

    test('case 3', () => {
      expect.assertions(1);
      function foo(_a = ')', _b = ')') {}
      expect(parameters(foo)).toBe(2);
    });

    test('case 3', () => {
      expect.assertions(1);
      function foo(_a = '(){}[]({[]})', _b = '(){}[]({[]})') {}
      expect(parameters(foo)).toBe(2);
    });

    test('nested string template literals simple', () => {
      expect.assertions(1);
      // NOTE: Bun optimizes simple template literals into a single string
      // biome-ignore lint/style/noUnusedTemplateLiteral: explicit test case
      function foo(_a = `x,${`y,${`z,`},`},`, _b = ``) {} // eslint-disable-line @typescript-eslint/no-unnecessary-template-expression, @typescript-eslint/quotes
      expect(parameters(foo)).toBe(2);
    });

    // FIXME: Don't skip once we support nested string template literals.
    test.skip('nested string template literals with interpolation', () => {
      expect.assertions(1);
      const x = 'x';
      const y = 'y';
      const z = 'z';
      function foo(_a = `${x},${`,${y},${`,${z},`},`},`) {} // eslint-disable-line @typescript-eslint/no-unnecessary-template-expression
      expect(parameters(foo)).toBe(1);
    });

    test("escaped '", () => {
      expect.assertions(1);
      // biome-ignore format: explicit test case
      function foo(_a = '\'', _b = '\'') {}
      expect(parameters(foo)).toBe(2);
    });

    test('escaped "', () => {
      expect.assertions(1);
      // biome-ignore format: explicit test case
      // eslint-disable-next-line @typescript-eslint/quotes
      function foo(_a = "\"", _b = "\"") {}
      expect(parameters(foo)).toBe(2);
    });

    test('escaped `', () => {
      expect.assertions(1);
      // biome-ignore lint/style/noUnusedTemplateLiteral: explicit test case
      function foo(_a = `\``, _b = `\``) {} // eslint-disable-line @typescript-eslint/quotes
      expect(parameters(foo)).toBe(2);
    });

    test(String.raw`escaped \ case 1`, () => {
      expect.assertions(1);
      // biome-ignore format: explicit test case
      function foo(_a = '\\', _b = '\\') {}
      expect(parameters(foo)).toBe(2);
    });

    test(String.raw`escaped \ case 2`, () => {
      expect.assertions(1);
      // biome-ignore format: explicit test case
      function foo(_a = 'bar\\', _b = 'baz\\') {}
      expect(parameters(foo)).toBe(2);
    });

    test('escaped all', () => {
      expect.assertions(1);
      // biome-ignore format: explicit test case
      // eslint-disable-next-line no-useless-escape
      function foo(_a = '\'\"\`', _b = '') {}
      expect(parameters(foo)).toBe(2);
    });
  });

  describe('functions within parameters', () => {
    test('case 1', () => {
      expect.assertions(1);
      function foo(_a = () => {}) {}
      expect(parameters(foo)).toBe(1);
    });

    test('case 2', () => {
      expect.assertions(1);
      // biome-ignore lint/style/useDefaultParameterLast: explicit test case
      function foo(_a = () => {}, _b: unknown) {} // eslint-disable-line @typescript-eslint/default-param-last
      expect(parameters(foo)).toBe(2);
    });

    test('case 3', () => {
      expect.assertions(1);
      function foo(_a = () => {}, _b = Date.now(), _c = Date.now()) {}
      expect(parameters(foo)).toBe(3);
    });
  });

  describe('functions as parameters', () => {
    test('case 1', () => {
      expect.assertions(1);
      function foo(_callback: () => void) {}
      expect(parameters(foo)).toBe(1);
    });
  });

  describe('parameters with expressions', () => {
    test('case 1', () => {
      expect.assertions(1);
      function foo(_a = 1 + 2) {}
      expect(parameters(foo)).toBe(1);
    });
  });

  describe('complex combinations', () => {
    test('case 1', () => {
      expect.assertions(1);
      const z = 3;
      async function foo(
        /* eslint-disable @typescript-eslint/default-param-last */
        // biome-ignore lint/style/useDefaultParameterLast: explicit test case
        _a = { x: 1, y: 2, z }, // eslint-disable-line unicorn/no-object-as-default-parameter
        // biome-ignore lint/style/useDefaultParameterLast: explicit test case
        _b = [1, 2, 3],
        // biome-ignore lint/style/useDefaultParameterLast: explicit test case
        _c = () => {},
        // biome-ignore lint/style/useDefaultParameterLast: explicit test case
        _d = Date.now(),
        // biome-ignore lint/style/useDefaultParameterLast: explicit test case
        _e = z,
        // biome-ignore lint/style/useDefaultParameterLast: explicit test case
        _f = z + 1 - (2 * 3) / 4,
        // biome-ignore lint/style/useDefaultParameterLast: explicit test case
        _g = Number.parseInt('123.456', 10),
        _h: unknown,
        _i = `,${String(z)},${String(z)},${String(z)},`,
        _j = '{{[[(())]]}}),),],],},}"""```\\\'',
        /* eslint-enable @typescript-eslint/default-param-last */
      ) {
        await Promise.resolve();
      }
      expect(parameters(foo)).toBe(10);
    });
  });

  describe('scope and shadowing', () => {
    test('case 1', () => {
      expect.assertions(1);
      const x = 1;
      // eslint-disable-next-line @typescript-eslint/no-shadow
      function foo(x: unknown) {
        // biome-ignore lint/suspicious/noConsoleLog: explicit test case
        console.log(x);
      }
      expect(parameters(foo)).toBe(1);
    });
  });

  // describe('parameters with the eval keyword', () => {
  //   test('case 1', () => {
  //     expect.assertions(1);
  //     function foo(a, eval) {}
  //     expect(parameters(foo)).toBe(2);
  //   });
  // });

  describe('non-ASCII identifiers', () => {
    test('case 1', () => {
      expect.assertions(1);
      // biome-ignore lint/nursery/noUnusedFunctionParameters: explicit test case
      function 𝑓𝑜𝑜(𝑎: unknown, 𝑏: unknown) {}
      expect(parameters(𝑓𝑜𝑜)).toBe(2);
    });

    test('case 2', () => {
      expect.assertions(1);
      // biome-ignore lint/nursery/noUnusedFunctionParameters: explicit test case
      const 𝑓𝑜𝑜 = (𝑎: unknown, 𝑏: unknown) => {};
      expect(parameters(𝑓𝑜𝑜)).toBe(2);
    });
  });

  // describe('invalid parameter lists', () => {
  //   test('case 1', () => {
  //     expect.assertions(1);
  //     function foo(_a: unknown, _a: unknown) {} // Syntax error in strict mode
  //     expect(parameters(foo)).toBe(2);
  //   });
  // });

  // describe('strict mode considerations', () => {
  //   test('case 1', () => {
  //     expect.assertions(1);
  //     'use strict';
  //     function foo(_a: unknown, _a: unknown) {} // Syntax error
  //     expect(parameters(foo)).toBe(2);
  //   });
  // });

  // describe('parameter names matching reserved words', () => {
  //   test('case 1', () => {
  //     expect.assertions(1);
  //     function foo(class, delete, if) {} // Syntax error
  //     expect(parameters(foo)).toBe(3);
  //   });
  // });

  describe('using arguments object', () => {
    test('basic', () => {
      expect.assertions(1);
      function foo(_a: unknown, _b: unknown) {
        // biome-ignore lint/suspicious/noConsoleLog: explicit test case
        // biome-ignore lint/style/noArguments: explicit test case
        console.log(arguments); // eslint-disable-line prefer-rest-params
      }
      expect(parameters(foo)).toBe(2);
    });
  });

  describe('edge cases in function declaration and expression', () => {
    test('function declaration and expression', () => {
      expect.assertions(1);
      const foo = function foo(_a: unknown, _b: unknown) {};
      expect(parameters(foo)).toBe(2);
    });

    test('generator function declaration and expression', () => {
      expect.assertions(1);
      const foo = function* foo(_a: unknown, _b: unknown) {
        yield null;
      };
      expect(parameters(foo)).toBe(2);
    });

    test('async function declaration and expression', () => {
      expect.assertions(1);
      const foo = async function foo(_a: unknown, _b: unknown) {
        await Promise.resolve();
      };
      expect(parameters(foo)).toBe(2);
    });

    test('function expression', () => {
      expect.assertions(1);
      // biome-ignore lint/complexity/useArrowFunction: explicit test case
      const bar = function (_a: unknown, _b: unknown) {}; // eslint-disable-line func-names
      expect(parameters(bar)).toBe(2);
    });

    test('generator function expression', () => {
      expect.assertions(1);
      // eslint-disable-next-line func-names
      const bar = function* (_a: unknown, _b: unknown) {
        yield null;
      };
      expect(parameters(bar)).toBe(2);
    });

    test('async function expression', () => {
      expect.assertions(1);
      // biome-ignore lint/complexity/useArrowFunction: explicit test case
      const bar = async function (_a: unknown, _b: unknown) /* eslint-disable-line func-names */ {
        await Promise.resolve();
      };
      expect(parameters(bar)).toBe(2);
    });

    test('arrow function expression', () => {
      expect.assertions(1);
      const bar = (_a: unknown, _b: unknown) => {};
      expect(parameters(bar)).toBe(2);
    });

    test('async arrow function expression', () => {
      expect.assertions(1);
      const bar = async (_a: unknown, _b: unknown) => {
        await Promise.resolve();
      };
      expect(parameters(bar)).toBe(2);
    });

    test('function declaration', () => {
      expect.assertions(1);
      function baz(_a: unknown, _b: unknown) {}
      expect(parameters(baz)).toBe(2);
    });

    test('generator function declaration', () => {
      expect.assertions(1);
      function* baz(_a: unknown, _b: unknown) {
        yield null;
      }
      expect(parameters(baz)).toBe(2);
    });

    test('async function declaration', () => {
      expect.assertions(1);
      async function baz(_a: unknown, _b: unknown) {
        await Promise.resolve();
      }
      expect(parameters(baz)).toBe(2);
    });
  });

  /* eslint-disable @typescript-eslint/lines-between-class-members, @typescript-eslint/no-empty-function, @typescript-eslint/no-extraneous-class, @typescript-eslint/no-invalid-void-type, @typescript-eslint/no-useless-constructor, class-methods-use-this */
  describe('classes', () => {
    test('basic', () => {
      expect.assertions(1);
      class Foo {
        // biome-ignore lint/complexity/noUselessConstructor: simple test case
        constructor(_a: unknown, _b: unknown) {}
      }
      expect(parameters(Foo)).toBe(2);
    });

    test('no constructor parameters', () => {
      expect.assertions(1);
      class Foo {
        // biome-ignore lint/complexity/noUselessConstructor: simple test case
        constructor() {}
      }
      expect(parameters(Foo)).toBe(0);
    });

    test('extends', () => {
      expect.assertions(3);
      class Foo {
        // biome-ignore lint/complexity/noUselessConstructor: simple test case
        constructor(_a: unknown, _b: unknown) {}
      }
      class Bar extends Foo {
        constructor(_a: unknown, _b: unknown, _c: unknown) {
          super(_a, _b);
        }
      }
      class Baz extends Bar {
        constructor() {
          super(null, null, null);
        }
      }
      expect(parameters(Foo)).toBe(2);
      expect(parameters(Bar)).toBe(3);
      expect(parameters(Baz)).toBe(0);
    });

    test('anonymous', () => {
      expect.assertions(1);
      expect(
        parameters(
          class {
            // biome-ignore lint/complexity/noUselessConstructor: simple test case
            constructor(_a: unknown, _b: unknown) {}
          },
        ),
      ).toBe(2);
    });

    test('with no constructor function throw', () => {
      expect.assertions(4);
      class Foo {}
      class Bar extends Foo {}
      const error = new Error('Invalid function signature');
      expect(() => parameters(Foo)).toThrow(error);
      expect(() => parameters(Bar)).toThrow(error);
      expect(() => parameters(class {})).toThrow(error);
      expect(() => parameters(class extends Foo {})).toThrow(error);
    });

    describe('with methods', () => {
      test('case 1: constructor', () => {
        expect.assertions(1);
        class Foo {
          // biome-ignore lint/complexity/noUselessConstructor: simple test case
          constructor(_a: unknown, _b: unknown) {}
          method(this: void, _c: unknown, _d: unknown, _e: unknown) {}
        }
        expect(parameters(Foo)).toBe(2);
      });

      test('case 2: method parameters', () => {
        expect.assertions(1);
        class Foo {
          // biome-ignore lint/complexity/noUselessConstructor: simple test case
          constructor(_a: unknown, _b: unknown) {}
          method(this: void, _c: unknown, _d: unknown, _e: unknown) {}
        }
        const instance = new Foo(1, 2);
        expect(parameters(instance.method)).toBe(3);
      });

      test('case 3: method parameters no constructor', () => {
        expect.assertions(1);
        class Foo {
          method(this: void, _a: unknown, _b: unknown, _c: unknown) {}
        }
        const instance = new Foo();
        expect(parameters(instance.method)).toBe(3);
      });

      test('case 4: generator method parameters', () => {
        expect.assertions(1);
        class Foo {
          // biome-ignore lint/complexity/noUselessConstructor: simple test case
          constructor(_a: unknown, _b: unknown) {}
          // eslint-disable-next-line generator-star-spacing
          *method(this: void, _c: unknown, _d: unknown, _e: unknown) {
            yield null;
          }
        }
        const instance = new Foo(1, 2);
        expect(parameters(instance.method)).toBe(3);
      });

      test('case 5: async method parameters', () => {
        expect.assertions(1);
        class Foo {
          // biome-ignore lint/complexity/noUselessConstructor: simple test case
          constructor(_a: unknown, _b: unknown) {}
          async method(this: void, _c: unknown, _d: unknown, _e: unknown) {}
        }
        const instance = new Foo(1, 2);
        expect(parameters(instance.method)).toBe(3);
      });

      test('case 6: anonymous method parameters', () => {
        expect.assertions(1);
        const instance = new (class {
          // biome-ignore lint/complexity/noUselessConstructor: simple test case
          constructor(_a: unknown, _b: unknown) {}
          method(this: void, _c: unknown, _d: unknown, _e: unknown) {}
        })(1, 2);
        expect(parameters(instance.method)).toBe(3);
      });

      test('case 7: field parameters', () => {
        expect.assertions(1);
        class Foo {
          method = (_a: unknown, _b: unknown, _c: unknown) => {};
        }
        const instance = new Foo();
        expect(parameters(instance.method)).toBe(3);
      });
    });

    describe('with static methods', () => {
      test('case 1: constructor', () => {
        expect.assertions(1);
        class Foo {
          // biome-ignore lint/complexity/noUselessConstructor: simple test case
          constructor(_a: unknown, _b: unknown) {}
          static method(this: void, _c: unknown, _d: unknown, _e: unknown) {}
        }
        expect(parameters(Foo)).toBe(2);
      });

      test('case 2: method parameters', () => {
        expect.assertions(1);
        class Foo {
          // biome-ignore lint/complexity/noUselessConstructor: simple test case
          constructor(_a: unknown, _b: unknown) {}
          static method(this: void, _c: unknown, _d: unknown, _e: unknown) {}
        }
        expect(parameters(Foo.method)).toBe(3);
      });

      test('case 3: method parameters no constructor', () => {
        expect.assertions(1);
        // biome-ignore lint/complexity/noStaticOnlyClass: explicit test case
        class Foo /* eslint-disable-line unicorn/no-static-only-class */ {
          static method(this: void, _a: unknown, _b: unknown, _c: unknown) {}
        }
        expect(parameters(Foo.method)).toBe(3);
      });

      test('case 4: generator method parameters', () => {
        expect.assertions(1);
        class Foo {
          // biome-ignore lint/complexity/noUselessConstructor: simple test case
          constructor(_a: unknown, _b: unknown) {}
          // eslint-disable-next-line generator-star-spacing
          static *method(this: void, _c: unknown, _d: unknown, _e: unknown) {
            yield null;
          }
        }
        expect(parameters(Foo.method)).toBe(3);
      });

      test('case 5: async method parameters', () => {
        expect.assertions(1);
        class Foo {
          // biome-ignore lint/complexity/noUselessConstructor: simple test case
          constructor(_a: unknown, _b: unknown) {}
          static async method(this: void, _c: unknown, _d: unknown, _e: unknown) {}
        }
        expect(parameters(Foo.method)).toBe(3);
      });

      test('case 6: anonymous method parameters', () => {
        expect.assertions(1);
        expect(
          parameters(
            class {
              // biome-ignore lint/complexity/noUselessConstructor: simple test case
              constructor(_a: unknown, _b: unknown) {}
              static method(this: void, _c: unknown, _d: unknown, _e: unknown) {}
            }.method,
          ),
        ).toBe(3);
      });

      test('case 7: field parameters', () => {
        expect.assertions(1);
        // biome-ignore lint/complexity/noStaticOnlyClass: explicit test case
        class Foo /* eslint-disable-line unicorn/no-static-only-class */ {
          static method = (_a: unknown, _b: unknown, _c: unknown) => {};
        }
        expect(parameters(Foo.method)).toBe(3);
      });
    });

    describe('with getters and setters', () => {
      test('case 1: constructor', () => {
        expect.assertions(1);
        class Foo {
          // biome-ignore lint/complexity/noUselessConstructor: simple test case
          constructor(_a: unknown, _b: unknown) {}
          get prop(): null {
            return null;
          }
          set prop(_c: unknown) {}
        }
        expect(parameters(Foo)).toBe(2);
      });

      test('case 2: getter/setter throws', () => {
        expect.assertions(1);
        class Foo {
          // biome-ignore lint/complexity/noUselessConstructor: simple test case
          constructor(_a: unknown, _b: unknown) {}
          get prop(): null {
            return null;
          }
          set prop(_c: unknown) {}
        }
        const instance = new Foo(1, 2);
        expect(() => parameters(instance.prop)).toThrow(new TypeError('Expected a function'));
      });
    });

    describe('with computed property names', () => {
      test('case 1: constructor', () => {
        expect.assertions(1);
        const prop = 'method';
        class Foo {
          // biome-ignore lint/complexity/noUselessConstructor: simple test case
          constructor(_a: unknown, _b: unknown) {}
          [prop](this: void, _c: unknown, _d: unknown, _e: unknown) {}
        }
        expect(parameters(Foo)).toBe(2);
      });

      test('case 2: method parameters', () => {
        expect.assertions(1);
        const prop = 'method';
        class Foo {
          // biome-ignore lint/complexity/noUselessConstructor: simple test case
          constructor(_a: unknown, _b: unknown) {}
          [prop](this: void, _c: unknown, _d: unknown, _e: unknown) {}
        }
        const instance = new Foo(1, 2);
        expect(parameters(instance[prop])).toBe(3);
      });
    });
  });
  /* eslint-enable @typescript-eslint/lines-between-class-members, @typescript-eslint/no-empty-function, @typescript-eslint/no-extraneous-class, @typescript-eslint/no-invalid-void-type, @typescript-eslint/no-useless-constructor, class-methods-use-this */

  describe('native functions', () => {
    /* eslint-disable @typescript-eslint/unbound-method */
    const builtins: [text: string, func: (...args: never[]) => unknown, length: number][] = [
      ['Function', Function, 1],
      ['Object', Object, 1],
      ['Array', Array, 1],
      ['String', String, 1],
      ['Number', Number, 1],
      ['Boolean', Boolean, 1],
      ['Symbol', Symbol, 0],
      ['BigInt', BigInt, 1],
      // @ts-expect-error - Buffer is callable (obsolete and deprecated Node.js API)
      ['Buffer', Buffer, 3],
      // @ts-expect-error - explicit test case
      ['Function.prototype', Function.prototype, 0],
      ['Array.prototype.splice', Array.prototype.splice, 2],
      ['Array.prototype.reduce', Array.prototype.reduce, 1],
      ['Array.prototype.reduceRight', Array.prototype.reduceRight, 1],
      ['Function.prototype.apply', Function.prototype.apply, 2],
      ['Function.prototype.call', Function.prototype.call, 1],
      ['String.prototype.replace', String.prototype.replace, 2],
      ['String.prototype.split', String.prototype.split, 2],
      ['String.prototype.match', String.prototype.match, 1],
      ['RegExp.prototype.exec', RegExp.prototype.exec, 1],
      ['Number.parseInt', Number.parseInt, 2],
      ['Symbol.for', Symbol.for, 1],
      ['JSON.parse', JSON.parse, 2],
      ['JSON.stringify', JSON.stringify, 3],
      ['Math.max', Math.max, 2],
      ['Math.min', Math.min, 2],
      ['Date.now', Date.now, 0],
      ['Intl.NumberFormat', Intl.NumberFormat, 0],
      ['Intl.DateTimeFormat', Intl.DateTimeFormat, 0],
      ['setTimeout', setTimeout, 1],
      ['clearTimeout', clearTimeout, 1],
      ['setInterval', setInterval, 1],
      ['clearInterval', clearInterval, 1],
      ['setImmediate', setImmediate, 1],
      ['clearImmediate', clearImmediate, 1],
      ['fetch', fetch, 2],
    ];
    /* eslint-enable @typescript-eslint/unbound-method */

    test.each(builtins)('case %#: %s', (_, func, length) => {
      expect.assertions(3);
      const spy = spyOn(console, 'warn').mockImplementation(() => {});
      expect(parameters(func)).toBe(length);
      expect(spy).toBeCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(
        'Optional parameters cannot be determined for native functions',
      );
      spy.mockRestore();
    });
  });

  describe('non-functions', function closure(this: undefined) {
    const notFunctions: [text: string, value: unknown][] = [
      ['null', null],
      ['undefined', undefined],
      ['true', true],
      ['false', false],
      ['-1', -1],
      ['0', 0],
      ['1', 1],
      ['Number.MAX_VALUE', Number.MAX_VALUE],
      ['Number.POSITIVE_INFINITY', Number.POSITIVE_INFINITY],
      ['Number.NEGATIVE_INFINITY', Number.NEGATIVE_INFINITY],
      ['Number.NaN', Number.NaN],
      ["Symbol('sym')", Symbol('sym')],
      ['BigInt(1234)', BigInt(1234)],
      ['[]', []],
      ['{}', {}],
      ['<empty string>', ''],
      ['new Int8Array()', new Int8Array()],
      ['new Uint8Array()', new Uint8Array()],
      ['new Uint8ClampedArray()', new Uint8ClampedArray()],
      ['new Int16Array()', new Int16Array()],
      ['new Uint16Array()', new Uint16Array()],
      ['new Int32Array()', new Int32Array()],
      ['new Uint32Array()', new Uint32Array()],
      ['new Float32Array()', new Float32Array()],
      ['new Float64Array()', new Float64Array()],
      ['new BigInt64Array()', new BigInt64Array()],
      ['new BigUint64Array()', new BigUint64Array()],
      ['new Map()', new Map()],
      ['new Set()', new Set()],
      ['new WeakMap()', new WeakMap()],
      ['new WeakSet()', new WeakSet()],
      ['new Promise(() => {})', new Promise(() => {})],
      ['new Date()', new Date()],
      ['/(?:)/', /(?:)/],
      // biome-ignore lint/nursery/useErrorMessage: simple test case
      ['new Error()', new Error()], // eslint-disable-line unicorn/error-message
      ['Math', Math],
      ['JSON', JSON],
      ['Intl', Intl],
      ['Object.prototype', Object.prototype],
      ['Array.prototype', Array.prototype],
      ['String.prototype', String.prototype],
      ['Number.prototype', Number.prototype],
      ['Boolean.prototype', Boolean.prototype],
      ['Symbol.prototype', Symbol.prototype],
      ['BigInt.prototype', BigInt.prototype],
      ['console', console],
      ['window', window],
      ['document', document],
      ['chrome', chrome],
      ['process', process],
      ['global', global],
      ['globalThis', globalThis],
      // eslint-disable-next-line no-restricted-globals
      ['self', self],
      ['this', this],
      // biome-ignore lint/style/noArguments: explicit test case
      ['arguments', arguments], // eslint-disable-line prefer-rest-params
      ['new.target', new.target],

      // XXX: Although these are built-in classes, they have callable
      // constructors which make them functions when accessed directly.
      // ['Function', Function],
      // ['Object', Object],
      // ['Array', Array],
      // ['String', String],
      // ['Number', Number],
      // ['Boolean', Boolean],
      // ['Symbol', Symbol],
      // ['BigInt', BigInt],
      // ['Buffer', Buffer],
      // ['Function.prototype', Function.prototype],
    ] as const;

    test.each(notFunctions)('throws for %s', (_, value) => {
      expect.assertions(1);
      expect(() => parameters(value)).toThrow(new TypeError('Expected a function'));
    });
  });

  describe('built-in functions', () => {
    const builtIns: [text: string, value: unknown, length: number][] = [
      // biome-ignore lint/security/noGlobalEval: explicit test case
      ['eval', eval, 1], // eslint-disable-line no-eval
      ['fetch', fetch, 2],
      ['setTimeout', setTimeout, 1],
      ['clearTimeout', clearTimeout, 1],
      ['setInterval', setInterval, 1],
      ['clearInterval', clearInterval, 1],
      ['setImmediate', setImmediate, 1],
      ['clearImmediate', clearImmediate, 1],
      // eslint-disable-next-line unicorn/prefer-module
      ['require', require, 1],
    ];

    test.each(builtIns)('has expected count for %s', (_, value, length) => {
      expect.assertions(1);
      expect(parameters(value)).toBe(length);
    });
  });
});
