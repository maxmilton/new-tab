import { afterEach, expect, onTestFinished, test } from "bun:test";
import { cleanup, render } from "@maxmilton/test-utils/dom";
import type { Search as SearchComponent } from "#components/Search.ts";
import { chromeBookmarks, chromeTabs, DEFAULT_SECTION_ORDER, storage } from "#utils.ts";

// HACK: The Search component is designed to be rendered once (does not clone
// its view), for byte savings. Given its mutation of the view (affecting global
// state) when run, it's vital to reset its module state between tests to
// maintain accurate test conditions.
const MODULE_PATH = Bun.resolveSync("#components/Search.ts", ".");
const defaultTabsQuery = chromeTabs.query;
const defaultTopSitesGet = chrome.topSites.get;
const defaultRecentlyClosedGet = chrome.sessions.getRecentlyClosed;
const defaultHistorySearch = chrome.history.search;
const defaultBookmarksSearch = chromeBookmarks.search;

async function load(): Promise<typeof SearchComponent> {
  // Cache-bust the dynamic import so each test gets a fresh module instance.
  // oxlint-disable-next-line unicorn/no-await-expression-member typescript/no-unsafe-member-access typescript/no-unsafe-return
  return (await import(`${MODULE_PATH}?bust=${Bun.nanoseconds()}`)).Search;
}

afterEach(cleanup);

test("rendered DOM contains expected elements", async () => {
  expect.assertions(9);
  const Search = await load();
  const rendered = render(Search());
  await happyDOM.waitUntilComplete();
  const root = rendered.container.firstChild as HTMLElement;
  expect(root).toBeInstanceOf(window.HTMLDivElement);
  expect(root.id).toBe("c");
  const input = root.querySelector<HTMLInputElement>("input#s");
  expect(input).toBeTruthy();
  expect(root.firstChild).toBe(input);
  expect(input?.parentElement).toBe(root);
  expect(input?.type).toBe("search");
  expect(input?.placeholder).toBe("Search browser...");
  const icon = root.querySelector("svg#i");
  expect(icon).toBeTruthy();
  expect(icon?.parentElement).toBe(root);
});

test("rendered DOM matches snapshot", async () => {
  expect.assertions(1);
  const Search = await load();
  const rendered = render(Search());
  await happyDOM.waitUntilComplete();
  expect(rendered.container.getHTML()).toMatchSnapshot();
});

test("renders sections in the order given by storage.o", async () => {
  expect.assertions(1);
  storage.o = DEFAULT_SECTION_ORDER.toReversed();
  onTestFinished(() => {
    delete storage.o;
  });
  const Search = await load();
  const rendered = render(Search());
  await happyDOM.waitUntilComplete();
  const headings = [...rendered.container.querySelectorAll("h2")].map((h2) => h2.textContent);
  expect(headings).toEqual(storage.o);
});

test("renders open tabs, top sites, and recently closed tabs", async () => {
  expect.assertions(3);
  // @ts-expect-error - partial mock
  chromeTabs.query = (_query, callback) => {
    // @ts-expect-error - partial mock
    callback([{ id: 1, title: "Open tab", url: "https://tab.test" }]);
  };
  // @ts-expect-error - partial mock
  chrome.topSites.get = (callback) => {
    callback([{ title: "Top site", url: "https://top.test" }]);
  };
  // @ts-expect-error - partial mock
  chrome.sessions.getRecentlyClosed = (_options, callback) => {
    callback([
      { tab: { title: "Closed tab", url: "https://closed.test" } } as chrome.sessions.Session,
    ]);
  };
  onTestFinished(() => {
    chromeTabs.query = defaultTabsQuery;
    chrome.topSites.get = defaultTopSitesGet;
    chrome.sessions.getRecentlyClosed = defaultRecentlyClosedGet;
  });
  const Search = await load();
  const rendered = render(Search());
  await happyDOM.waitUntilComplete();
  expect(rendered.container.textContent).toInclude("Open tab");
  expect(rendered.container.textContent).toInclude("Top site");
  expect(rendered.container.textContent).toInclude("Closed tab");
});

test("renders matching history and bookmarks after typing", async () => {
  expect.assertions(2);
  // @ts-expect-error - partial mock
  chrome.history.search = (_query, callback) => {
    callback([{ id: "1", title: "Needle history", url: "https://history.test" }]);
  };
  // @ts-expect-error - partial mock
  chromeBookmarks.search = (_query, callback) => {
    // @ts-expect-error - callback mock
    callback([{ title: "Needle bookmark", url: "https://bookmark.test" }]);
  };
  onTestFinished(() => {
    chrome.history.search = defaultHistorySearch;
    chromeBookmarks.search = defaultBookmarksSearch;
  });
  const Search = await load();
  const rendered = render(Search());
  await happyDOM.waitUntilComplete();
  const input = rendered.container.querySelector("input#s") as HTMLInputElement;
  input.value = "foo";
  input.dispatchEvent(new window.Event("input"));
  expect(rendered.container.textContent).toInclude("Needle history");
  expect(rendered.container.textContent).toInclude("Needle bookmark");
});

test("clearing a query hides its history and bookmarks results", async () => {
  expect.assertions(2);
  // @ts-expect-error - partial mock
  chrome.history.search = (_query, callback) => {
    callback([{ id: "1", title: "Needle history", url: "https://history.test" }]);
  };
  // @ts-expect-error - partial mock
  chromeBookmarks.search = (_query, callback) => {
    // @ts-expect-error - callback mock
    callback([{ title: "Needle bookmark", url: "https://bookmark.test" }]);
  };
  onTestFinished(() => {
    chrome.history.search = defaultHistorySearch;
    chromeBookmarks.search = defaultBookmarksSearch;
  });
  const Search = await load();
  const rendered = render(Search());
  await happyDOM.waitUntilComplete();
  const root = rendered.container.firstChild as HTMLElement;
  const input = root.querySelector("input#s") as HTMLInputElement;
  input.value = "foo";
  input.dispatchEvent(new window.Event("input"));
  expect(root.textContent).toInclude("Needle history");
  input.value = "";
  input.dispatchEvent(new window.Event("input"));
  expect(root.textContent).not.toInclude("Needle history");
});

test("Escape clears the input and its results", async () => {
  expect.assertions(2);
  // @ts-expect-error - partial mock
  chrome.history.search = (_query, callback) => {
    callback([{ id: "1", title: "Needle history", url: "https://history.test" }]);
  };
  onTestFinished(() => {
    chrome.history.search = defaultHistorySearch;
  });
  const Search = await load();
  const rendered = render(Search());
  await happyDOM.waitUntilComplete();
  const root = rendered.container.firstChild as HTMLElement;
  const input = root.querySelector("input#s") as HTMLInputElement;
  input.value = "foo";
  input.dispatchEvent(new window.Event("input"));
  input.dispatchEvent(new window.KeyboardEvent("keyup", { key: "Escape" }));
  expect(input.value).toBe("");
  expect(root.textContent).not.toInclude("Needle history");
});
