import { readFileSync, writeFile } from 'fs';
import path from 'path';
import preprocessMarkup from '@minna-ui/svelte-preprocess-markup';
import preprocessStyle from '@minna-ui/svelte-preprocess-style';
import svelte from 'rollup-plugin-svelte';
import compiler from '@ampproject/rollup-plugin-closure-compiler';
import { plugin as analyze } from 'rollup-plugin-analyzer';
import { makeHtml } from './rollup-plugins.js';
import manifest from './manifest.js';

const template = readFileSync(`${__dirname}/src/template.html`, 'utf8');
const dev = !!process.env.ROLLUP_WATCH;

const compilerOpts = {
  externs: [
    require.resolve('google-closure-compiler/contrib/externs/chrome.js'),
    require.resolve('google-closure-compiler/contrib/externs/chrome_extensions.js'),
    path.join(__dirname, 'externs.js'),
  ],
  charset: 'UTF-8',
  compilation_level: 'ADVANCED',
  // language_in: 'ECMASCRIPT_NEXT',
  // language_out: 'STABLE',
  // language_out: 'ECMASCRIPT_NEXT',
  // strict_mode_input: true,
  // use_types_for_optimization: true,
  // warning_level: 'VERBOSE',
  // jscomp_warning: '*',
  // jscomp_error: '*',
  // jscomp_off: 'duplicate', // FIXME: Deprecated `methods` var
  // debug: true,
  // formatting: 'PRETTY_PRINT',
};

/**
 * Generic error handler for nodejs callbacks.
 * @param {Error} err
 */
function catchErr(err) { if (err) throw err; }

const svelteOpts = {
  dev,
  preprocess: {
    // XXX: Level 4 removes all " " textNodes but can break the app if it removes
    // spaces around attributes so in these cases use <!-- htmlmin:ignore -->
    markup: preprocessMarkup({ level: dev ? 0 : 4 }),
    style: preprocessStyle(),
  },
  emitCss: true,
  nestedTransitions: false,
  skipIntroByDefault: false,
};

const watch = {
  chokidar: true,
  clearScreen: false,
};

// extension manifest
writeFile(`${__dirname}/dist/manifest.json`, JSON.stringify(manifest), catchErr);

export default [
  /** New Tab Page app */
  {
    watch,
    input: 'src/app.js',
    output: {
      sourcemap: dev,
      format: 'esm',
      file: 'dist/n.js',
    },
    plugins: [
      svelte(svelteOpts),
      !dev && compiler(compilerOpts),
      makeHtml({
        template,
        file: 'dist/n.html',
        title: 'New Tab',
        // first script is loader.js run through closure compiler + manual tweaks
        content: '<script>chrome.storage.local.get(null,a=>{a.t&&(document.body.className=a.t)});</script>%CSS%<script src=n.js async></script>',
      }),
      !dev && analyze(),
    ],
  },

  /** Settings app */
  {
    watch,
    input: 'src/settings.js',
    output: {
      sourcemap: dev,
      format: 'esm',
      file: 'dist/s.js',
    },
    plugins: [
      svelte(svelteOpts),
      !dev && compiler(compilerOpts),
      makeHtml({
        template,
        file: 'dist/s.html',
        content: '%CSS%<script src=s.js async></script>',
      }),
      !dev && analyze(),
    ],
  },
];
