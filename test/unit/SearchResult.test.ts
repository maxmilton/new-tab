import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, render } from "@maxmilton/test-utils/dom";
import { SearchResult } from "#/components/SearchResult.ts";

afterEach(cleanup);

describe("SearchResult", () => {
  test("renders a div root", () => {
    expect.assertions(1);
    const root = render(SearchResult("Open Tabs")).container.firstChild as HTMLElement;
    expect(root).toBeInstanceOf(window.HTMLDivElement);
  });

  test("starts hidden", () => {
    expect.assertions(1);
    const root = render(SearchResult("Open Tabs")).container.firstChild as HTMLElement;
    expect(root.hidden).toBeTrue();
  });

  test("renders a title heading and Show more button", () => {
    expect.assertions(3);
    const root = render(SearchResult("Open Tabs")).container.firstChild as HTMLElement;
    expect(root.querySelector("h2")).toBeTruthy();
    const button = root.querySelector("button");
    expect(button).toBeTruthy();
    expect(button?.textContent).toBe("Show more");
  });

  // accepted tradeoff: snapshot of own output
  test("rendered DOM matches snapshot", async () => {
    expect.assertions(1);
    const rendered = render(SearchResult("Open Tabs"));
    await happyDOM.waitUntilComplete();
    expect(rendered.container.getHTML()).toMatchSnapshot();
  });

  test("passed section name is rendered in title", () => {
    expect.assertions(1);
    const sectionName = "Foo Bar";
    // @ts-expect-error - invalid section name for testing
    const rendered = render(SearchResult(sectionName));
    const root = rendered.container.firstChild as HTMLElement;
    const title = root.querySelector("h2");
    expect(title?.textContent).toBe(sectionName);
  });
});

// TODO: More tests.
