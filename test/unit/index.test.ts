import { validate } from "@maxmilton/test-utils/html";
import { describe, expect, test } from "bun:test";
import { readdir } from "node:fs/promises";

describe("dist files", () => {
  // TODO: The bun file type is just inferred from the file extension, not the
  // underlying file data... so that part of this test is not very useful.

  // XXX: Files with unknown type (e.g., symlinks) fall back to the default
  // "application/octet-stream". Bun.file() does not resolve symlinks so it's
  // safe to infer that all these files are therefore regular files.
  const distFiles: [filename: string, type: string, minBytes?: number, maxBytes?: number][] = [
    ["icon16.png", "image/png"],
    ["icon48.png", "image/png"],
    ["icon128.png", "image/png"],
    ["manifest.json", "application/json;charset=utf-8"],
    ["newtab.css", "text/css;charset=utf-8", 1500, 2000],
    ["newtab.html", "text/html;charset=utf-8", 150, 200],
    ["newtab.js", "text/javascript;charset=utf-8", 4000, 6000],
    ["settings.css", "text/css;charset=utf-8", 1000, 1500],
    ["settings.html", "text/html;charset=utf-8", 150, 200],
    ["settings.js", "text/javascript;charset=utf-8", 6000, 8000],
    ["sw.js", "text/javascript;charset=utf-8", 400, 700],
    ["themes.json", "application/json;charset=utf-8"],
  ];

  for (const [filename, type, minBytes, maxBytes] of distFiles) {
    describe(filename, () => {
      const file = Bun.file(`dist/${filename}`);

      test("exists with correct type", () => {
        expect.assertions(3);
        expect(file.exists()).resolves.toBeTruthy();
        expect(file.size).toBeGreaterThan(0);
        expect(file.type).toBe(type); // TODO: Keep this? Type seems to be resolved from the file extension, not the file data.
      });

      if (typeof minBytes === "number" && typeof maxBytes === "number") {
        test("is within expected file size limits", () => {
          expect.assertions(2);
          expect(file.size).toBeGreaterThan(minBytes);
          expect(file.size).toBeLessThan(maxBytes);
        });
      }
    });
  }

  test("contains no extra files", async () => {
    expect.assertions(1);
    const distDir = await readdir("dist");
    expect(distDir).toHaveLength(distFiles.length);
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

// TODO: HTML files have correct title
// TODO: HTML files have correct JS and CSS file references
