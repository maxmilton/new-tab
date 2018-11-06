import compiler from '@ampproject/rollup-plugin-closure-compiler';
import preMarkup from '@minna-ui/pre-markup';
import preStyle from '@minna-ui/pre-style';
import { catchErr, makeHtml } from '@minna-ui/rollup-plugins';
import crass from 'crass';
import { readFileSync, writeFile } from 'fs';
import path from 'path';
import { plugin as analyze } from 'rollup-plugin-analyzer';
import svelte from 'rollup-plugin-svelte';
import manifest from './src/manifest.js';

const dev = !!process.env.ROLLUP_WATCH;

const watch = {
  chokidar: true,
  clearScreen: false,
};

const svelteOpts = {
  dev,
  preprocess: {
    // level 4 removes all " " textNodes but can break the app if it removes
    // spaces around attributes so in these cases use <!-- htmlmin:ignore -->
    markup: preMarkup({ level: dev ? 0 : 4 }),
    style: preStyle(),
  },
  emitCss: true,
  nestedTransitions: false,
  skipIntroByDefault: false,
};

const makeHtmlOpts = {
  basePath: '',
  inlineCss: true,
  onCss: css => crass.parse(css).optimize({ o1: true }).toString(),
  scriptAttr: 'async',
  template: readFileSync(path.join(__dirname, 'src/template.html'), 'utf8'),
};

const compilerOpts = {
  externs: [
    require.resolve('google-closure-compiler/contrib/externs/chrome.js'),
    require.resolve('google-closure-compiler/contrib/externs/chrome_extensions.js'),
    path.join(__dirname, 'externs.js'),
  ],
  charset: 'UTF-8',
  compilation_level: 'ADVANCED',
  // debug: true,
  // formatting: 'PRETTY_PRINT',
};

// loader.js run through closure compiler + manual tweaks
const loader = '<script>chrome.storage.local.get(null,a=>{a.t&&(document.body.className=a.t)});</script>';

// extension manifest
writeFile(
  path.join(__dirname, 'dist/manifest.json'),
  JSON.stringify(manifest),
  catchErr
);

export default [
  {
    watch,
    input: 'src/app.js',
    output: {
      file: 'dist/n.js',
      format: 'esm',
      sourcemap: dev,
    },
    plugins: [
      svelte(svelteOpts),
      !dev && compiler(compilerOpts),
      makeHtml({
        ...makeHtmlOpts,
        file: 'dist/n.html',
        title: 'New Tab',
        content: `${loader}%CSS%%JS%`,
      }),
      !dev && analyze(),
    ],
  },
  {
    watch,
    input: 'src/settings.js',
    output: {
      file: 'dist/s.js',
      format: 'esm',
      sourcemap: dev,
    },
    plugins: [
      svelte(svelteOpts),
      !dev && compiler(compilerOpts),
      makeHtml({
        ...makeHtmlOpts,
        file: 'dist/s.html',
      }),
      !dev && analyze(),
    ],
  },
];
