/* eslint-disable import/extensions, import/no-extraneous-dependencies, no-console */

import xcss from 'ekscss';
import esbuild from 'esbuild';
import {
  decodeUTF8,
  encodeUTF8,
  minifyTemplates,
  writeFiles,
} from 'esbuild-minify-templates';
import * as lightningcss from 'lightningcss';
import fs from 'node:fs/promises';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { manifest } from './manifest.config.mjs';

const mode = process.env.NODE_ENV;
const dev = mode === 'development';
const dir = path.resolve(); // == __dirname

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
          .filter((x) => x != null)
          .join(':')}`,
      );
    }
  }

  const minified = lightningcss.transform({
    filename: from,
    code: Buffer.from(compiled.css),
    minify: !dev,
    sourceMap: false,
    targets: {
      // eslint-disable-next-line no-bitwise
      chrome: 113 << 16,
    },
  });

  for (const warning of minified.warnings) {
    console.error('CSS WARNING:', warning.message);
  }

  return minified.code.toString();
}

/**
 * Construct a HTML file and save it to disk.
 *
 * @param {string} pageName
 * @param {string} stylePath
 */
async function makeHTML(pageName, stylePath) {
  const styleSrc = await fs.readFile(path.join(dir, stylePath), 'utf8');
  const css = compileCSS(styleSrc, stylePath);
  const template = `<!doctype html>
<meta charset=utf-8>
<meta name=google value=notranslate>
<title>New Tab</title>
<link href=${pageName}.css rel=stylesheet>
<script src=${pageName}.js type=module></script>`;

  await fs.writeFile(path.join(dir, 'dist', `${pageName}.css`), css);
  await fs.writeFile(path.join(dir, 'dist', `${pageName}.html`), template);
}

await makeHTML('newtab', 'src/css/newtab.xcss');
await makeHTML('settings', 'src/css/settings.xcss');

// Extension manifest
await fs.writeFile(
  path.join(dir, 'dist', 'manifest.json'),
  JSON.stringify(manifest()),
);

/**
 * Compile all themes, combine into a single JSON file, and save it to disk.
 */
async function makeThemes() {
  const themesDir = path.resolve('.', 'src/css/themes');
  /** @type {Record<string, string>} */
  const themesData = {};
  const themes = await fs.readdir(themesDir);

  await Promise.all(
    themes.map((theme) =>
      fs.readFile(path.join(themesDir, theme), 'utf8').then((src) => {
        themesData[path.basename(theme, '.xcss')] = compileCSS(src, theme);
      }),
    ),
  );

  await fs.writeFile(
    path.join(dir, 'dist', 'themes.json'),
    JSON.stringify(themesData),
  );
}

const t0 = performance.now();
await makeThemes();
const t1 = performance.now();
console.log('\ndist/themes.json done in', (t1 - t0).toFixed(2), 'ms\n');

/** @type {esbuild.Plugin} */
const analyzeMeta = {
  name: 'analyze-meta',
  setup(build) {
    if (!build.initialOptions.metafile) return;

    build.onEnd(
      (result) =>
        result.metafile &&
        build.esbuild.analyzeMetafile(result.metafile).then(console.log),
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
/** @type {esbuild.BuildOptions} */
const esbuildConfig1 = {
  entryPoints: ['src/newtab.ts', 'src/settings.ts'],
  outdir: 'dist',
  platform: 'browser',
  target: ['chrome113'],
  format: 'esm',
  define: { 'process.env.NODE_ENV': JSON.stringify(mode) },
  plugins: [minifyTemplates(), minifyJS, writeFiles(), analyzeMeta],
  bundle: true,
  minify: !dev,
  mangleProps: /_refs|collect|adjustPosition|closePopup/,
  sourcemap: dev,
  write: dev,
  metafile: !dev && process.stdout.isTTY,
  logLevel: 'debug',
  // XXX: Comment out to keep performance markers in non-dev builds for debugging
  pure: ['performance.mark', 'performance.measure'],
};

// Background service worker script
/** @type {esbuild.BuildOptions} */
const esbuildConfig2 = {
  entryPoints: ['src/sw.ts'],
  outdir: 'dist',
  format: 'esm',
  plugins: [analyzeMeta],
  bundle: true,
  minify: !dev,
  metafile: !dev && process.stdout.isTTY,
  logLevel: 'debug',
};

if (dev) {
  const context1 = await esbuild.context(esbuildConfig1);
  const context2 = await esbuild.context(esbuildConfig2);
  await Promise.all([context1.watch(), context2.watch()]);
} else {
  await esbuild.build(esbuildConfig1);
  await esbuild.build(esbuildConfig2);
}
