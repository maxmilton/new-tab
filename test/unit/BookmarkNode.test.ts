import { afterEach, describe, expect, onTestFinished, spyOn, test } from "bun:test";
import { cleanup, render } from "@maxmilton/test-utils/dom";
import { BookmarkNode, type BookmarkTreeNode, Folder } from "#/components/BookmarkNode.ts";
import type { LinkProps } from "#/components/Link.ts";
import { chromeBookmarks } from "#/utils.ts";

afterEach(cleanup);

test("renders a link when url is provided", () => {
  expect.assertions(2);
  // @ts-expect-error - intentional partial props
  const rendered = render(BookmarkNode({ url: "x" }));
  expect(rendered.container.querySelector("a")).toBeTruthy(); // link
  expect(rendered.container.querySelector("div.f")).toBeFalsy(); // folder
});

test("renders a folder when url is not provided", () => {
  expect.assertions(2);
  // @ts-expect-error - intentional partial props
  const rendered = render(BookmarkNode({}));
  expect(rendered.container.querySelector("a")).toBeFalsy(); // link
  expect(rendered.container.querySelector("div.f")).toBeTruthy(); // folder
});

describe("Bookmark (Link)", () => {
  test("rendered DOM contains expected elements", () => {
    expect.assertions(3);
    const rendered = render(
      BookmarkNode({ title: "Example", url: "https://example.com" } satisfies LinkProps),
    );
    const root = rendered.container.firstChild as HTMLAnchorElement;
    expect(root).toBeInstanceOf(window.HTMLAnchorElement);
    expect(root.href).toBe("https://example.com/");
    expect(root.querySelector("img")).toBeTruthy(); // favicon
  });

  // accepted tradeoff: snapshot of own output
  test("rendered DOM matches snapshot", () => {
    expect.assertions(1);
    const rendered = render(BookmarkNode({ title: "Example", url: "https://example.com" }));
    expect(rendered.container.getHTML()).toMatchSnapshot();
  });
});

describe("Folder", () => {
  test("rendered DOM contains expected elements", () => {
    expect.assertions(2);
    const rendered = render(BookmarkNode({ id: "1", title: "Example" } satisfies BookmarkTreeNode));
    const root = rendered.container.firstChild as HTMLElement;
    expect(root).toBeInstanceOf(window.HTMLDivElement);
    expect(root.className).toBe("f");
  });

  test("labels a folder with its title", () => {
    expect.assertions(1);
    const rendered = render(BookmarkNode({ id: "1", title: "Example" }));
    expect(rendered.container.firstChild?.textContent).toBe("Example");
  });

  // accepted tradeoff: snapshot of own output
  test("rendered DOM matches snapshot", () => {
    expect.assertions(1);
    const rendered = render(BookmarkNode({ id: "1", title: "Example" }));
    expect(rendered.container.getHTML()).toMatchSnapshot();
  });

  test("shows a subfolder arrow only when nested", () => {
    expect.assertions(2);
    const rendered1 = render(BookmarkNode({ id: "1", title: "Example" }));
    const rendered2 = render(BookmarkNode({ id: "1", title: "Example" }, true));
    const top = rendered1.container.firstChild as HTMLElement;
    const nested = rendered2.container.firstChild as HTMLElement;
    expect(top.querySelector("svg.i")).toBeFalsy();
    expect(nested.querySelector("svg.i")).toBeTruthy();
  });

  test("opens a popup on mouseover", async () => {
    expect.assertions(1);
    const rendered = render(BookmarkNode({ id: "1", title: "Example" }));
    const root = rendered.container.firstChild as HTMLElement;
    root.dispatchEvent(new window.Event("mouseover"));
    await happyDOM.waitUntilComplete();
    expect(root.querySelector(".p")).toBeTruthy();
  });

  test.serial("closes an open popup after mouseout", async () => {
    expect.assertions(2);
    const originalSetTimeout = global.setTimeout;
    onTestFinished(() => {
      global.setTimeout = originalSetTimeout;
    });
    let close: (() => void) | undefined;
    // @ts-expect-error - controlled timer
    global.setTimeout = (callback: () => void) => {
      if (typeof callback === "function") {
        close = () => {
          callback();
        };
      }
      return 0;
    };
    const rendered = render(BookmarkNode({ id: "1", title: "Example" }));
    const root = rendered.container.firstChild as HTMLElement;
    root.dispatchEvent(new window.Event("mouseover"));
    await happyDOM.waitUntilComplete();
    root.dispatchEvent(new window.Event("mouseout"));
    expect(root.querySelector(".p")).toBeTruthy();
    close?.();
    expect(root.querySelector(".p")).toBeFalsy();
  });

  test("hovering a nested folder inside an open popup opens its own subfolder popup", async () => {
    expect.assertions(2);
    const rendered = render(
      Folder({ id: "1", title: "Parent" }, false, () => [{ id: "2", title: "Child" }]),
    );
    const root = rendered.container.firstChild as HTMLElement;
    root.dispatchEvent(new window.Event("mouseover"));
    await happyDOM.waitUntilComplete();
    const nestedFolder = root.querySelector<HTMLElement>(":scope .p .f");
    expect(nestedFolder).toBeTruthy();
    nestedFolder?.dispatchEvent(new window.Event("mouseover"));
    await happyDOM.waitUntilComplete();
    expect(root.querySelectorAll(".p")).toHaveLength(2);
  });

  test("renders an empty popup for a folder without children", async () => {
    expect.assertions(1);
    const rendered = render(BookmarkNode({ id: "1", title: "Example" }));
    const root = rendered.container.firstChild as HTMLElement;
    root.dispatchEvent(new window.Event("mouseover"));
    await happyDOM.waitUntilComplete();
    expect(root.querySelector("#e")?.textContent).toBe("(empty)");
  });

  test("opening a sibling folder closes the previously opened one", async () => {
    expect.assertions(4);
    const wrapper = document.createElement("div");
    const folderA = Folder({ id: "1", title: "A" });
    const folderB = Folder({ id: "2", title: "B" });
    wrapper.append(folderA, folderB);
    render(wrapper);

    folderA.dispatchEvent(new window.Event("mouseover"));
    await happyDOM.waitUntilComplete();
    expect(folderA.querySelector(".p")).toBeTruthy();
    expect(folderB.querySelector(".p")).toBeFalsy();

    folderB.dispatchEvent(new window.Event("mouseover"));
    await happyDOM.waitUntilComplete();
    expect(folderA.querySelector(".p")).toBeFalsy();
    expect(folderB.querySelector(".p")).toBeTruthy();
  });

  test.serial("renders children fetched by the folder's ID on hover", async () => {
    expect.assertions(1);
    using _ = spyOn(chromeBookmarks, "getChildren").mockImplementation((id: string) =>
      Promise.resolve(
        id === "nested"
          ? [{ id: "child", title: "Fetched", url: "https://fetched.example", syncing: false }]
          : [],
      ),
    );
    const rendered = render(Folder({ id: "nested", title: "Folder" }));
    const root = rendered.container.firstChild as HTMLElement;
    root.dispatchEvent(new window.Event("mouseover"));
    await happyDOM.waitUntilComplete();
    expect(root.querySelector('a[href="https://fetched.example"]')?.textContent).toBe("Fetched");
  });

  test.serial("renders supplied popup children without fetching", async () => {
    expect.assertions(2);
    using getChildren = spyOn(chromeBookmarks, "getChildren");
    const rendered = render(
      Folder({ title: "Other Bookmarks" } as BookmarkTreeNode, false, () => [
        { id: "child", title: "Supplied", url: "https://supplied.example" },
      ]),
    );
    const root = rendered.container.firstChild as HTMLElement;
    root.dispatchEvent(new window.Event("mouseover"));
    await happyDOM.waitUntilComplete();
    expect(root.querySelector('a[href="https://supplied.example"]')?.textContent).toBe("Supplied");
    expect(getChildren).not.toHaveBeenCalled();
  });

  // TODO: Test opened sub folder positions (as e2e test; happy-dom doesn't support layout)
  // TODO: Test opened sub folder is scrollable when overflowing (as e2e test; happy-dom doesn't support layout)
});
