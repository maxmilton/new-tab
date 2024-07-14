/* eslint-disable @typescript-eslint/no-unused-vars, no-console, unicorn/consistent-function-scoping */

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
    /(?:)/,
    new Date(),
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
    // biome-ignore lint/style/useNumberNamespace: for tests
    NaN, // eslint-disable-line unicorn/prefer-number-properties
    // biome-ignore lint/style/useNumberNamespace: for tests
    Infinity,
  ];

  test.each(plainObjects)('matches plain object %#', (item) => {
    expect.assertions(1);
    expect(item).toBePlainObject();
  });

  test.each(nonPlainObjects)('does not match non-plain object %#', (item) => {
    expect.assertions(1);
    expect(item).not.toBePlainObject();
  });

  test.each(nonObjects)('does not match non-object %#', (item) => {
    expect.assertions(1);
    expect(item).not.toBePlainObject();
  });
});

describe('matcher: toHaveParameters', () => {
  const funcs: [func: unknown, required: number, optional: number][] = [
    [() => {}, 0, 0],
    [(_a: unknown) => {}, 1, 0],
    [(_a = 1) => {}, 0, 1],
    [(_a: unknown, _b: unknown) => {}, 2, 0],
    [(_a: unknown, _b = 1) => {}, 1, 1],
    [(_a = 1, _b = 2) => {}, 0, 2],
  ];

  test.each(funcs)(
    'matches function with %i required and %i optional parameters',
    (func, required, optional) => {
      expect.assertions(1);
      expect(func).toHaveParameters(required, optional);
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
    expect.assertions(1);
    expect(reset).toBeFunction();
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
  test('throws when passed non-function', () => {
    expect.assertions(1);
    expect(() => parameters(null)).toThrow(new TypeError('Expected a function'));
  });

  describe('no parameters', () => {
    test('simple', () => {
      expect.assertions(1);
      function foo() {}
      expect(parameters(foo)).toBe(0);
    });

    test('arrow function', () => {
      expect.assertions(1);
      const foo = () => {};
      expect(parameters(foo)).toBe(0);
    });
  });

  describe('default parameters', () => {
    test('simple', () => {
      expect.assertions(1);
      function foo(_a = 1, _b = 2) {}
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
      // eslint-disable-next-line unicorn/no-object-as-default-parameter
      function foo(_a = { x: 1, y: 2 }, _b = [1, 2, 3], _c = () => {}) {}
      expect(parameters(foo)).toBe(3);
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
    test('simple', () => {
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

    test('function expression', () => {
      expect.assertions(1);
      // biome-ignore lint/complexity/useArrowFunction: explicit test case
      const bar = function (_a: unknown, _b: unknown) {}; // eslint-disable-line func-names
      expect(parameters(bar)).toBe(2);
    });

    test('arrow function expression', () => {
      expect.assertions(1);
      const bar = (_a: unknown, _b: unknown) => {};
      expect(parameters(bar)).toBe(2);
    });

    test('function declaration', () => {
      expect.assertions(1);
      function baz(_a: unknown, _b: unknown) {}
      expect(parameters(baz)).toBe(2);
    });
  });

  describe('native functions', () => {
    /* eslint-disable @typescript-eslint/unbound-method */
    const builtins: [text: string, func: (...args: never[]) => unknown, length: number][] = [
      ['Array.prototype.splice', Array.prototype.splice, 2],
      ['Array.prototype.reduce', Array.prototype.reduce, 1],
      ['Array.prototype.reduceRight', Array.prototype.reduceRight, 1],
      ['Function.prototype.apply', Function.prototype.apply, 2],
      ['Function.prototype.call', Function.prototype.call, 1],
      ['String.prototype.replace', String.prototype.replace, 2],
      ['String.prototype.split', String.prototype.split, 2],
      ['String.prototype.match', String.prototype.match, 1],
      ['RegExp.prototype.exec', RegExp.prototype.exec, 1],
      ['JSON.parse', JSON.parse, 2],
      ['JSON.stringify', JSON.stringify, 3],
      ['Math.max', Math.max, 2],
      ['Math.min', Math.min, 2],
      ['Date.now', Date.now, 0],
      ['Intl.NumberFormat', Intl.NumberFormat, 0],
      ['Intl.DateTimeFormat', Intl.DateTimeFormat, 0],
      ['setTimeout', setTimeout, 1],
      ['setInterval', setInterval, 1],
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
});
