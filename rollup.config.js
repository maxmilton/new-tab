/* eslint-disable @typescript-eslint/camelcase, global-require */

import compiler from '@ampproject/rollup-plugin-closure-compiler';
import { writeFile } from 'fs';
import { emitHtml, handleErr } from 'minna-tools';
import { preprocess } from 'minna-ui';
import { join } from 'path';
import nodeResolve from 'rollup-plugin-node-resolve';
import svelte from 'rollup-plugin-svelte';
import typescript from 'rollup-plugin-typescript';
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

const compilerOpts = {
  charset: 'UTF-8',
  compilation_level: 'ADVANCED',
  externs: [
    resolve('google-closure-compiler/contrib/externs/chrome.js'),
    resolve('google-closure-compiler/contrib/externs/chrome_extensions.js'),
    join(__dirname, 'externs.js'),
  ],
  language_in: 'ECMASCRIPT_NEXT',
  language_out: 'ECMASCRIPT_2017',
  warning_level: 'DEFAULT',

  // debug: true,
  // formatting: 'PRETTY_PRINT',
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
      svelte(svelteOpts),
      nodeResolve(),
      typescript({
        // FIXME: Generates larger output
        // tsconfig: 'tsconfig.build.json',
        typescript: require('typescript'),
      }),
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
      svelte(svelteOpts),
      nodeResolve(),
      typescript({
        // tsconfig: 'tsconfig.build.json',
        typescript: require('typescript'),
      }),
      !isDev && compiler(compilerOpts),
      emitHtml(emitHtmlOpts),
    ],
    watch,
  },
];
