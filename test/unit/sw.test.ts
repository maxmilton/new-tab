import { afterEach, describe, expect, spyOn, test } from "bun:test";
import { performanceSpy } from "@maxmilton/test-utils/spy";
import type { SyncStorageData, UserStorageData } from "#types.ts";
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
  // @ts-expect-error - monkey patch fetch for testing
  global.fetch = (input: RequestInfo | URL) => {
    if (input === "themes.json") {
      return Promise.resolve(Response.json(themes));
    }
    // oxlint-disable-next-line typescript/no-base-to-string typescript/restrict-template-expressions
    throw new Error(`Unexpected fetch call: ${input}`);
  };
}

test("does not call any console methods", async () => {
  expect.assertions(1);
  await load();
  expect(happyDOM.virtualConsolePrinter.read()).toBeArrayOfSize(0);
});

test("does not call any performance methods", async () => {
  expect.hasAssertions(); // variable amount of assertions
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
  test("calls listener on load", async () => {
    expect.assertions(1);
    using spy = spyOn(chrome.runtime.onInstalled, "addListener");
    await load();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  test("listener returns a promise", async () => {
    expect.assertions(1);
    mockThemes();
    const listener = await loadInstall();
    expect(listener()).toHaveProperty("then", expect.any(Function));
  });

  test("does not call any console methods", async () => {
    expect.assertions(1);
    mockThemes();
    const listener = await loadInstall();
    await listener();
    expect(happyDOM.virtualConsolePrinter.read()).toBeArrayOfSize(0);
  });

  test("does not call any performance methods", async () => {
    expect.hasAssertions(); // variable amount of assertions
    mockThemes();
    const listener = await loadInstall();
    const check = performanceSpy();
    await listener();
    check();
  });

  test("does not call fetch() except themes.json", async () => {
    expect.assertions(2);
    mockThemes();
    const listener = await loadInstall();
    using spy = spyOn(global, "fetch");
    await listener();
    expect(spy).toHaveBeenCalledWith("themes.json");
    expect(spy).toHaveBeenCalledTimes(1);
  });

  test("migrates old tn storage key to n and removes it", async () => {
    expect.assertions(2);
    const settings: UserStorageData & { tn?: string } = { tn: "dark" };
    // oxlint-disable-next-line require-await
    chrome.storage.local.get = async (key) =>
      // oxlint-disable-next-line vitest/no-conditional-in-test
      key === "tn" ? { tn: settings.tn } : { n: settings.n };
    // oxlint-disable-next-line require-await
    using setSpy = spyOn(chrome.storage.local, "set").mockImplementation(async (items) => {
      Object.assign(settings, items);
    });
    using removeSpy = spyOn(chrome.storage.local, "remove");
    mockThemes({ dark: "CSS_DARK" });
    const listener = await loadInstall();
    await listener();
    expect(setSpy).toHaveBeenCalledWith({ n: "dark" });
    expect(removeSpy).toHaveBeenCalledWith("tn");
  });

  test("does not migrate when tn is absent", async () => {
    expect.assertions(1);
    // oxlint-disable-next-line require-await
    chrome.storage.local.get = async () => ({ n: "dark" }) satisfies UserStorageData;
    using removeSpy = spyOn(chrome.storage.local, "remove");
    mockThemes({ dark: "CSS_DARK" });
    const listener = await loadInstall();
    await listener();
    expect(removeSpy).not.toHaveBeenCalled();
  });

  test("migrates rich-dark theme name to dark", async () => {
    expect.assertions(1);
    // oxlint-disable-next-line require-await
    chrome.storage.local.get = async () => ({ n: "rich-dark" }) satisfies UserStorageData;
    using setSpy = spyOn(chrome.storage.local, "set");
    mockThemes({ dark: "CSS_DARK" });
    const listener = await loadInstall();
    await listener();
    expect(setSpy).toHaveBeenCalledWith({ n: "dark" });
  });

  test("preloads theme CSS for the current theme name", async () => {
    expect.assertions(1);
    // oxlint-disable-next-line require-await
    chrome.storage.local.get = async () => ({ n: "dark" }) satisfies UserStorageData;
    using setSpy = spyOn(chrome.storage.local, "set");
    mockThemes({ auto: "CSS_AUTO", dark: "CSS_DARK" });
    const listener = await loadInstall();
    await listener();
    expect(setSpy).toHaveBeenCalledWith({ t: "CSS_DARK" });
  });

  test('preloads "auto" theme CSS when no theme name is stored', async () => {
    expect.assertions(1);
    // oxlint-disable-next-line require-await
    chrome.storage.local.get = async () => ({});
    using setSpy = spyOn(chrome.storage.local, "set");
    mockThemes({ auto: "CSS_AUTO" });
    const listener = await loadInstall();
    await listener();
    expect(setSpy).toHaveBeenCalledWith({ t: "CSS_AUTO" });
  });
});

describe("onStartup", () => {
  test("calls listener on load", async () => {
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
    expect.hasAssertions(); // variable amount of assertions
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
    chrome.storage.local.get = ((_keys, callback) => {
      callback({ n: "dark", s: false });
    }) as typeof chrome.storage.local.get<UserStorageData>;
    using syncGetSpy = spyOn(chrome.storage.sync, "get");
    const listener = await loadStartup();
    listener();
    expect(syncGetSpy).not.toHaveBeenCalled();
  });

  test("does nothing when sync is enabled but no remote data exists", async () => {
    expect.assertions(1);
    chrome.storage.local.get = ((_keys, callback) => {
      callback({ n: "dark", s: true });
    }) as typeof chrome.storage.local.get<UserStorageData>;
    chrome.storage.sync.get = ((callback: (items: SyncStorageData) => void) => {
      callback({});
    }) as typeof chrome.storage.sync.get<SyncStorageData>;
    using setSpy = spyOn(chrome.storage.local, "set");
    const listener = await loadStartup();
    listener();
    expect(setSpy).not.toHaveBeenCalled();
  });

  test("merges remote settings directly when remote theme name matches local", async () => {
    expect.assertions(1);
    const remoteData = { b: false, n: "dark" } satisfies SyncStorageData["data"];
    chrome.storage.local.get = ((_keys, callback) => {
      callback({ n: "dark", s: true });
    }) as typeof chrome.storage.local.get<UserStorageData>;
    chrome.storage.sync.get = ((callback: (items: SyncStorageData) => void) => {
      callback({ data: remoteData, ts: 1 });
    }) as typeof chrome.storage.sync.get<SyncStorageData>;
    using setSpy = spyOn(chrome.storage.local, "set");
    const listener = await loadStartup();
    listener();
    expect(setSpy).toHaveBeenCalledWith(remoteData);
  });

  // TODO: Test a differing remote theme after sw.ts preloads CSS from remote n.
});
