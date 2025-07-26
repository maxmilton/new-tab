import "@maxmilton/test-utils/extend";

import { setupDOM } from "@maxmilton/test-utils/dom";

const noop = () => {};
const noopAsync = () => Promise.resolve();
const noopAsyncObj = () => Promise.resolve({});
const noopAsyncArr = () => Promise.resolve([]);

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
    runtime: {
      // @ts-expect-error - partial mock
      onInstalled: {
        addListener: noop,
      },
      // @ts-expect-error - partial mock
      onStartup: {
        addListener: noop,
      },
      openOptionsPage: noopAsync,
    },
    // @ts-expect-error - partial mock
    sessions: {
      getRecentlyClosed: noopAsyncArr,
    },
    storage: {
      // @ts-expect-error - partial mock
      local: {
        get: () => Promise.resolve({ t: "" }),
        remove: noopAsync,
        set: noopAsync,
      },
      // @ts-expect-error - partial mock
      sync: {
        clear: noopAsync,
        get: noopAsyncObj,
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

  setupDOM({
    url: "chrome-extension://cpcibnbdmpmcmnkhoiilpnlaepkepknb/",
  });
  setupMocks();
}

await reset();
