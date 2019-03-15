/* eslint-disable global-require */

import compiler from '@ampproject/rollup-plugin-closure-compiler';
import preMarkup from '@minna-ui/pre-markup';
import preStyle from '@minna-ui/pre-style';
import { catchErr, makeHtml } from '@minna-ui/rollup-plugins';
import crass from 'crass';
import { readFileSync, writeFile } from 'fs';
import { join } from 'path';
import { plugin as analyze } from 'rollup-plugin-analyzer';
import svelte from 'rollup-plugin-svelte';
import typescript from 'rollup-plugin-typescript';
import manifest from './manifest.config.mjs';
import nodeResolve from 'rollup-plugin-node-resolve';

const { resolve } = require;
const isDev = !!process.env.ROLLUP_WATCH;
const isDebug = !!process.env.DEBUG;

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

/* eslint-disable @typescript-eslint/camelcase */
const compilerOpts = {
  charset: 'UTF-8',
  compilation_level: 'ADVANCED',
  externs: [
    resolve('google-closure-compiler/contrib/externs/chrome.js'),
    resolve('google-closure-compiler/contrib/externs/chrome_extensions.js'),
    join(__dirname, 'externs.js'),
  ],
  // language_in: 'ECMASCRIPT_NEXT',
  // language_out: 'STABLE',
  // warning_level: 'VERBOSE',
  // jscomp_off: ['duplicate', 'globalThis'],

  // debug: true,
  // formatting: 'PRETTY_PRINT',
};
/* eslint-enable @typescript-eslint/camelcase */

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
        content: `${loader}%CSS%%JS%`,
        file: 'dist/n.html',
        title: 'New Tab',
      }),
      isDebug && analyze(),
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
      isDebug && analyze(),
    ],
    watch,
  },
];
