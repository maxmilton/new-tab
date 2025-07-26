import { performanceSpy } from "@maxmilton/test-utils/spy";
import { afterEach, describe, expect, spyOn, test } from "bun:test";
import { reset } from "../setup.ts";

// Completely reset DOM and global state between tests
afterEach(reset);

const MODULE_PATH = Bun.resolveSync("./dist/sw.js", ".");

async function load(noMocks?: boolean) {
  if (!noMocks) {
    const originalFetch = global.fetch;

    // @ts-expect-error - monkey patching fetch for testing
    global.fetch = (input, init) => {
      if (input === "themes.json") {
        return Promise.resolve({
          json: () => Promise.resolve({}),
        });
      }
      return originalFetch(input, init);
    };

    chrome.runtime.onInstalled.addListener = (callback) => {
      callback({ reason: "install" as chrome.runtime.OnInstalledReason.INSTALL });
    };
    chrome.runtime.onStartup.addListener = (callback) => {
      callback();
    };
  }

  Loader.registry.delete(MODULE_PATH);
  await import(MODULE_PATH);
  await happyDOM.waitUntilComplete();
}

test("does not call any console methods", async () => {
  expect.assertions(1);
  await load();
  expect(happyDOM.virtualConsolePrinter.read()).toBeArrayOfSize(0);
});

test("does not call any performance methods", async () => {
  expect.hasAssertions(); // variable number of assertions
  const check = performanceSpy();
  await load();
  check();
});

test("does not call fetch() except themes.json", async () => {
  expect.assertions(1);
  const spy = spyOn(global, "fetch");
  await load();
  expect(spy).not.toHaveBeenCalled();
});

describe("onInstalled", () => {
  test("has listener", async () => {
    expect.assertions(1);
    const spy = spyOn(chrome.runtime.onInstalled, "addListener");
    await load(true);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  // TODO: Test with various settings.
  // TODO: More and better assertions.
});

describe("onStartup", () => {
  test("has listener", async () => {
    expect.assertions(1);
    const spy = spyOn(chrome.runtime.onStartup, "addListener");
    await load(true);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  // TODO: Test with various settings, especially sync enabled/disabled.
  // TODO: More and better assertions.
});
