/* eslint-disable @typescript-eslint/camelcase, global-require */

import compiler from '@ampproject/rollup-plugin-closure-compiler';
import preMarkup from '@minna-ui/pre-markup';
import preStyle from '@minna-ui/pre-style';
import { catchErr, makeHtml } from '@minna-ui/rollup-plugins';
import crass from 'crass';
import { readFileSync, writeFile } from 'fs';
import { join } from 'path';
import nodeResolve from 'rollup-plugin-node-resolve';
import svelte from 'rollup-plugin-svelte';
import typescript from 'rollup-plugin-typescript';
import manifest from './manifest.config.js';

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
  preprocess: {
    markup: preMarkup({ enabled: !isDev }),
    style: preStyle(),
  },
};

const makeHtmlOpts = {
  basePath: '',
  inlineCss: true,
  onCss: (css) =>
    crass
      .parse(css)
      .optimize({ o1: true })
      .toString(),
  scriptAttr: 'async',
  template: readFileSync(join(__dirname, 'src/template.html'), 'utf8'),
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
  catchErr,
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
      makeHtml({
        ...makeHtmlOpts,
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
      makeHtml({
        ...makeHtmlOpts,
        file: 'dist/s.html',
      }),
    ],
    watch,
  },
];
