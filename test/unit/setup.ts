import "@maxmilton/test-utils/extend";
import { setupDOM } from "@maxmilton/test-utils/dom";

function setupMocks(): void {
  // @ts-expect-error - noop stub
  global.performance.mark = () => {};
  // @ts-expect-error - noop stub
  global.performance.measure = () => {};

  global.chrome = {
    // @ts-expect-error - partial mock
    bookmarks: {
      getChildren: () => Promise.resolve([]),
      search: () => Promise.resolve([]),
    },
    // @ts-expect-error - partial mock
    history: {
      search: () => Promise.resolve([]),
    },
    runtime: {
      // @ts-expect-error - partial mock
      onInstalled: {
        addListener: () => {},
      },
      // @ts-expect-error - partial mock
      onStartup: {
        addListener: () => {},
      },
      openOptionsPage: () => Promise.resolve(),
    },
    // @ts-expect-error - partial mock
    sessions: {
      getRecentlyClosed: () => Promise.resolve([]),
    },
    storage: {
      // @ts-expect-error - partial mock
      local: {
        get: () => Promise.resolve({ t: "" }),
        remove: () => Promise.resolve(),
        set: () => Promise.resolve(),
      },
      // @ts-expect-error - partial mock
      sync: {
        clear: () => Promise.resolve(),
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
        addListener: () => {},
      },
      // @ts-expect-error - partial mock
      onRemoved: {
        addListener: () => {},
      },
      // @ts-expect-error - partial mock
      onUpdated: {
        addListener: () => {},
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

export async function reset(): Promise<void> {
  // oxlint-disable-next-line typescript/no-unnecessary-condition
  if (global.happyDOM) {
    await happyDOM.abort();
    window.close();
  }

  setupDOM({ url: "chrome-extension://cpcibnbdmpmcmnkhoiilpnlaepkepknb/" });
  setupMocks();
}

await reset();
