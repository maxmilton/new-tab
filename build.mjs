/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires, import/no-extraneous-dependencies */

import csso from 'csso';
import xcss from 'ekscss';
import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import manifest from './manifest.config.js';

const mode = process.env.NODE_ENV;
const dev = mode === 'development';
const dirname = path.resolve(); // no __dirname in node ESM

/** @param {Error?} err */
function handleErr(err) {
  if (err) throw err;
}

/** @param {esbuild.BuildResult} buildResult */
// this approach is flaky and could cause issues later... but it works!
function compressTemplateStrings(buildResult) {
  if (!buildResult.outputFiles) return;

  const filePath = buildResult.outputFiles[0].path;
  const code = buildResult.outputFiles[0].text
    // reduce multiple whitespace down to a single space
    .replace(/\s{2,}/gm, ' ')
    // convert remaining whitespace characters into a space
    .replace(/\s/gm, ' ')
    // remove whitespace after and before tags
    .replace(/> /g, '>')
    .replace(/ </g, '<')
    // remove whitespace at start and end of template string
    .replace(/` </g, '`<')
    .replace(/> `/g, '>`');

  fs.writeFile(filePath, code, 'utf8', handleErr);
}

// New Tab app
esbuild
  .build({
    entryPoints: ['src/newtab.ts'],
    outfile: 'dist/newtab.js',
    platform: 'browser',
    target: ['chrome88'],
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
    banner: { js: '"use strict";' },
    bundle: true,
    minify: !dev,
    sourcemap: dev,
    watch: dev,
    write: dev,
    logLevel: 'info',
  })
  .then(compressTemplateStrings)
  .catch(() => process.exit(1));

// Settings app
esbuild
  .build({
    entryPoints: ['src/settings.ts'],
    outfile: 'dist/settings.js',
    platform: 'browser',
    target: ['chrome88'],
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
    banner: { js: '"use strict";' },
    bundle: true,
    minify: !dev,
    sourcemap: dev,
    watch: dev,
    write: dev,
    logLevel: 'info',
  })
  .then(compressTemplateStrings)
  .catch(() => process.exit(1));

/**
 * Construct a HTML file and save it to disk.
 *
 * @param {string} name
 * @param {string} stylePath
 * @param {string} body
 */
function makeHTML(name, stylePath, body = '') {
  fs.readFile(path.join(dirname, stylePath), 'utf8', (err, data) => {
    if (err) throw err;

    const compiled = xcss.compile(data, {
      from: stylePath,
      map: false,
    });

    // eslint-disable-next-line no-restricted-syntax
    for (const warning of compiled.warnings) {
      // eslint-disable-next-line no-console
      console.error('XCSS WARNING:', warning.message);
    }

    const { css } = csso.minify(compiled.css, {});

    const template = `<!doctype html>
<meta charset=utf-8>
<meta name=google value=notranslate>
<title>New Tab</title>
<style>${css}</style>
<script src="${name}.js" defer></script>
${body}`;

    fs.writeFile(path.join(dirname, `dist/${name}.html`), template, handleErr);
  });
}

makeHTML(
  'newtab',
  'src/css/newtab.xcss',
  '<script>chrome.storage.local.get(null,a=>{a.t&&(document.body.className=a.t)});</script>',
);
makeHTML('settings', 'src/css/settings.xcss');

// Extension manifest
fs.writeFile(path.join(dirname, 'dist/manifest.json'), manifest, handleErr);
