import "@maxmilton/test-utils/extend";
import { setupDOM } from "@maxmilton/test-utils/dom";

function asyncReturn<T>(value: T) {
  function call(...args: [...unknown[], (result: T) => void]): void;
  function call(...args: unknown[]): Promise<T>;
  function call(...args: unknown[]): Promise<T> | undefined {
    const callback = args.at(-1);

    if (typeof callback === "function") {
      // oxlint-disable-next-line promise/prefer-await-to-callbacks
      (callback as (result: T) => void)(value);
      return;
    }

    return Promise.resolve(value);
  }

  return call;
}

function setupMocks(): void {
  // @ts-expect-error - noop stub
  global.performance.mark = () => {};
  // @ts-expect-error - noop stub
  global.performance.measure = () => {};

  // oxlint-disable-next-line unicorn/no-useless-undefined
  const noReturnValue = asyncReturn(undefined);

  global.chrome = {
    // @ts-expect-error - partial mock
    bookmarks: {
      getChildren: asyncReturn<chrome.bookmarks.BookmarkTreeNode[]>([]),
      search: asyncReturn<chrome.bookmarks.BookmarkTreeNode[]>([]),
    },
    // @ts-expect-error - partial mock
    history: {
      search: asyncReturn<chrome.history.HistoryItem[]>([]),
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
      openOptionsPage: noReturnValue,
    },
    // @ts-expect-error - partial mock
    sessions: {
      getRecentlyClosed: asyncReturn<chrome.sessions.Session[]>([]),
    },
    storage: {
      // @ts-expect-error - partial mock
      local: {
        get: asyncReturn({ t: "" }),
        remove: noReturnValue,
        set: noReturnValue,
      },
      // @ts-expect-error - partial mock
      sync: {
        clear: noReturnValue,
        get: asyncReturn({}),
        remove: noReturnValue,
        set: noReturnValue,
      },
    },
    tabs: {
      // @ts-expect-error - partial mock
      create: asyncReturn({}),
      // @ts-expect-error - partial mock
      getCurrent: asyncReturn({}),
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
      query: asyncReturn<chrome.tabs.Tab[]>([]),
      remove: noReturnValue,
      // @ts-expect-error - partial mock
      update: asyncReturn<chrome.tabs.Tab>({}),
    },
    topSites: {
      get: asyncReturn<chrome.topSites.MostVisitedURL[]>([]),
    },
    windows: {
      // @ts-expect-error - partial mock
      update: asyncReturn({}),
    },
  };
}

export async function reset(): Promise<void> {
  // oxlint-disable-next-line typescript/no-unnecessary-condition
  if (global.happyDOM) {
    await happyDOM.abort();
    // oxlint-disable-next-line typescript/no-unnecessary-condition
    window?.close();
  }

  setupDOM({ url: "chrome-extension://cpcibnbdmpmcmnkhoiilpnlaepkepknb/" });
  setupMocks();
}

await reset();
