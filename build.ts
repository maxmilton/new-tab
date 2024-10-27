import { readdir } from 'node:fs/promises';
import { basename } from 'node:path'; // eslint-disable-line unicorn/import-style
import { importPlugin } from '@ekscss/plugin-import';
import type { BuildArtifact } from 'bun';
import * as xcss from 'ekscss';
import * as lightningcss from 'lightningcss';
import * as terser from 'terser';
import { createManifest } from './manifest.config';

const mode = Bun.env.NODE_ENV;
const dev = mode === 'development';

/**
 * Generate minified CSS from XCSS source.
 */
function compileCSS(src: string, from: string) {
  const compiled = xcss.compile(src, {
    from,
    plugins: [importPlugin],
  });

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

  // TODO: Migrate to bun CSS handling (which is based on lightningcss).
  const minified = lightningcss.transform({
    filename: from,
    code: new TextEncoder().encode(compiled.css),
    minify: !dev,
    // eslint-disable-next-line no-bitwise
    targets: { chrome: 123 << 16 }, // matches manifest minimum_chrome_version
  });

  for (const warning of minified.warnings) {
    console.error('CSS:', warning.message);
  }

  return minified.code;
}

/**
 * Construct HTML and CSS files and save them to disk.
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
    .replaceAll(/\n\s+/g, '\n'); // remove leading whitespace

  await Bun.write(`dist/${pageName}.css`, css);
  await Bun.write(`dist/${pageName}.html`, template);
}

/**
 * Compile all themes, combine into a single JSON file, and save it to disk.
 */
async function makeThemes() {
  const themeFiles = await readdir('src/css/themes');
  const themes: Record<string, string> = {};

  for (const theme of themeFiles.sort()) {
    if (theme.endsWith('.xcss')) {
      const path = `src/css/themes/${theme}`;
      const code = await Bun.file(path).text();
      themes[basename(theme, '.xcss')] = compileCSS(code, path).toString();
    }
  }

  await Bun.write('dist/themes.json', JSON.stringify(themes));
}

async function minifyJS(artifact: BuildArtifact) {
  let source = await artifact.text();

  // Improve collapsing variables; terser doesn't do this so we do it manually.
  source = source.replaceAll('const ', 'let ');

  const result = await terser.minify(source, {
    ecma: 2020,
    module: true,
    compress: {
      reduce_funcs: false, // prevent functions being inlined
      // XXX: Comment out to keep performance markers for debugging.
      pure_funcs: ['performance.mark', 'performance.measure'],
      passes: 3,
    },
    mangle: {
      properties: {
        regex: /^\$\$|^__click$/,
      },
    },
  });

  await Bun.write(artifact.path, result.code ?? '');
}

console.time('prebuild');
await Bun.$`rm -rf dist`;
await Bun.$`cp -r static dist`;
console.timeEnd('prebuild');

// Extension manifest
console.time('manifest');
await Bun.write('dist/manifest.json', JSON.stringify(createManifest()));
console.timeEnd('manifest');

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
  sourcemap: dev ? 'linked' : 'none',
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
  sourcemap: dev ? 'linked' : 'none',
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
