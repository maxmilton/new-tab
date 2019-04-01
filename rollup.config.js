/* eslint-disable @typescript-eslint/camelcase, global-require */

import compiler from '@ampproject/rollup-plugin-closure-compiler';
import CleanCSS from 'clean-css';
import { writeFile } from 'fs';
import { handleErr, emitHtml } from 'minna-tools';
import { preprocess } from 'minna-ui';
import { join } from 'path';
import nodeResolve from 'rollup-plugin-node-resolve';
import svelte from 'rollup-plugin-svelte';
import typescript from 'rollup-plugin-typescript';
import manifest from './manifest.config.mjs';

const { resolve } = require;
const isDev = !!process.env.ROLLUP_WATCH;

const watch = {
  chokidar: true,
  clearScreen: false,
};

const svelteOpts = {
  dev: isDev,
  emitCss: true,
  immutable: true,
  preprocess,
};

/**
 * Build CSS output postprocessing handler; CSS minifier.
 * @param {string} css CSS code to minify.
 * @returns {Promise<string>}
 */
async function onCss(css) {
  if (isDev) return css;

  const cleancss = new CleanCSS({
    level: {
      2: {
        restructureRules: true,
      },
    },
    returnPromise: true,
  });

  const result = await cleancss.minify(css);

  result.errors.forEach((err) => console.error(err)); // eslint-disable-line no-console
  result.warnings.forEach((err) => console.warn(err)); // eslint-disable-line no-console

  return result.styles;
}

const emitHtmlOpts = {
  basePath: '',
  inlineCss: true,
  onCss,
  scriptAttr: 'async',
  template: join(__dirname, 'src/template.html'),
};

const compilerOpts = {
  charset: 'UTF-8',
  compilation_level: 'ADVANCED',
  externs: [
    resolve('google-closure-compiler/contrib/externs/chrome.js'),
    resolve('google-closure-compiler/contrib/externs/chrome_extensions.js'),
    join(__dirname, 'externs.js'),
  ],
  strict_mode_input: false, // FIXME: Duplicate `$$props` error
};

// loader.js run through closure compiler + manual tweaks
const loader =
  '<script>chrome.storage.local.get(null,a=>{a.t&&(document.body.className=a.t)});</script>';

// extension manifest
writeFile(
  join(__dirname, 'dist/manifest.json'),
  manifest,
  handleErr,
);

export default [
  {
    input: 'src/app.ts',
    output: {
      file: 'dist/n.js',
      format: 'esm',
      sourcemap: isDev,
    },
    plugins: [
      svelte(svelteOpts),
      nodeResolve(),
      typescript({
        typescript: require('typescript'),
      }),
      !isDev && compiler(compilerOpts),
      emitHtml({
        ...emitHtmlOpts,
        content: `%CSS%${loader}%JS%`,
        file: 'dist/n.html',
        title: 'New Tab',
      }),
    ],
    watch,
  },
  {
    input: 'src/settings.ts',
    output: {
      file: 'dist/s.js',
      format: 'esm',
      sourcemap: isDev,
    },
    plugins: [
      svelte(svelteOpts),
      nodeResolve(),
      typescript({
        typescript: require('typescript'),
      }),
      !isDev && compiler(compilerOpts),
      emitHtml({
        ...emitHtmlOpts,
        file: 'dist/s.html',
      }),
    ],
    watch,
  },
];
