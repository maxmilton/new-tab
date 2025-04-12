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
 * @internal
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
          .filter((x) => x !== undefined)
          .join(':')}`,
      );
    }
  }

  // TODO: Migrate to bun CSS handling (which is based on lightningcss).
  const minified = lightningcss.transform({
    filename: from,
    code: new TextEncoder().encode(compiled.css),
    minify: !dev,
    // oxlint-disable-next-line no-bitwise
    targets: { chrome: 123 << 16 }, // matches manifest minimum_chrome_version
  });

  for (const warning of minified.warnings) {
    console.error('CSS:', warning.message);
  }

  return minified.code;
}

/**
 * Construct HTML file and save it to disk.
 * @internal
 */
async function makeHTML(pageName: string) {
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

  await Bun.write(`dist/${pageName}.html`, template);
}

/**
 * Construct CSS file and save it to disk.
 * @internal
 */
async function makeCSS(pageName: string, cssEntrypoint: string) {
  const cssSource = await Bun.file(cssEntrypoint).text();
  const css = compileCSS(cssSource, cssEntrypoint);
  await Bun.write(`dist/${pageName}.css`, css);
}

/**
 * Compile all themes, combine into a single JSON file, and save it to disk.
 * @internal
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

async function minifyJS(artifacts: BuildArtifact[]) {
  for (const artifact of artifacts) {
    if (artifact.kind === 'entry-point' || artifact.kind === 'chunk') {
      const source = await artifact.text();
      const result = await terser.minify(source, {
        ecma: 2020,
        module: true,
        compress: {
          comparisons: false,
          negate_iife: false,
          reduce_funcs: false, // prevent function inlining
          passes: 3,
          // XXX: Comment out to keep performance markers for debugging.
          pure_funcs: ['performance.mark', 'performance.measure'],
        },
        mangle: {
          properties: {
            regex: /^\$\$|^__click$/,
          },
        },
        format: {
          wrap_func_args: true,
          wrap_iife: true,
        },
      });

      if (result.code) {
        await Bun.write(artifact.path, result.code);
      }
    }
  }
}

console.time('prebuild');
await Bun.$`rm -rf dist`;
await Bun.$`cp -r static dist`;
console.timeEnd('prebuild');

// Extension manifest
console.time('manifest');
await Bun.write('dist/manifest.json', JSON.stringify(createManifest()));
console.timeEnd('manifest');

console.time('html');
await makeHTML('newtab');
await makeHTML('settings');
console.timeEnd('html');

console.time('css');
await makeCSS('newtab', 'src/css/newtab.xcss');
await makeCSS('settings', 'src/css/settings.xcss');
console.timeEnd('css');

console.time('themes');
await makeThemes();
console.timeEnd('themes');

// New Tab & Settings apps
console.time('build:1');
const out1 = await Bun.build({
  entrypoints: ['src/newtab.ts', 'src/settings.ts'],
  outdir: 'dist',
  target: 'browser',
  minify: !dev,
  sourcemap: dev ? 'linked' : 'none',
});
console.timeEnd('build:1');
console.log(out1.outputs);
if (!out1.success) throw new AggregateError(out1.logs, 'Build failed');

// Background service worker script
console.time('build:2');
const out2 = await Bun.build({
  entrypoints: ['src/sw.ts'],
  outdir: 'dist',
  target: 'browser',
  minify: !dev,
  sourcemap: dev ? 'linked' : 'none',
});
console.timeEnd('build:2');
console.log(out2.outputs);
if (!out2.success) throw new AggregateError(out2.logs, 'Build failed');

if (!dev) {
  console.time('minify:js');
  await minifyJS(out1.outputs);
  await minifyJS(out2.outputs);
  console.timeEnd('minify:js');
}
