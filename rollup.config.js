import nodeResolve from '@rollup/plugin-node-resolve';
import { writeFile } from 'fs';
import { emitHtml, handleErr } from 'minna-tools';
import { preprocess } from 'minna-ui';
import { join } from 'path';
import esbuild from 'rollup-plugin-esbuild';
import svelte from 'rollup-plugin-svelte';
import manifest from './manifest.config.js';

const dev = process.env.NODE_ENV === 'development';

const svelteOpts = {
  compilerOptions: {
    dev,
    immutable: true,
  },
  emitCss: true,
  preprocess,
};

const esbuildOpts = {
  minify: !dev,
  target: 'es2020',
};

const emitHtmlOpts = {
  inlineCss: true,
  optimize: !dev && {
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
      format: 'iife',
      sourcemap: dev,
    },
    plugins: [
      svelte(svelteOpts),
      nodeResolve(),
      esbuild(esbuildOpts),
      emitHtml({
        ...emitHtmlOpts,
        content: `%CSS%<body>${loader}%JS%`,
        scriptAttr: '',
        title: 'New Tab',
      }),
    ],
  },
  {
    input: 'src/settings.ts',
    output: {
      assetFileNames: '[name][extname]',
      file: 'dist/s.js',
      format: 'iife',
      sourcemap: dev,
    },
    plugins: [
      svelte(svelteOpts),
      nodeResolve(),
      esbuild(esbuildOpts),
      emitHtml(emitHtmlOpts),
    ],
  },
];
