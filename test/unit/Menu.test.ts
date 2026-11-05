import { afterEach, describe, expect, onTestFinished, spyOn, test } from "bun:test";
import { cleanup, render } from "@maxmilton/test-utils/dom";
import { Menu } from "#/components/Menu.ts";
import { handleClick } from "#/utils.ts";

afterEach(cleanup);

describe("Menu", () => {
  test("root is #m with menu icon and dropdown", () => {
    expect.assertions(4);
    const root = render(Menu()).container.firstChild as HTMLElement;
    expect(root).toBeInstanceOf(window.HTMLDivElement);
    expect(root.id).toBe("m");
    expect(root.querySelector("svg#im")).toBeTruthy();
    expect(root.querySelector("div#d")).toBeTruthy();
  });

  test("links to Chrome pages and the issue tracker", () => {
    expect.assertions(7);
    const root = render(Menu()).container.firstChild as HTMLElement;
    expect(root.querySelector('a[href="chrome://bookmarks"]')).toBeTruthy();
    expect(root.querySelector('a[href="chrome://password-manager"]')).toBeTruthy();
    expect(root.querySelector('a[href="chrome://downloads"]')).toBeTruthy();
    expect(root.querySelector('a[href="chrome://history"]')).toBeTruthy();
    expect(root.querySelector('a[href="chrome://extensions"]')).toBeTruthy();
    expect(
      root.querySelector('a[href="https://github.com/maxmilton/new-tab/issues"]'),
    ).toBeTruthy();
    expect(
      Array.from(root.querySelectorAll("#d a[href]"), (link) => link.getAttribute("href")),
    ).toEqual([
      "chrome://bookmarks",
      "chrome://password-manager",
      "chrome://downloads",
      "chrome://history",
      "chrome://extensions",
      "https://github.com/maxmilton/new-tab/issues",
    ]);
  });

  // accepted tradeoff: snapshot of own output
  test("rendered DOM matches snapshot", () => {
    expect.assertions(1);
    const rendered = render(Menu());
    expect(rendered.container.getHTML()).toMatchSnapshot();
  });

  test.serial("clicking settings link calls chrome.runtime.openOptionsPage", () => {
    expect.assertions(3);
    document.onclick = handleClick; // same click event logic as in src/newtab.ts
    onTestFinished(() => {
      document.onclick = null;
    });
    using spy = spyOn(chrome.runtime, "openOptionsPage");
    const rendered = render(Menu());
    const link = [...rendered.container.querySelectorAll("a")].find(
      (anchor) => anchor.textContent === "New Tab Settings",
    );
    expect(link?.textContent).toBe("New Tab Settings");
    expect(link).toBeInstanceOf(window.HTMLAnchorElement);
    link?.click();
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
