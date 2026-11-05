import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, render } from "@maxmilton/test-utils/dom";
import { Link, type LinkProps } from "#/components/Link.ts";

afterEach(cleanup);

describe("Link", () => {
  const props = { title: "Example", url: "https://example.com" } satisfies LinkProps;

  test("links to the URL", () => {
    expect.assertions(3);
    const rendered = render(Link(props));
    const link = rendered.container.querySelector("a");
    expect(link).toBeTruthy();
    expect(rendered.container.firstChild).toBe(link);
    expect(link?.getAttribute("href")).toBe("https://example.com");
  });

  test("labels the link with the title", () => {
    expect.assertions(2);
    const link = render(Link(props)).container.querySelector("a");
    expect(link?.textContent).toBe("Example");
    expect(link?.getAttribute("title")).toBe("Example");
  });

  // Oracle: https://developer.chrome.com/docs/extensions/how-to/ui/favicons
  test("shows the favicon via Chrome's _favicon endpoint", () => {
    expect.assertions(3);
    const rendered = render(Link(props));
    const img = rendered.container.querySelector("img");
    expect(img).toBeTruthy();
    expect(img?.parentNode).toBe(rendered.container.querySelector("a"));
    expect(img?.getAttribute("src")).toBe("_favicon?size=16&pageUrl=https%3A%2F%2Fexample.com");
  });

  test("decodes the favicon asynchronously", () => {
    expect.assertions(1);
    const img = render(Link(props)).container.querySelector("img");
    expect(img?.getAttribute("decoding")).toBe("async");
  });

  // accepted tradeoff: snapshot of own output
  test("rendered DOM matches snapshot", () => {
    expect.assertions(1);
    const rendered = render(Link({ title: "Example", url: "https://example.com" }));
    expect(rendered.container.getHTML()).toMatchSnapshot();
  });
});
