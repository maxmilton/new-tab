import { afterAll, beforeAll, describe, expect, mock, spyOn, test } from "bun:test";
import { target } from "happy-dom/lib/PropertySymbol.js";
import { ONCLICK } from "stage1/fast";
import { chromeTabs, DEFAULT_SECTION_ORDER, handleClick } from "../../src/utils.ts";

describe("DEFAULT_SECTION_ORDER", () => {
  test("is an array", () => {
    expect.assertions(2);
    expect(DEFAULT_SECTION_ORDER).toBeArray();
    expect(DEFAULT_SECTION_ORDER).toBeInstanceOf(window.Array);
  });

  test("contains all sections", () => {
    expect.assertions(6);
    expect(DEFAULT_SECTION_ORDER).toHaveLength(5);
    expect(DEFAULT_SECTION_ORDER).toContain("Open Tabs");
    expect(DEFAULT_SECTION_ORDER).toContain("Bookmarks");
    expect(DEFAULT_SECTION_ORDER).toContain("History");
    expect(DEFAULT_SECTION_ORDER).toContain("Top Sites");
    expect(DEFAULT_SECTION_ORDER).toContain("Recently Closed Tabs");
  });

  test("contains no duplicates", () => {
    expect.assertions(1);
    const uniqueSections = new Set(DEFAULT_SECTION_ORDER);
    expect(uniqueSections.size).toBe(DEFAULT_SECTION_ORDER.length);
  });

  test('has "Open Tabs" as the first item', () => {
    expect.assertions(1);
    expect(DEFAULT_SECTION_ORDER[0]).toBe("Open Tabs");
  });
});

// TODO: Add invariant tests for handleClick

declare global {
  /** Search input element with id=s defined in `src/components/Search.ts`. */
  // oxlint-disable-next-line no-var, vars-on-top
  var s: HTMLInputElement;
}

describe("handleClick", () => {
  beforeAll(() => {
    if (global.s as Node | undefined) throw new Error("global.s already defined");
    global.s = document.createElement("input");
    document.body.appendChild(global.s);
  });
  afterAll(() => {
    global.s.remove();
  });

  test("is a function", () => {
    expect.assertions(2);
    expect(handleClick).toBeFunction();
    expect(handleClick).not.toBeClass();
  });

  test("expects 1 parameter", () => {
    expect.assertions(1);
    expect(handleClick).toHaveParameters(1, 0);
  });

  test("has no return value by default", () => {
    expect.assertions(1);
    const event = new window.MouseEvent("click");
    // @ts-expect-error - happy-dom internal target property
    event[target] = {};
    expect(handleClick(event)).toBeUndefined();
  });

  test("triggers click handler on target", () => {
    expect.assertions(2);
    const event = new window.MouseEvent("click");
    const handler = mock(() => {});
    // @ts-expect-error - happy-dom internal target property
    event[target] = { [ONCLICK]: handler };
    handleClick(event);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(event);
  });

  test("triggers click handler on target parent", () => {
    expect.assertions(2);
    const event = new window.MouseEvent("click");
    const handler = mock(() => {});
    const child = document.createElement("div");
    const parent = document.createElement("a");
    parent[ONCLICK] = handler;
    parent.appendChild(child);
    // @ts-expect-error - happy-dom internal target property
    event[target] = child;
    handleClick(event);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(event);
  });

  test("only triggers the first found click handler on target parents", () => {
    expect.assertions(3);
    const event = new window.MouseEvent("click");
    const handler1 = mock(() => {});
    const handler2 = mock(() => {});
    const child = document.createElement("div");
    const parent1 = document.createElement("a");
    const parent2 = document.createElement("a");
    parent1[ONCLICK] = handler1;
    parent2[ONCLICK] = handler2;
    // parent2 > parent1 > child
    parent2.appendChild(parent1);
    parent1.appendChild(child);
    // @ts-expect-error - happy-dom internal target property
    event[target] = child;
    handleClick(event);
    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler1).toHaveBeenCalledWith(event);
    expect(handler2).toHaveBeenCalledTimes(0);
  });

  // XXX: We return false from events rather than call preventDefault() for
  // byte savings, so we can't test this.
  // test('default prevented on event when url does not start with "h"', () => {
  //   expect.assertions(2);
  //   const event = new window.MouseEvent("click");
  //   // @ts-expect-error - happy-dom internal target property
  //   event[target] = { href: "chrome://about" };
  //   expect(event.defaultPrevented).toBeFalse();
  //   handleClick(event);
  //   expect(event.defaultPrevented).toBeTrue();
  // });

  test('default not prevented on event when url starts with "h"', () => {
    expect.assertions(2);
    const event = new window.MouseEvent("click");
    // @ts-expect-error - happy-dom internal target property
    event[target] = { href: "https://example.com" };
    expect(event.defaultPrevented).toBeFalse();
    handleClick(event);
    expect(event.defaultPrevented).toBeFalse();
  });

  // Returning false on click events is similar to calling event.preventDefault()
  test('handler returns false when url does not start with "h"', () => {
    expect.assertions(1);
    const event = new window.MouseEvent("click");
    // @ts-expect-error - happy-dom internal target property
    event[target] = { href: "chrome://about" };
    const result = handleClick(event);
    expect(result).toBeFalse();
  });

  test('handler does not return false when url starts with "h"', () => {
    expect.assertions(1);
    const event = new window.MouseEvent("click");
    // @ts-expect-error - happy-dom internal target property
    event[target] = { href: "https://example.com" };
    const result = handleClick(event);
    expect(result).not.toBeFalse();
  });

  test("opens in new tab when url starts with chrome:// and ctrl key is pressed", () => {
    expect.assertions(3);
    const tabsCreateSpy = spyOn(chromeTabs, "create");
    const tabsUpdateSpy = spyOn(chromeTabs, "update");
    const event = new window.MouseEvent("click", { ctrlKey: true });
    // @ts-expect-error - happy-dom internal target property
    event[target] = { href: "chrome://about" };
    handleClick(event);
    expect(tabsCreateSpy).toHaveBeenCalledTimes(1);
    expect(tabsCreateSpy).toHaveBeenCalledWith({ url: "chrome://about" });
    expect(tabsUpdateSpy).toHaveBeenCalledTimes(0);
    tabsCreateSpy.mockRestore();
    tabsUpdateSpy.mockRestore();
  });

  test("updates current tab when url starts with chrome:// and target is not _blank", () => {
    expect.assertions(3);
    const tabsCreateSpy = spyOn(chromeTabs, "create");
    const tabsUpdateSpy = spyOn(chromeTabs, "update");
    const event = new window.MouseEvent("click");
    // @ts-expect-error - happy-dom internal target property
    event[target] = { href: "chrome://about", target: null };
    handleClick(event);
    expect(tabsCreateSpy).toHaveBeenCalledTimes(0);
    expect(tabsUpdateSpy).toHaveBeenCalledTimes(1);
    expect(tabsUpdateSpy).toHaveBeenCalledWith({ url: "chrome://about" });
    tabsCreateSpy.mockRestore();
    tabsUpdateSpy.mockRestore();
  });

  test("updates current tab when url starts with chrome:// and ctrl key is not pressed", () => {
    expect.assertions(3);
    const tabsCreateSpy = spyOn(chromeTabs, "create");
    const tabsUpdateSpy = spyOn(chromeTabs, "update");
    const event = new window.MouseEvent("click", { ctrlKey: false });
    // @ts-expect-error - happy-dom internal target property
    event[target] = { href: "chrome://about" };
    handleClick(event);
    expect(tabsCreateSpy).toHaveBeenCalledTimes(0);
    expect(tabsUpdateSpy).toHaveBeenCalledTimes(1);
    expect(tabsUpdateSpy).toHaveBeenCalledWith({ url: "chrome://about" });
    tabsCreateSpy.mockRestore();
    tabsUpdateSpy.mockRestore();
  });

  test("focuses search input for non-link target", () => {
    expect.assertions(2);
    const focusSpy = spyOn(global.s, "focus");
    const event = new window.MouseEvent("click");
    // @ts-expect-error - happy-dom internal target property
    event[target] = {};
    handleClick(event);
    expect(focusSpy).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(global.s as Element);
  });
});
