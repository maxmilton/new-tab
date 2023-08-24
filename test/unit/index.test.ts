import { describe, expect, test } from 'bun:test';
import { readdir } from 'node:fs/promises';

describe('dist files', () => {
  // FIXME: The bun file type is just inferred from the file extension, not the
  // underlying file data... so that part of this test is not very useful.

  // XXX: Files with unknown type (e.g., symlinks) fall back to the default
  // "application/octet-stream". Bun.file() does not resolve symlinks so it's
  // safe to infer that all these files are therefore regular files.
  const distFiles: [filename: string, type: string, minBytes?: number, maxBytes?: number][] = [
    ['icon16.png', 'image/png'],
    ['icon48.png', 'image/png'],
    ['icon128.png', 'image/png'],
    ['manifest.json', 'application/json;charset=utf-8'],
    ['newtab.css', 'text/css', 1500, 2000],
    ['newtab.html', 'text/html;charset=utf-8', 150, 200],
    ['newtab.js', 'text/javascript;charset=utf-8', 4000, 6000],
    ['settings.css', 'text/css', 1000, 1500],
    ['settings.html', 'text/html;charset=utf-8', 150, 200],
    ['settings.js', 'text/javascript;charset=utf-8', 4000, 6000],
    ['sw.js', 'text/javascript;charset=utf-8', 150, 250],
    ['themes.json', 'application/json;charset=utf-8'],
  ];

  for (const [filename, type, minBytes, maxBytes] of distFiles) {
    // eslint-disable-next-line @typescript-eslint/no-loop-func
    describe(filename, () => {
      const file = Bun.file(`dist/${filename}`);

      test(`exists with correct type`, () => {
        expect(file.exists()).resolves.toBeTruthy();
        expect(file.size).toBeGreaterThan(0);
        expect(file.type).toBe(type); // TODO: Keep this? Type seems to be resolved from the file extension, not the file data.
      });

      if (minBytes != null && maxBytes != null) {
        test(`is within expected file size limits`, () => {
          expect(file.size).toBeGreaterThan(minBytes);
          expect(file.size).toBeLessThan(maxBytes);
        });
      }
    });
  }

  test('contains no extra files', async () => {
    const distDir = await readdir('dist');
    expect(distDir).toHaveLength(distFiles.length);
  });
});
