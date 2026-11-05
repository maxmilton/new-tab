import { afterAll, afterEach, beforeAll, expect, onTestFinished, spyOn, test } from "bun:test";
import { cleanup, render } from "@maxmilton/test-utils/dom";
import { BookmarkBar } from "#/components/BookmarkBar.ts";
import { chromeBookmarks } from "#/utils.ts";

type Node = chrome.bookmarks.BookmarkTreeNode;

// Happy DOM has no layout, so every bar item is in the overflow popup.
const OVERFLOW = ":scope > .f:has(#io)";
const OTHER = ":scope > .f:last-child";

let style: HTMLStyleElement;

beforeAll(() => {
  // Workaround for hack that waits for styles to be loaded
  style = document.head.appendChild(document.createElement("style"));
});

afterEach(cleanup);

afterAll(() => {
  style.remove();
});

const link = (id: string): Node => ({
  id,
  title: id,
  url: `https://${id}.example`,
  syncing: false,
});
const folder = (id: string, folderType: NonNullable<Node["folderType"]>): Node => ({
  id,
  title: id,
  syncing: false,
  folderType,
});

/** Serves `getChildren` from `tree` in both callback and promise forms, like Chrome. */
const mockTree = (tree: Record<string, Node[]>) =>
  spyOn(chromeBookmarks, "getChildren").mockImplementation(
    (id: string, callback?: (nodes: Node[]) => void) => {
      const nodes = tree[id] ?? [];
      callback?.(nodes);
      return Promise.resolve(nodes);
    },
  );

async function renderBar(): Promise<HTMLElement> {
  const previousResize = window.onresize;
  onTestFinished(() => {
    window.onresize = previousResize;
  });
  const rendered = render(BookmarkBar());
  await happyDOM.waitUntilComplete();
  return rendered.container.firstChild as HTMLElement;
}

async function popupLinks(selector: string): Promise<(string | null)[]> {
  const root = await renderBar();
  const target = root.querySelector(selector);
  target?.dispatchEvent(new window.Event("mouseover"));
  await happyDOM.waitUntilComplete();
  return Array.from(target?.querySelectorAll("a") ?? [], (node) => node.textContent);
}

// XXX: Because chrome.bookmarks.getChildren is async, which is called within
// BookmarkBar, we need to wait for it to complete before we assert anything.

test("rendered DOM contains expected elements", async () => {
  expect.assertions(2);
  const rendered = render(BookmarkBar());
  await happyDOM.waitUntilComplete();
  const root = rendered.container.firstChild as HTMLElement;
  expect(root).toBeInstanceOf(window.HTMLDivElement);
  expect(root.id).toBe("b");
});

// accepted tradeoff: snapshot of own output
test("rendered DOM matches snapshot", async () => {
  expect.assertions(1);
  const rendered = render(BookmarkBar());
  await happyDOM.waitUntilComplete();
  expect(rendered.container.getHTML()).toMatchSnapshot();
});

test.serial("regression: finds the bar by folder type, not ID or title", async () => {
  expect.assertions(1);
  using _ = mockTree({
    0: [
      { id: "1", title: "Bookmarks bar", syncing: false, folderType: "other" },
      { id: "42", title: "Favoriten", syncing: false, folderType: "bookmarks-bar" },
    ],
    1: [link("decoy")],
    42: [link("bar")],
  });
  expect(await popupLinks(OVERFLOW)).toEqual(["bar"]);
});

test.serial("joins every bookmarks bar in root order", async () => {
  expect.assertions(1);
  using _ = mockTree({
    0: [folder("local", "bookmarks-bar"), folder("account", "bookmarks-bar")],
    local: [link("l")],
    account: [link("a")],
  });
  expect(await popupLinks(OVERFLOW)).toEqual(["l", "a"]);
});

test.serial("preserves root and child order when requests finish out of order", async () => {
  expect.assertions(1);
  const first = Promise.withResolvers<Node[]>();
  using _ = spyOn(chromeBookmarks, "getChildren").mockImplementation(
    (id: string, callback?: (nodes: Node[]) => void) => {
      if (id === "0") {
        const roots = [folder("first", "bookmarks-bar"), folder("second", "bookmarks-bar")];
        callback?.(roots);
        return Promise.resolve(roots);
      }
      if (id === "first") return first.promise;
      const second = Promise.resolve([link("c"), link("a")]);
      void (async () => {
        await second;
        first.resolve([link("a"), link("b")]);
      })();
      return second;
    },
  );
  expect(await popupLinks(OVERFLOW)).toEqual(["a", "b", "c", "a"]);
});

test.serial("renders only Other Bookmarks when all bars are empty", async () => {
  expect.assertions(1);
  using _ = mockTree({
    0: [folder("local", "bookmarks-bar"), folder("account", "bookmarks-bar")],
    local: [],
    account: [],
  });
  const root = await renderBar();
  expect(Array.from(root.children, (node) => node.textContent)).toEqual(["Other Bookmarks"]);
});

test.serial("fills Other Bookmarks with non-bar root folders in root order", async () => {
  expect.assertions(1);
  using _ = mockTree({
    0: [folder("bar", "bookmarks-bar"), folder("other", "other"), folder("mobile", "mobile")],
    bar: [link("b")],
    other: [link("o")],
    mobile: [link("m")],
  });
  expect(await popupLinks(OTHER)).toEqual(["o", "m"]);
});

test.serial("defers fetching non-bar folders until Other Bookmarks is hovered", async () => {
  expect.assertions(1);
  using getChildren = mockTree({
    0: [folder("bar", "bookmarks-bar"), folder("other", "other")],
    bar: [link("b")],
    other: [link("o")],
  });
  await renderBar();
  expect(getChildren.mock.calls.map(([id]) => id)).not.toContain("other");
});
