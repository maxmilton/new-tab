// FIXME: Remove these lint exceptions once linting can handle mjs
//  ↳ When TS 4.5 is released and typescript-eslint has support
//  ↳ https://github.com/typescript-eslint/typescript-eslint/issues/3950
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable import/extensions, import/no-extraneous-dependencies, no-console */

import csso from 'csso';
import xcss from 'ekscss';
import esbuild from 'esbuild';
import { minifyTemplates, writeFiles } from 'esbuild-minify-templates';
import fs from 'fs/promises';
import path from 'path';
import { performance } from 'perf_hooks';
import manifest from './manifest.config.js';

const mode = process.env.NODE_ENV;
const dev = mode === 'development';
const dir = path.resolve(); // no __dirname in node ESM

/** @type {esbuild.Plugin} */
const analyzeMeta = {
  name: 'analyze-meta',
  setup(build) {
    if (!build.initialOptions.metafile) return;
    // @ts-expect-error - FIXME:!
    build.onEnd((result) => esbuild.analyzeMetafile(result.metafile).then(console.log));
  },
};

// New Tab app
await esbuild.build({
  entryPoints: ['src/newtab.ts'],
  outfile: 'dist/newtab.js',
  platform: 'browser',
  target: ['chrome91'],
  define: { 'process.env.NODE_ENV': JSON.stringify(mode) },
  banner: { js: '"use strict";' },
  plugins: [analyzeMeta, minifyTemplates(), writeFiles()],
  bundle: true,
  minify: !dev,
  sourcemap: dev,
  watch: dev,
  write: dev,
  metafile: !dev && process.stdout.isTTY,
  logLevel: 'debug',
});

// Settings app
await esbuild.build({
  entryPoints: ['src/settings.ts'],
  outfile: 'dist/settings.js',
  platform: 'browser',
  target: ['chrome91'],
  define: { 'process.env.NODE_ENV': JSON.stringify(mode) },
  banner: { js: '"use strict";' },
  plugins: [analyzeMeta, minifyTemplates(), writeFiles()],
  bundle: true,
  minify: !dev,
  sourcemap: dev,
  watch: dev,
  write: dev,
  metafile: !dev && process.stdout.isTTY,
  logLevel: 'debug',
});

// Background script
await esbuild.build({
  entryPoints: ['src/background.ts'],
  outfile: 'dist/background.js',
  format: 'esm',
  plugins: [analyzeMeta],
  bundle: true,
  minify: !dev,
  metafile: !dev && process.stdout.isTTY,
  logLevel: 'debug',
});

/**
 * Generate minified CSS from XCSS source.
 *
 * @param {string} src
 * @param {string} from
 */
function compileCSS(src, from) {
  const compiled = xcss.compile(src, {
    from,
    map: false,
  });

  for (const warning of compiled.warnings) {
    console.error('XCSS WARNING:', warning.message);

    if (warning.file) {
      console.log(
        `  at ${[warning.file, warning.line, warning.column]
          .filter(Boolean)
          .join(':')}`,
      );
    }
  }

  const { css } = csso.minify(compiled.css, {
    restructure: true,
    forceMediaMerge: true,
  });

  return css;
}

/**
 * Construct a HTML file and save it to disk.
 *
 * @param {string} name
 * @param {string} stylePath
 */
async function makeHTML(name, stylePath, body = '') {
  const styleSrc = await fs.readFile(path.join(dir, stylePath), 'utf8');
  const css = compileCSS(styleSrc, stylePath);
  const template = `<!doctype html>
<meta charset=utf-8>
<meta name=google value=notranslate>
<title>New Tab</title>
<script src=${name}.js defer></script>
<style>${css}</style>
${body}`;

  await fs.writeFile(path.join(dir, 'dist', `${name}.html`), template);
}

await makeHTML(
  'newtab',
  'src/css/newtab.xcss',
  // Theme loader as inline script for earliest possible execution start time,
  // uses localStorage so the data retrieval is synchronous/blocking to prevent
  // a flash of unstyled UI
  '<style id=t></style><script>t.textContent=localStorage.t</script>',
);
await makeHTML('settings', 'src/css/settings.xcss');

// Extension manifest
await fs.writeFile(
  path.join(dir, 'dist', 'manifest.json'),
  JSON.stringify(manifest),
);

const t0 = performance.now();

const themesDir = path.resolve('.', 'src/css/themes');
/** @type {Record<string, string>} */
const themesData = {};
const themes = await fs.readdir(themesDir);

await Promise.all(
  themes.map((theme) => fs.readFile(path.join(themesDir, theme), 'utf8').then((src) => {
    themesData[path.basename(theme, '.xcss')] = compileCSS(src, theme);
  })),
);

await fs.writeFile(
  path.join(dir, 'dist', 'themes.json'),
  JSON.stringify(themesData),
);

const t1 = performance.now();
console.log('\ndist/themes.json done in', (t1 - t0).toFixed(2), 'ms\n');
