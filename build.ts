/* eslint-disable import/no-extraneous-dependencies, no-console */

import * as xcss from 'ekscss';
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
import { manifest } from './manifest.config';

const mode = Bun.env.NODE_ENV;
const dev = mode === 'development';

/**
 * Generate minified CSS from XCSS source.
 */
function compileCSS(src: string, from: string) {
  const compiled = xcss.compile(src, { from });

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
    targets: { chrome: 113 << 16 }, // eslint-disable-line no-bitwise
  });

  for (const warning of minified.warnings) {
    console.error('CSS WARNING:', warning.message);
  }

  return minified.code.toString();
}

/**
 * Construct a HTML file and save it to disk.
 */
async function makeHTML(pageName: string, stylePath: string) {
  const styleSrc = await Bun.file(stylePath).text();
  const css = compileCSS(styleSrc, stylePath);
  const template = `<!doctype html>
<meta charset=utf-8>
<meta name=google value=notranslate>
<title>New Tab</title>
<link href=${pageName}.css rel=stylesheet>
<script src=${pageName}.js type=module async></script>`;

  await Bun.write(`dist/${pageName}.css`, css);
  await Bun.write(`dist/${pageName}.html`, template);
}

await makeHTML('newtab', 'src/css/newtab.xcss');
await makeHTML('settings', 'src/css/settings.xcss');

// Extension manifest
await Bun.write('dist/manifest.json', JSON.stringify(manifest()));

/**
 * Compile all themes, combine into a single JSON file, and save it to disk.
 */
async function makeThemes() {
  const themes = await fs.readdir('src/css/themes');
  const themesData: Record<string, string> = {};

  await Promise.all(
    themes.map((theme) =>
      Bun.file(`src/css/themes/${theme}`)
        .text()
        .then((src) => {
          themesData[path.basename(theme, '.xcss')] = compileCSS(src, theme);
        }),
    ),
  );

  await Bun.write('dist/themes.json', JSON.stringify(themesData));
}

console.time('themes');
await makeThemes();
console.timeEnd('themes');

const analyzeMeta: esbuild.Plugin = {
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

/**
 * Minify JavaScript output.
 *
 * Although esbuild already minifies JS when creating output bundles, it needs
 * a second pass to apply all possible optimizations.
 */
const minifyJS: esbuild.Plugin = {
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

// FIXME: Migrate from esbuild to Bun.build once it supports:
//  ↳ All required plugin hooks; onLoad, onEnd (with outputFiles, or ideally
//    some other way to intercept output code before it's written to disk, or
//    else we'll need to read the files and then save to disk again possibly
//    including sourcemaps for dev)
//    ↳ Mainly for the `minifyTemplates` plugin
//    ↳ It's kind of already possible to do onEnd using the build outputs
//      BuildArtifact which have a FileRef (same thing as Bun.file() returns)
//      ↳ Actually, BuildArtifact extends Blob, so it's possible to interact
//        with it directly; https://bun.sh/blog/bun-bundler#build-outputs
//  ↳ `mangleProps`
//  ↳ `pure`
//  ↳ Browser version targeting
//  ↳ `metafile` for bundle size analysis is a nice to have

// New Tab & Settings apps
const esbuildConfig1: esbuild.BuildOptions = {
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
const esbuildConfig2: esbuild.BuildOptions = {
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
  // Watch for changes in dev mode
  const context1 = await esbuild.context(esbuildConfig1);
  const context2 = await esbuild.context(esbuildConfig2);
  await Promise.all([context1.watch(), context2.watch()]);
} else {
  console.time('esbuild');
  await esbuild.build(esbuildConfig1);
  console.timeLog('esbuild');
  await esbuild.build(esbuildConfig2);
  console.timeEnd('esbuild');
}
