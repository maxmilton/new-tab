/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable import/extensions, import/no-extraneous-dependencies, no-console */

import csso from 'csso';
import xcss from 'ekscss';
import esbuild from 'esbuild';
import { minifyTemplates, writeFiles } from 'esbuild-minify-templates';
import fs from 'fs';
import path from 'path';
import { performance } from 'perf_hooks';
import manifest from './manifest.config.js';

const mode = process.env.NODE_ENV;
const dev = mode === 'development';
const dir = path.resolve(); // no __dirname in node ESM

// esbuild-minify-templates option
process.env.MINIFY_HTML_COMMENTS = 'true';

/** @param {Error|null} err */
function handleErr(err) {
  if (err) throw err;
}

// New Tab app
esbuild
  .build({
    entryPoints: ['src/newtab.ts'],
    outfile: 'dist/newtab.js',
    platform: 'browser',
    target: ['chrome91'],
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
    banner: { js: '"use strict";' },
    bundle: true,
    minify: !dev,
    sourcemap: dev,
    watch: dev,
    write: dev,
    metafile: true,
    logLevel: 'debug',
  })
  // eslint-disable-next-line no-sequences
  .then((out) => (esbuild.analyzeMetafile(out.metafile).then(console.log), out))
  .then(minifyTemplates)
  .then(writeFiles)
  .catch(handleErr);

// Settings app
esbuild
  .build({
    entryPoints: ['src/settings.ts'],
    outfile: 'dist/settings.js',
    platform: 'browser',
    target: ['chrome91'],
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
    banner: { js: '"use strict";' },
    bundle: true,
    minify: !dev,
    sourcemap: dev,
    watch: dev,
    write: dev,
    logLevel: 'debug',
  })
  .then(minifyTemplates)
  .then(writeFiles)
  .catch(handleErr);

// Background script
esbuild
  .build({
    entryPoints: ['src/background.ts'],
    outfile: 'dist/background.js',
    format: 'esm',
    bundle: true,
    minify: !dev,
    logLevel: 'debug',
  })
  .catch(handleErr);

/**
 * Construct a HTML file and save it to disk.
 *
 * @param {string} name
 * @param {string} stylePath
 * @param {string} [body]
 */
function makeHTML(name, stylePath, body = '') {
  fs.readFile(path.join(dir, stylePath), 'utf8', (err, data) => {
    if (err) throw err;

    const compiled = xcss.compile(data, {
      from: stylePath,
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

    const { css } = csso.minify(
      csso.minify(compiled.css, {
        restructure: true,
        forceMediaMerge: true,
      }).css,
    );

    const template = `<!doctype html>
<meta charset=utf-8>
<meta name=google value=notranslate>
<title>New Tab</title>
<script src=${name}.js defer></script>
<style>${css}</style>
${body}`;

    fs.writeFile(path.join(dir, 'dist', `${name}.html`), template, handleErr);
  });
}

makeHTML(
  'newtab',
  'src/css/newtab.xcss',
  // theme loader as inline script for earliest possible execution start time,
  // uses localStorage so it's sync to prevent flash of default theme colours
  '<style id=t></style><script>t.textContent=localStorage.t</script>',
);
makeHTML('settings', 'src/css/settings.xcss');

// Extension manifest
fs.writeFile(
  path.join(dir, 'dist', 'manifest.json'),
  JSON.stringify(manifest),
  handleErr,
);

const t1 = performance.now();

const themesDir = path.resolve('.', 'src/css/themes');
const themesData = {};

const themes = await fs.promises.readdir(themesDir);
await Promise.all(
  themes.map((theme) => fs.promises.readFile(path.join(themesDir, theme), 'utf8').then((src) => {
    const compiled = xcss.compile(src, {
      from: theme,
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

    const { css } = csso.minify(
      csso.minify(compiled.css, {
        restructure: true,
        forceMediaMerge: true,
      }).css,
    );

    themesData[path.basename(theme, '.xcss')] = css;
  })),
);

await fs.promises.writeFile(
  path.join(dir, 'dist', 'themes.json'),
  JSON.stringify(themesData),
);

const t2 = performance.now();
console.log('\ndist/themes.json done in', (t2 - t1).toFixed(2), 'ms\n');
