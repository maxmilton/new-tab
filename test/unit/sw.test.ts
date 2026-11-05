import { afterEach, describe, expect, spyOn, test } from "bun:test";
import { performanceSpy } from "@maxmilton/test-utils/spy";
import type { SyncStorageData } from "#/types.ts";
import { reset } from "../setup.ts";

afterEach(reset);

const MODULE_PATH = Bun.resolveSync("./dist/sw.js", ".");

async function load() {
  window.close();
  // @ts-expect-error - service workers have no window
  global.window = undefined;
  // @ts-expect-error - service workers have no document
  global.document = undefined;

  // Cache-bust the dynamic import so each test gets a fresh module instance.
  await import(`${MODULE_PATH}?bust=${Bun.nanoseconds()}`);
}

async function loadInstall() {
  let listener: (() => void | Promise<void>) | undefined;
  chrome.runtime.onInstalled.addListener = (callback) => {
    // oxlint-disable-next-line typescript/no-confusing-void-expression
    listener = () => callback({ reason: "install" });
  };
  await load();
  if (!listener) throw new Error("Missing install listener");
  return listener;
}

async function loadStartup() {
  let listener: (() => void) | undefined;
  chrome.runtime.onStartup.addListener = (callback) => {
    listener = callback;
  };
  await load();
  if (!listener) throw new Error("Missing startup listener");
  return listener;
}

function mockThemes(themes: Record<string, string> = {}) {
  return spyOn(global, "fetch").mockImplementation(((input: RequestInfo | URL) => {
    if (input === "themes.json") {
      return Promise.resolve(Response.json(themes));
    }
    // oxlint-disable-next-line typescript/no-base-to-string typescript/restrict-template-expressions
    throw new Error(`Unexpected fetch call: ${input}`);
  }) as typeof fetch);
}

type Items = Record<string, unknown>;

/** In-memory `chrome.storage.local` with Chrome's get/set/remove semantics. */
function fakeLocalStorage(initial: Items) {
  const { local } = chrome.storage;
  const state: Items = { ...initial };
  const pick = (keys?: string | string[] | null): Items => {
    if (keys === undefined || keys === null) return { ...state };
    const items: Items = {};
    for (const key of [keys].flat()) if (key in state) items[key] = state[key];
    return items;
  };
  const stack = new DisposableStack();
  stack.use(
    spyOn(local, "get").mockImplementation(((
      keys?: string | string[] | null | ((items: Items) => void),
      callback?: (items: Items) => void,
    ) => {
      if (typeof keys === "function") {
        keys(pick());
        // oxlint-disable-next-line unicorn/no-useless-undefined
        return undefined;
      }
      const items = pick(keys);
      if (callback) {
        callback(items);
        // oxlint-disable-next-line unicorn/no-useless-undefined
        return undefined;
      }
      return Promise.resolve(items);
    }) as typeof local.get),
  );
  const set = stack.use(
    spyOn(local, "set").mockImplementation((items: Items) => {
      Object.assign(state, items);
      return Promise.resolve();
    }),
  );
  const remove = stack.use(
    spyOn(local, "remove").mockImplementation((keys: string | string[]) => {
      // oxlint-disable-next-line typescript/no-dynamic-delete
      for (const key of [keys].flat()) delete state[key];
      return Promise.resolve();
    }),
  );
  return {
    state,
    set,
    remove,
    [Symbol.dispose]() {
      stack.dispose();
    },
  };
}

function mockSyncGet(remote: SyncStorageData) {
  return spyOn(chrome.storage.sync, "get").mockImplementation(((
    callback: (items: SyncStorageData) => void,
  ) => {
    callback(remote);
  }) as typeof chrome.storage.sync.get);
}

describe.serial("sw", () => {
  test("does not call any console methods", async () => {
    expect.assertions(1);
    await load();
    expect(happyDOM.virtualConsolePrinter.read()).toBeArrayOfSize(0);
  });

  test("does not call any performance methods", async () => {
    expect.assertions(10); // one per spied performance method
    const check = performanceSpy();
    await load();
    check();
  });

  test("does not call fetch()", async () => {
    expect.assertions(1);
    using spy = spyOn(global, "fetch");
    await load();
    expect(spy).toHaveBeenCalledTimes(0);
  });

  describe("onInstalled", () => {
    test("registers one listener on load", async () => {
      expect.assertions(1);
      using spy = spyOn(chrome.runtime.onInstalled, "addListener");
      await load();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    test("listener returns a promise", async () => {
      expect.assertions(1);
      using _ = mockThemes();
      const listener = await loadInstall();
      const result = listener();
      expect(result).toHaveProperty("then", expect.any(Function));
      await result; // let the listener finish before `using` restores fetch
    });

    test("does not call any console methods", async () => {
      expect.assertions(1);
      using _ = mockThemes();
      const listener = await loadInstall();
      await listener();
      expect(happyDOM.virtualConsolePrinter.read()).toBeArrayOfSize(0);
    });

    test("does not call any performance methods", async () => {
      expect.assertions(10); // one per spied performance method
      using _ = mockThemes();
      const listener = await loadInstall();
      const check = performanceSpy();
      await listener();
      check();
    });

    test("does not call fetch() except themes.json", async () => {
      expect.assertions(2);
      using spy = mockThemes();
      const listener = await loadInstall();
      await listener();
      expect(spy).toHaveBeenCalledWith("themes.json");
      expect(spy).toHaveBeenCalledTimes(1);
    });

    test("copies old tn storage key to n", async () => {
      expect.assertions(2);
      using storage = fakeLocalStorage({ tn: "dark" });
      using _ = mockThemes({ dark: "CSS_DARK" });
      const listener = await loadInstall();
      await listener();
      expect(storage.set).toHaveBeenCalledWith({ n: "dark" });
      expect(storage.state).toHaveProperty("n", "dark");
    });

    test("removes old tn storage key", async () => {
      expect.assertions(2);
      using storage = fakeLocalStorage({ tn: "dark" });
      using _ = mockThemes({ dark: "CSS_DARK" });
      const listener = await loadInstall();
      await listener();
      expect(storage.remove).toHaveBeenCalledWith("tn");
      expect(storage.state).not.toHaveProperty("tn");
    });

    test("does not migrate when tn is absent", async () => {
      expect.assertions(1);
      using storage = fakeLocalStorage({ n: "dark" });
      using _ = mockThemes({ dark: "CSS_DARK" });
      const listener = await loadInstall();
      await listener();
      expect(storage.remove).not.toHaveBeenCalled();
    });

    test("migrates rich-dark theme name to dark", async () => {
      expect.assertions(2);
      using storage = fakeLocalStorage({ n: "rich-dark" });
      using _ = mockThemes({ dark: "CSS_DARK" });
      const listener = await loadInstall();
      await listener();
      expect(storage.set).toHaveBeenCalledWith({ n: "dark" });
      expect(storage.state).toHaveProperty("n", "dark");
    });

    test("preloads theme CSS for the current theme name", async () => {
      expect.assertions(2);
      using storage = fakeLocalStorage({ n: "dark" });
      using _ = mockThemes({ auto: "CSS_AUTO", dark: "CSS_DARK" });
      const listener = await loadInstall();
      await listener();
      expect(storage.set).toHaveBeenCalledWith({ t: "CSS_DARK" });
      expect(storage.state).toHaveProperty("t", "CSS_DARK");
    });

    test('preloads "auto" theme CSS when no theme name is stored', async () => {
      expect.assertions(2);
      using storage = fakeLocalStorage({});
      using _ = mockThemes({ auto: "CSS_AUTO" });
      const listener = await loadInstall();
      await listener();
      expect(storage.set).toHaveBeenCalledWith({ t: "CSS_AUTO" });
      expect(storage.state).toHaveProperty("t", "CSS_AUTO");
    });
  });

  describe("onStartup", () => {
    test("registers one listener on load", async () => {
      expect.assertions(1);
      using spy = spyOn(chrome.runtime.onStartup, "addListener");
      await load();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    test("does not call any console methods", async () => {
      expect.assertions(1);
      const listener = await loadStartup();
      listener();
      expect(happyDOM.virtualConsolePrinter.read()).toBeArrayOfSize(0);
    });

    test("does not call any performance methods", async () => {
      expect.assertions(10); // one per spied performance method
      const check = performanceSpy();
      const listener = await loadStartup();
      listener();
      check();
    });

    test("does not call fetch() when no settings", async () => {
      expect.assertions(1);
      using spy = spyOn(global, "fetch");
      const listener = await loadStartup();
      listener();
      expect(spy).toHaveBeenCalledTimes(0);
    });

    test("does nothing when sync is disabled", async () => {
      expect.assertions(1);
      using _ = fakeLocalStorage({ n: "dark", s: false });
      using syncGetSpy = spyOn(chrome.storage.sync, "get");
      const listener = await loadStartup();
      listener();
      expect(syncGetSpy).not.toHaveBeenCalled();
    });

    test("does nothing when sync is enabled but no remote data exists", async () => {
      expect.assertions(1);
      using storage = fakeLocalStorage({ n: "dark", s: true });
      using _ = mockSyncGet({});
      const listener = await loadStartup();
      listener();
      expect(storage.set).not.toHaveBeenCalled();
    });

    test("merges remote settings directly when remote theme name matches local", async () => {
      expect.assertions(2);
      const remoteData = { b: false, n: "dark" } satisfies SyncStorageData["data"];
      using storage = fakeLocalStorage({ n: "dark", s: true });
      using _ = mockSyncGet({ data: remoteData, ts: 1 });
      const listener = await loadStartup();
      listener();
      expect(storage.set).toHaveBeenCalledWith(remoteData);
      expect(storage.state).toEqual({ b: false, n: "dark", s: true });
    });

    // TODO: Test a differing remote theme after sw.ts preloads CSS from remote n.
  });
});
