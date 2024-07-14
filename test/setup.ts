import { expect } from 'bun:test';
import { GlobalWindow, type Window } from 'happy-dom';

/* eslint-disable no-var, vars-on-top */
declare global {
  /** Real bun console. `console` is mapped to happy-dom's virtual console. */
  var $console: Console;
  var happyDOM: Window['happyDOM'];
}
/* eslint-enable */

/**
 * Get the total number of parameters of a function including optional
 * parameters with default values.
 *
 * @remarks Native functions will only return the number of required parameters;
 * optional parameters cannot be determined.
 *
 * @returns The number of parameters, including optional parameters.
 */
export function parameters(func: unknown): number {
  if (typeof func !== 'function') {
    throw new TypeError('Expected a function');
  }

  const str = func.toString();
  const len = str.length;
  const start = str.indexOf('(');
  let index = start;
  let count = 1;
  let nested = 0;
  let char: string;

  // FIXME: Handle nested string template literals.
  const string = (quote: '"' | "'" | '`') => {
    while (index++ < len) {
      char = str[index];

      if (char === quote) {
        break;
      }
      // skip escaped characters
      if (char === '\\') {
        index++;
      }
    }
  };

  while (index++ < len) {
    char = str[index];

    if (!nested) {
      if (char === ')') {
        break;
      }
      if (char === ',') {
        count++;
        continue; // eslint-disable-line no-continue
      }
    }

    switch (char) {
      case '"':
      case "'":
      case '`':
        string(char);
        break;
      case '(':
      case '[':
      case '{':
        nested++;
        break;
      case ')':
      case ']':
      case '}':
        nested--;
        break;
      default:
        break;
    }
  }

  if (index >= len || nested !== 0) {
    throw new Error('Invalid function signature');
  }

  // handle no parameters
  if (str.slice(start + 1, index).trim().length === 0) {
    // eslint-disable-next-line @typescript-eslint/prefer-includes
    if (str.indexOf('[native code]', index) >= 0) {
      count = func.length;
      // eslint-disable-next-line no-console
      console.warn('Optional parameters cannot be determined for native functions');
    } else {
      count = 0;
    }
  }

  return count;
}

declare module 'bun:test' {
  interface Matchers {
    /** Asserts that a value is a plain `object`. */
    toBePlainObject(): void;
    /** Asserts that a value is a `class`. */
    toBeClass(): void;
    /** Asserts that a function has a specific number of parameters. */
    toHaveParameters(required: number, optional: number): void;
  }
}

expect.extend({
  // XXX: Bun's `toBeObject` matcher is the equivalent of `typeof x === 'object'`.
  toBePlainObject(received: unknown) {
    return Object.prototype.toString.call(received) === '[object Object]'
      ? { pass: true }
      : {
          pass: false,
          message: () => `expected ${String(received)} to be a plain object`,
        };
  },

  toBeClass(received: unknown) {
    return typeof received === 'function' &&
      /^class\s/.test(Function.prototype.toString.call(received))
      ? { pass: true }
      : {
          pass: false,
          message: () => `expected ${String(received)} to be a class`,
        };
  },

  toHaveParameters(received: unknown, required: number, optional: number) {
    if (typeof received !== 'function') {
      return {
        pass: false,
        message: () => `expected ${String(received)} to be a function`,
      };
    }

    const actualRequired = received.length;
    const actualOptional = parameters(received) - actualRequired;

    return actualRequired === required && actualOptional === optional
      ? { pass: true }
      : {
          pass: false,
          message: () =>
            `expected ${received.name} to have ${required}/${optional} required/optional parameters, but it has ${actualRequired}/${actualOptional}`,
        };
  },
});

export const originalConsoleCtor = global.console.Console;

const originalConsole = global.console;
const noop = () => {};
const noopAsync = () => Promise.resolve();
const noopAsyncObj = () => Promise.resolve({});
const noopAsyncArr = () => Promise.resolve([]);

function setupDOM() {
  const dom = new GlobalWindow({
    url: 'chrome-extension://cpcibnbdmpmcmnkhoiilpnlaepkepknb/',
  });
  global.happyDOM = dom.happyDOM;
  global.$console = originalConsole;
  // @ts-expect-error - happy-dom only implements a subset of the DOM API
  global.window = dom.window.document.defaultView;
  global.document = window.document;
  global.console = window.console; // https://github.com/capricorn86/happy-dom/wiki/Virtual-Console
  global.fetch = window.fetch;
  global.setTimeout = window.setTimeout;
  global.clearTimeout = window.clearTimeout;
  global.DocumentFragment = window.DocumentFragment;
  global.CSSStyleSheet = window.CSSStyleSheet;
  global.Text = window.Text;
}

function setupMocks(): void {
  // @ts-expect-error - noop stub
  global.performance.mark = noop;
  // @ts-expect-error - noop stub
  global.performance.measure = noop;

  global.chrome = {
    // @ts-expect-error - partial mock
    bookmarks: {
      getChildren: noopAsyncArr,
      search: noopAsyncArr,
    },
    // @ts-expect-error - partial mock
    history: {
      search: noopAsyncArr,
    },
    // @ts-expect-error - partial mock
    runtime: {
      openOptionsPage: noopAsync,
    },
    // @ts-expect-error - partial mock
    sessions: {
      getRecentlyClosed: noopAsyncArr,
    },
    storage: {
      // @ts-expect-error - partial mock
      local: {
        get: () => Promise.resolve({ t: '' }),
        remove: noopAsync,
        set: noopAsync,
      },
    },
    tabs: {
      // @ts-expect-error - partial mock
      create: noopAsyncObj,
      // @ts-expect-error - partial mock
      getCurrent: noopAsyncObj,
      // @ts-expect-error - partial mock
      onMoved: {
        addListener: noop,
      },
      // @ts-expect-error - partial mock
      onRemoved: {
        addListener: noop,
      },
      // @ts-expect-error - partial mock
      onUpdated: {
        addListener: noop,
      },
      query: noopAsyncArr,
      remove: noopAsync,
      // @ts-expect-error - partial mock
      update: noopAsyncObj,
    },
    topSites: {
      get: noopAsyncArr,
    },
    windows: {
      // @ts-expect-error - partial mock
      getCurrent: noopAsyncObj,
      // @ts-expect-error - partial mock
      update: noopAsync,
    },
  };
}

export async function reset(): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (global.happyDOM) {
    await happyDOM.abort();
    window.close();
  }

  setupDOM();
  setupMocks();
}

await reset();
