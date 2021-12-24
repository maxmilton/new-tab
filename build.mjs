/* eslint-disable import/extensions, import/no-extraneous-dependencies, no-console */

// NOTE: In testing, fastest page load times are achieved by using:
// - Main styles: Inline <style> (vs. external stylesheet)
// - Theme: Inline <style> + textContent (vs. CSSStyleSheet + replaceSync + adoptedStyleSheets)
//    ↳ Better cross-browser compatibility too; firefox support OK
//    ↳ But needs CSP unsafe-inline... performance over security in this case
// - Markup: Omit unnecessary things (vs. explicit <html>, <head>, etc.)

import * as csso from 'csso';
import xcss from 'ekscss';
import esbuild from 'esbuild';
import {
  decodeUTF8,
  encodeUTF8,
  minifyTemplates,
  writeFiles,
} from 'esbuild-minify-templates';
import fs from 'fs/promises';
import path from 'path';
import { performance } from 'perf_hooks';
import manifest from './manifest.config.js';

const mode = process.env.NODE_ENV;
const dev = mode === 'development';
const dir = path.resolve(); // loose alternative to __dirname in node ESM

/** @type {esbuild.Plugin} */
const analyzeMeta = {
  name: 'analyze-meta',
  setup(build) {
    if (!build.initialOptions.metafile) return;

    build.onEnd(
      (result) => result.metafile
        && build.esbuild.analyzeMetafile(result.metafile).then(console.log),
    );
  },
};

/** @type {esbuild.Plugin} */
const minifyJS = {
  name: 'minify-js',
  setup(build) {
    if (!build.initialOptions.minify) return;

    build.onEnd(async (result) => {
      if (!result.outputFiles) return;

      for (let index = 0; index < result.outputFiles.length; index++) {
        const file = result.outputFiles[index];

        if (path.extname(file.path) === '.js') {
          // eslint-disable-next-line no-await-in-loop
          const out = await build.esbuild.transform(decodeUTF8(file.contents), {
            loader: 'js',
            minify: true,
            // target: build.initialOptions.target,
          });

          // eslint-disable-next-line no-param-reassign
          result.outputFiles[index].contents = encodeUTF8(out.code);
        }
      }
    });
  },
};

// New Tab & Settings apps
await esbuild.build({
  entryPoints: ['src/newtab.ts', 'src/settings.ts'],
  outdir: 'dist',
  platform: 'browser',
  target: ['chrome95'],
  define: { 'process.env.NODE_ENV': JSON.stringify(mode) },
  banner: { js: '"use strict";' },
  plugins: [minifyTemplates(), minifyJS, writeFiles(), analyzeMeta],
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
  outdir: 'dist',
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
    forceMediaMerge: true, // unsafe!
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
  // Theme loader as inline script for earliest possible execution start time +
  // use localStorage for synchronous data retrieval to prevent FOUC
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
