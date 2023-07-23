/* eslint-disable no-console */

import * as xcss from 'ekscss';
import * as lightningcss from 'lightningcss';
import { readdir } from 'node:fs/promises';
import { basename } from 'node:path';
import * as terser from 'terser';
import { makeManifest } from './manifest.config';

const mode = Bun.env.NODE_ENV;
const dev = mode === 'development';

/**
 * Generate minified CSS from XCSS source.
 */
function compileCSS(src: string, from: string) {
  const compiled = xcss.compile(src, { from });

  for (const warning of compiled.warnings) {
    console.error('XCSS:', warning.message);

    if (warning.file) {
      console.log(
        `  at ${[warning.file, warning.line, warning.column]
          .filter((x) => x != null)
          .join(':')}`,
      );
    }
  }

  const minified = lightningcss.transform({
    filename: from,
    code: Buffer.from(compiled.css),
    minify: !dev,
    targets: { chrome: 114 << 16 }, // eslint-disable-line no-bitwise
  });

  for (const warning of minified.warnings) {
    console.error('CSS:', warning.message);
  }

  return minified.code.toString();
}

/**
 * Construct a HTML file and a CSS file and save them to disk.
 */
async function makeHTML(pageName: string, stylePath: string) {
  const styleSrc = await Bun.file(stylePath).text();
  const css = compileCSS(styleSrc, stylePath);
  const template = `
    <!doctype html>
    <meta charset=utf-8>
    <meta name=google value=notranslate>
    <title>New Tab</title>
    <link href=${pageName}.css rel=stylesheet>
    <script src=${pageName}.js type=module async></script>
  `
    .trim()
    .replaceAll(/\n +/g, '\n');

  await Bun.write(`dist/${pageName}.css`, css);
  await Bun.write(`dist/${pageName}.html`, template);
}

/**
 * Compile all themes, combine into a single JSON file, and save it to disk.
 */
async function makeThemes() {
  const themes = await readdir('src/css/themes');
  const themesData: Record<string, string> = {};

  await Promise.all(
    themes.map((theme) =>
      Bun.file(`src/css/themes/${theme}`)
        .text()
        .then((src) => {
          themesData[basename(theme, '.xcss')] = compileCSS(src, theme);
        }),
    ),
  );

  await Bun.write('dist/themes.json', JSON.stringify(themesData));
}

async function minifyJS(artifact: Blob & { path: string }) {
  let source = await artifact.text();

  // Improve joining vars; terser doesn't do this so we do it manually
  source = source.replaceAll('const ', 'let ');

  const result = await terser.minify(source, {
    ecma: 2020,
    module: true,
    compress: {
      // Prevent functions being inlined
      reduce_funcs: false,
      // XXX: Comment out to keep performance markers in non-dev builds for debugging
      pure_funcs: ['performance.mark', 'performance.measure'],
    },
    mangle: {
      properties: {
        regex: /^\$\$|^(__click|adjustPosition|closePopup)$/,
      },
    },
    // TODO: Performance testing to see if this makes any difference (I assume it will have a very minor negative impact, so not worth it)
    // format: {
    //   semicolons: false,
    // },
  });

  await Bun.write(artifact.path, result.code!);
}

// Extension manifest
await Bun.write('dist/manifest.json', JSON.stringify(makeManifest()));

console.time('html+css');
await makeHTML('newtab', 'src/css/newtab.xcss');
await makeHTML('settings', 'src/css/settings.xcss');
console.timeEnd('html+css');

console.time('themes');
await makeThemes();
console.timeEnd('themes');

// New Tab & Settings apps
console.time('build');
const out = await Bun.build({
  entrypoints: ['src/newtab.ts', 'src/settings.ts'],
  outdir: 'dist',
  target: 'browser',
  minify: !dev,
  sourcemap: dev ? 'external' : 'none',
});
console.timeEnd('build');
console.log(out);

// Background service worker script
console.time('build2');
const out2 = await Bun.build({
  entrypoints: ['src/sw.ts'],
  outdir: 'dist',
  target: 'browser',
  minify: !dev,
});
console.timeEnd('build2');
console.log(out2);

if (!dev) {
  console.time('minify');
  await minifyJS(out.outputs[0]);
  await minifyJS(out.outputs[1]);
  await minifyJS(out2.outputs[0]);
  console.timeEnd('minify');
}
