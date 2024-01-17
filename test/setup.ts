import { expect } from 'bun:test';
import { GlobalWindow, type Window } from 'happy-dom';

declare global {
  /** Real bun console. `console` is mapped to happy-dom's virtual console. */
  // eslint-disable-next-line no-var, vars-on-top
  var console2: Console;
  // eslint-disable-next-line no-var, vars-on-top
  var happyDOM: Window['happyDOM'];
}

declare module 'bun:test' {
  interface Matchers {
    /** Asserts that a value is a plain `object`. */
    toBePlainObject(): void;
  }
}

expect.extend({
  // XXX: Although bun has a `toBeObject` matcher, it's not as useful since it
  // doesn't check for plain objects.
  toBePlainObject(received: unknown) {
    return Object.prototype.toString.call(received) === '[object Object]'
      ? { pass: true }
      : {
          pass: false,
          message: () => `expected ${String(received)} to be a plain object`,
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
  global.console2 = originalConsole;
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
      openOptionsPage: noop,
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
