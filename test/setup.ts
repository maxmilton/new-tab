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
  // @ts-expect-error - partial mock
  global.chrome = {
    bookmarks: {
      getTree: noop,
      search: noop,
    },
    history: {
      search: noop,
    },
    runtime: {
      openOptionsPage: noop,
    },
    sessions: {
      getRecentlyClosed: noop,
    },
    storage: {
      local: {
        // eslint-disable-next-line consistent-return
        get: (_keys, callback) => {
          if (callback) {
            callback({});
          } else {
            return Promise.resolve({});
          }
        },
        remove: noop,
        set: noop,
      },
    },
    tabs: {
      create: noop,
      getCurrent: noop,
      onMoved: {
        addListener: noop,
      },
      onRemoved: {
        addListener: noop,
      },
      onUpdated: {
        addListener: noop,
      },
      query: noop,
      remove: noop,
      update: noop,
    },
    topSites: {
      get: noop,
    },
    windows: {
      getCurrent: noop,
      update: noop,
    },
    // TODO: Remove type cast + update mocks once we update to manifest v3
  } as typeof window.chrome;

  // Even though node v18 has native fetch, it fails to parse relative URLs
  // which are valid in browsers, so we need to mock it
  global.fetch = () =>
    // @ts-expect-error - just a simple stub
    Promise.resolve({
      json: () => Promise.resolve({}),
    });
}

export function reset(): void {
  setupDOM();
  setupMocks();
}

reset();
