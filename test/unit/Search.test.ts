import { afterEach, describe, expect, onTestFinished, spyOn, test } from "bun:test";
import { cleanup, render } from "@maxmilton/test-utils/dom";
import type { Search as SearchComponent } from "#/components/Search.ts";
import { chromeBookmarks, chromeTabs, DEFAULT_SECTION_ORDER, storage } from "#/utils.ts";

// HACK: The Search component is designed to be rendered once (does not clone
// its view), for byte savings. Given its mutation of the view (affecting global
// state) when run, it's vital to reset its module state between tests to
// maintain accurate test conditions.
const MODULE_PATH = Bun.resolveSync("#/components/Search.ts", ".");

async function load(): Promise<typeof SearchComponent> {
  // Cache-bust the dynamic import so each test gets a fresh module instance.
  // oxlint-disable-next-line unicorn/no-await-expression-member typescript/no-unsafe-member-access typescript/no-unsafe-return
  return (await import(`${MODULE_PATH}?bust=${Bun.nanoseconds()}`)).Search;
}

async function renderSearch(): Promise<HTMLElement> {
  const Search = await load();
  const rendered = render(Search());
  await happyDOM.waitUntilComplete();
  return rendered.container.firstChild as HTMLElement;
}

/** Link texts in the section titled `name`. */
function sectionTexts(root: HTMLElement, name: string): (string | null)[] {
  const heading = [...root.querySelectorAll("h2")].find((h2) => h2.textContent === name);
  return Array.from(
    heading?.parentElement?.querySelectorAll("a") ?? [],
    (link) => link.textContent,
  );
}

/** Like Chrome, returns results only for a matching query. */
const mockHistory = () =>
  spyOn(chrome.history, "search").mockImplementation(((
    query: chrome.history.HistoryQuery,
    callback: (results: chrome.history.HistoryItem[]) => void,
  ) => {
    callback(
      query.text === "needle"
        ? [{ id: "1", title: "Needle history", url: "https://history.test" }]
        : [],
    );
  }) as typeof chrome.history.search);

/** Like Chrome, returns results only for a matching query. */
const mockBookmarks = () =>
  spyOn(chromeBookmarks, "search").mockImplementation(((
    query: string,
    callback: (results: chrome.bookmarks.BookmarkTreeNode[]) => void,
  ) => {
    callback(
      query === "needle"
        ? [{ id: "1", title: "Needle bookmark", url: "https://bookmark.test", syncing: false }]
        : [],
    );
  }) as typeof chromeBookmarks.search);

function type(root: HTMLElement, text: string): HTMLInputElement {
  const input = root.querySelector("input#s") as HTMLInputElement;
  input.value = text;
  input.dispatchEvent(new window.Event("input"));
  return input;
}

afterEach(cleanup);

describe.serial("Search", () => {
  test("root is #c", async () => {
    expect.assertions(2);
    const root = await renderSearch();
    expect(root).toBeInstanceOf(window.HTMLDivElement);
    expect(root.id).toBe("c");
  });

  test("exposes the search input as #s", async () => {
    expect.assertions(5);
    const root = await renderSearch();
    const input = root.querySelector<HTMLInputElement>("input#s");
    expect(input).toBeTruthy();
    expect(root.firstChild).toBe(input);
    expect(input?.parentElement).toBe(root);
    expect(input?.type).toBe("search");
    expect(input?.placeholder).toBe("Search browser...");
  });

  test("renders the search icon", async () => {
    expect.assertions(2);
    const root = await renderSearch();
    const icon = root.querySelector("svg#i");
    expect(icon).toBeTruthy();
    expect(icon?.parentElement).toBe(root);
  });

  // accepted tradeoff: snapshot of own output
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
    const root = await renderSearch();
    expect(Array.from(root.querySelectorAll("h2"), (h2) => h2.textContent)).toEqual([
      "Recently Closed Tabs",
      "Top Sites",
      "History",
      "Bookmarks",
      "Open Tabs",
    ]);
  });

  test("renders open tabs in their section", async () => {
    expect.assertions(2);
    using _ = spyOn(chromeTabs, "query").mockImplementation(((
      _query: chrome.tabs.QueryInfo,
      callback: (tabs: chrome.tabs.Tab[]) => void,
    ) => {
      callback([{ id: 1, title: "Open tab", url: "https://tab.test" } as chrome.tabs.Tab]);
    }) as typeof chromeTabs.query);
    const root = await renderSearch();
    expect(root.textContent).toInclude("Open tab");
    expect(sectionTexts(root, "Open Tabs")).toEqual(["Open tab"]);
  });

  test("renders top sites in their section", async () => {
    expect.assertions(2);
    using _ = spyOn(chrome.topSites, "get").mockImplementation(((
      callback: (sites: chrome.topSites.MostVisitedURL[]) => void,
    ) => {
      callback([{ title: "Top site", url: "https://top.test" }]);
    }) as typeof chrome.topSites.get);
    const root = await renderSearch();
    expect(root.textContent).toInclude("Top site");
    expect(sectionTexts(root, "Top Sites")).toEqual(["Top site"]);
  });

  test("renders recently closed tabs in their section", async () => {
    expect.assertions(2);
    using _ = spyOn(chrome.sessions, "getRecentlyClosed").mockImplementation(((
      _options: chrome.sessions.Filter,
      callback: (sessions: chrome.sessions.Session[]) => void,
    ) => {
      callback([
        { tab: { title: "Closed tab", url: "https://closed.test" } } as chrome.sessions.Session,
      ]);
    }) as typeof chrome.sessions.getRecentlyClosed);
    const root = await renderSearch();
    expect(root.textContent).toInclude("Closed tab");
    expect(sectionTexts(root, "Recently Closed Tabs")).toEqual(["Closed tab"]);
  });

  test("renders history matching the typed query", async () => {
    expect.assertions(2);
    using _ = mockHistory();
    const root = await renderSearch();
    type(root, "needle");
    expect(root.textContent).toInclude("Needle history");
    expect(sectionTexts(root, "History")).toEqual(["Needle history"]);
  });

  test("renders bookmarks matching the typed query", async () => {
    expect.assertions(2);
    using _ = mockBookmarks();
    const root = await renderSearch();
    type(root, "needle");
    expect(root.textContent).toInclude("Needle bookmark");
    expect(sectionTexts(root, "Bookmarks")).toEqual(["Needle bookmark"]);
  });

  test("clearing a query hides its history results", async () => {
    expect.assertions(2);
    using _ = mockHistory();
    const root = await renderSearch();
    type(root, "needle");
    expect(root.textContent).toInclude("Needle history");
    type(root, "");
    expect(root.textContent).not.toInclude("Needle history");
  });

  test("clearing a query hides its bookmarks results", async () => {
    expect.assertions(2);
    using _ = mockBookmarks();
    const root = await renderSearch();
    type(root, "needle");
    expect(root.textContent).toInclude("Needle bookmark");
    type(root, "");
    expect(root.textContent).not.toInclude("Needle bookmark");
  });

  test("Escape clears the input", async () => {
    expect.assertions(1);
    using _ = mockHistory();
    const root = await renderSearch();
    const input = type(root, "needle");
    input.dispatchEvent(new window.KeyboardEvent("keyup", { key: "Escape" }));
    expect(input.value).toBe("");
  });

  test("Escape clears the results", async () => {
    expect.assertions(2);
    using _ = mockHistory();
    const root = await renderSearch();
    const input = type(root, "needle");
    expect(root.textContent).toInclude("Needle history");
    input.dispatchEvent(new window.KeyboardEvent("keyup", { key: "Escape" }));
    expect(root.textContent).not.toInclude("Needle history");
  });

  describe("open tabs", () => {
    const TAB_EVENTS = ["onUpdated", "onRemoved", "onMoved"] as const;

    /** Renders Search with tab events, animation frames, and tab queries under manual control. */
    async function renderTabs() {
      const Search = await load();
      const stack = new DisposableStack();
      const frames: FrameRequestCallback[] = [];
      const queries: ((tabs: chrome.tabs.Tab[]) => void)[] = [];
      const listeners = {} as Record<(typeof TAB_EVENTS)[number], () => void>;
      stack.use(
        spyOn(globalThis, "requestAnimationFrame").mockImplementation((callback) =>
          frames.push(callback),
        ),
      );
      for (const event of TAB_EVENTS) {
        stack.use(
          spyOn(chromeTabs[event], "addListener").mockImplementation((callback: () => void) => {
            listeners[event] = callback;
          }),
        );
      }
      stack.use(
        spyOn(chromeTabs, "query").mockImplementation(((
          _query: chrome.tabs.QueryInfo,
          callback: (tabs: chrome.tabs.Tab[]) => void,
        ) => {
          queries.push(callback);
        }) as typeof chromeTabs.query),
      );
      const rendered = render(Search());
      return {
        container: rendered.container,
        initialQueries: queries.splice(0),
        queries,
        listeners,
        flush() {
          for (const frame of frames.splice(0)) frame(0);
        },
        [Symbol.dispose]() {
          stack.dispose();
        },
      };
    }

    test.serial("queries open tabs immediately on render", async () => {
      expect.assertions(1);
      using fixture = await renderTabs();
      expect(fixture.initialQueries).toHaveLength(1);
    });

    test.serial.each(TAB_EVENTS)("%s refreshes open tabs on the next frame", async (event) => {
      expect.assertions(2);
      using fixture = await renderTabs();
      fixture.listeners[event]();
      expect(fixture.queries).toHaveLength(0);
      fixture.flush();
      expect(fixture.queries).toHaveLength(1);
    });

    test.serial("a burst of tab events refreshes once per frame", async () => {
      expect.assertions(1);
      using fixture = await renderTabs();
      for (const listener of Object.values(fixture.listeners)) listener();
      fixture.listeners.onUpdated();
      fixture.flush();
      expect(fixture.queries).toHaveLength(1);
    });

    test.serial("tab events after a frame schedule another refresh", async () => {
      expect.assertions(1);
      using fixture = await renderTabs();
      fixture.listeners.onUpdated();
      fixture.flush();
      fixture.listeners.onUpdated();
      fixture.flush();
      expect(fixture.queries).toHaveLength(2);
    });

    test.serial("refreshed open tabs keep the current search filter", async () => {
      expect.assertions(2);
      using fixture = await renderTabs();
      const input = fixture.container.querySelector("input#s") as HTMLInputElement;
      input.value = "needle";
      fixture.listeners.onUpdated();
      fixture.flush();
      fixture.queries[0]?.([
        { id: 1, title: "Needle tab", url: "https://needle.test" } as chrome.tabs.Tab,
        { id: 2, title: "Other tab", url: "https://other.test" } as chrome.tabs.Tab,
      ]);
      expect(fixture.container.textContent).not.toInclude("Other tab");
      expect(fixture.container.textContent).toInclude("Needle tab");
    });
  });
});
