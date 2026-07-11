import { afterEach, expect, test } from "bun:test";
import { cleanup, render } from "@maxmilton/test-utils/dom";
import { SearchResult } from "#/components/SearchResult.ts";

afterEach(cleanup);

test("rendered DOM contains expected elements", () => {
  expect.assertions(5);
  const rendered = render(SearchResult("Open Tabs"));
  const root = rendered.container.firstChild as HTMLElement;
  expect(root).toBeInstanceOf(window.HTMLDivElement);
  expect(root.hidden).toBeTrue();
  expect(root.querySelector("h2")).toBeTruthy();
  const button = root.querySelector("button");
  expect(button).toBeTruthy();
  expect(button?.textContent).toBe("Show more");
});

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

// TODO: More tests.
