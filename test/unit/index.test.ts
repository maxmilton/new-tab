import { describe, expect, test } from "bun:test";
import { validate } from "@maxmilton/test-utils/html";
import pkg from "../../package.json" with { type: "json" };

describe("dist files", () => {
  // TODO: Remove the file MIME type checks? Bun inferrs it from the file
  // extension, not the actual file data, so the usefulness is questionable.

  // NOTE: Files of unknown type (e.g., symlinks) fall back to the default
  // "application/octet-stream". Bun.file() does not resolve symlinks so it's
  // safe to infer that all these files are therefore regular files.
  const distFiles: [filename: string, type: string, minBytes?: number, maxBytes?: number][] = [
    ["icon16.png", "image/png"],
    ["icon48.png", "image/png"],
    ["icon128.png", "image/png"],
    ["manifest.json", "application/json;charset=utf-8"],
    ["newtab.css", "text/css;charset=utf-8", 1500, 2500],
    ["newtab.html", "text/html;charset=utf-8", 150, 200],
    ["newtab.js", "text/javascript;charset=utf-8", 3500, 5000],
    ["settings.css", "text/css;charset=utf-8", 1000, 1500],
    ["settings.html", "text/html;charset=utf-8", 150, 200],
    ["settings.js", "text/javascript;charset=utf-8", 6000, 8000],
    ["sw.js", "text/javascript;charset=utf-8", 400, 700],
    ["themes.json", "application/json;charset=utf-8"],
  ];

  describe.each(distFiles)("%s", (filename, type, minBytes, maxBytes) => {
    const file = Bun.file(`dist/${filename}`);

    test("exists with correct MIME type", () => {
      expect.assertions(3);
      expect(file.exists()).resolves.toBeTrue();
      expect(file.size).toBeGreaterThan(0);
      expect(file.type).toBe(type);
    });

    if (typeof minBytes === "number" && typeof maxBytes === "number") {
      test("is within expected file size limits", () => {
        expect.assertions(2);
        expect(file.size).toBeGreaterThan(minBytes);
        expect(file.size).toBeLessThan(maxBytes);
      });
    }
  });

  test("contains no unexpected files", () => {
    expect.assertions(1);
    const expectedFiles = new Set(distFiles.map(([filename]) => filename));
    const actualFiles = new Set(new Bun.Glob("**").scanSync({ cwd: "dist" }));
    expect(actualFiles.difference(expectedFiles)).toBeEmpty();
  });

  test.each(distFiles.filter(([filename]) => filename.endsWith(".html")))(
    "%s contains valid HTML",
    async (filename) => {
      const file = Bun.file(`dist/${filename}`);
      const html = await file.text();
      const result = validate(html);
      expect(result.valid).toBeTrue();
    },
  );
});

describe("package.json", () => {
  const file = Bun.file("package.json");

  test("exists with correct MIME type", () => {
    expect.assertions(2);
    expect(file.exists()).resolves.toBeTrue();
    expect(file.type).toBe("application/json;charset=utf-8");
  });

  test("contains valid JSON", async () => {
    expect.assertions(1);
    const text = await file.text();
    expect(JSON.parse(text)).toBePlainObject();
  });

  test("contains properties used in manifest", () => {
    expect.assertions(6);
    expect(pkg).toHaveProperty("description", expect.any(String));
    expect(pkg).toHaveProperty("version", expect.any(String));
    expect(pkg).toHaveProperty("homepage", expect.any(String));
    expect(pkg.description.length).toBeGreaterThan(0);
    expect(pkg.version.length).toBeGreaterThan(0);
    expect(pkg.homepage.length).toBeGreaterThan(0);
  });
});

test("no test file relies on the removed Bun `Loader` internal", async () => {
  expect.assertions(1);
  const contents = await Promise.all(
    [...new Bun.Glob("**/*.ts").scanSync({ cwd: "test/unit" })]
      .filter((filename) => filename !== "index.test.ts")
      .map((filename) => Bun.file(`test/unit/${filename}`).text()),
  );
  expect(contents.join("\n")).not.toContain("Loader.registry");
});
