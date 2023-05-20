import { GlobalWindow, type Window } from 'happy-dom';

declare global {
  // eslint-disable-next-line no-var, vars-on-top
  var happyDOM: Window['happyDOM'];
}

// Increase stack limit from 10 (v8 default)
global.Error.stackTraceLimit = 50;

const noop = () => {};
const noopAsync = () => Promise.resolve();
const noopAsyncObj = () => Promise.resolve({});
const noopAsyncArr = () => Promise.resolve([]);

function setupDOM() {
  const dom = new GlobalWindow();
  global.happyDOM = dom.happyDOM;
  // @ts-expect-error - happy-dom only implements a subset of the DOM API
  global.window = dom.window.document.defaultView;
  global.document = window.document;
  global.console = window.console;
  global.setTimeout = window.setTimeout;
  global.clearTimeout = window.clearTimeout;
  global.DocumentFragment = window.DocumentFragment;
  global.CSSStyleSheet = window.CSSStyleSheet;
}

function setupMocks(): void {
  global.chrome = {
    // @ts-expect-error - partial mock
    bookmarks: {
      getTree: noopAsyncArr,
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

export function reset(): void {
  setupDOM();
  setupMocks();
}

reset();
