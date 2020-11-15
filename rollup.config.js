/* eslint-disable @typescript-eslint/camelcase */

// @ts-ignore - FIXME: Doesn't provide types
import compiler from '@ampproject/rollup-plugin-closure-compiler';
import nodeResolve from '@rollup/plugin-node-resolve';
// @ts-ignore - FIXME: Doesn't provide types
import sucrase from '@rollup/plugin-sucrase';
import { writeFile } from 'fs';
import { emitHtml, handleErr } from 'minna-tools';
import { preprocess } from 'minna-ui';
import { join } from 'path';
// @ts-ignore - FIXME: Doesn't provide types
import svelte from 'rollup-plugin-svelte';
// @ts-ignore - TS can't resolve .mjs files yet
import manifest from './manifest.config.mjs';

const { resolve } = require;
const isDev = !!process.env.ROLLUP_WATCH;

const watch = {
  clearScreen: false,
};

const svelteOpts = {
  dev: isDev,
  emitCss: true,
  immutable: true,
  preprocess,
  preserveWhitespace: true, // Results in smaller code with closure compiler
};

const sucraseOpts = {
  exclude: ['**/*.css'],
  transforms: ['typescript'],
};

const compilerOpts = {
  charset: 'UTF-8',
  compilation_level: 'ADVANCED',
  externs: [
    resolve('google-closure-compiler/contrib/externs/chrome.js'),
    resolve('google-closure-compiler/contrib/externs/chrome_extensions.js'),
    join(__dirname, 'externs.js'),
  ],
  // debug: true,
  // formatting: 'PRETTY_PRINT',
};

const emitHtmlOpts = {
  inlineCss: true,
  optimize: !isDev && {
    level: {
      2: {
        restructureRules: true,
      },
    },
  },
  scriptAttr: 'async',
  template: 'src/template.html',
};

// Theme loader
const loader =
  '<script>chrome.storage.local.get(null,a=>{a.t&&(document.body.className=a.t)});</script>';

// Extension manifest
writeFile(join(__dirname, 'dist/manifest.json'), manifest, handleErr);

export default [
  {
    input: 'src/app.ts',
    output: {
      assetFileNames: '[name][extname]',
      file: 'dist/n.js',
      format: 'esm',
      sourcemap: isDev,
    },
    plugins: [
      // @ts-ignore - TODO: Remove this once package types are fixed
      svelte(svelteOpts),
      nodeResolve(),
      sucrase(sucraseOpts),
      !isDev && compiler(compilerOpts),
      emitHtml({
        ...emitHtmlOpts,
        content: `%CSS%<body>${loader}%JS%`,
        scriptAttr: '',
        title: 'New Tab',
      }),
    ],
    watch,
  },
  {
    input: 'src/settings.ts',
    output: {
      assetFileNames: '[name][extname]',
      file: 'dist/s.js',
      format: 'esm',
      sourcemap: isDev,
    },
    plugins: [
      // @ts-ignore - TODO: Remove this once package types are fixed
      svelte(svelteOpts),
      nodeResolve(),
      sucrase(sucraseOpts),
      !isDev && compiler(compilerOpts),
      emitHtml(emitHtmlOpts),
    ],
    watch,
  },
];
