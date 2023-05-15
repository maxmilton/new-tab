import { GlobalWindow, type Window } from 'happy-dom';

declare global {
  // eslint-disable-next-line no-var, vars-on-top
  var happyDOM: Window['happyDOM'];
}

// increase limit from 10
global.Error.stackTraceLimit = 100;

function noop() {}

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
      getTree: () => Promise.resolve([]),
      search: () => Promise.resolve([]),
    },
    // @ts-expect-error - partial mock
    history: {
      // // @ts-expect-error - stub
      search: () => Promise.resolve([]),
    },
    // @ts-expect-error - partial mock
    runtime: {
      openOptionsPage: noop,
    },
    // @ts-expect-error - partial mock
    sessions: {
      getRecentlyClosed: () => Promise.resolve([]),
    },
    storage: {
      // @ts-expect-error - partial mock
      local: {
        get: () => Promise.resolve({}),
        remove: () => Promise.resolve(),
        set: () => Promise.resolve(),
      },
    },
    tabs: {
      // @ts-expect-error - partial mock
      create: () => Promise.resolve({}),
      // @ts-expect-error - partial mock
      getCurrent: () => Promise.resolve({}),
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
      query: () => Promise.resolve([]),
      remove: () => Promise.resolve(),
      // @ts-expect-error - partial mock
      update: () => Promise.resolve({}),
    },
    topSites: {
      get: () => Promise.resolve([]),
    },
    windows: {
      // @ts-expect-error - partial mock
      getCurrent: () => Promise.resolve({}),
      // @ts-expect-error - partial mock
      update: () => Promise.resolve(),
    },
  };
}

export function reset(): void {
  setupDOM();
  setupMocks();
}

reset();
