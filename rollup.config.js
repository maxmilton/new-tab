import { readFileSync, writeFile } from 'fs';
import path from 'path';
import preprocessMarkup from '@minna-ui/svelte-preprocess-markup';
import preprocessStyle from '@minna-ui/svelte-preprocess-style';
import svelte from 'rollup-plugin-svelte';
import compiler from '@ampproject/rollup-plugin-closure-compiler';
import { plugin as analyze } from 'rollup-plugin-analyzer';
import makeHtml from './rollup-plugin-make-html.js';
import manifest from './manifest.js';

const htmlTemplate = readFileSync(`${__dirname}/src/template.html`, 'utf8');
const dev = !!process.env.ROLLUP_WATCH;

const compilerOpts = {
  externs: [
    require.resolve('google-closure-compiler/contrib/externs/chrome.js'),
    require.resolve('google-closure-compiler/contrib/externs/chrome_extensions.js'),
    path.join(__dirname, 'component-externs.js'),
  ],
  compilation_level: 'ADVANCED',
  // language_in: 'ECMASCRIPT_NEXT',
  // language_out: 'STABLE',
  charset: 'UTF-8',
  // strict_mode_input: true,
  // use_types_for_optimization: true,
  // warning_level: 'VERBOSE',
  // jscomp_warning: '*',
  // jscomp_error: '*',
  jscomp_off: 'duplicate', // FIXME: Deprecated `methods` var

  // uncomment for debugging
  // formatting: 'PRETTY_PRINT',
  // debug: true,
};

/**
 * Generic error handler for nodejs callbacks.
 * @param {Error} err
 */
function catchErr(err) { if (err) throw err; }

const svelteOpts = {
  dev,
  preprocess: {
    ...(dev ? {} : { markup: preprocessMarkup({
      unsafeWhitespace: true,
      unsafe: true,

      // XXX: Removes even more " " textNodes but can break the app if it removes
      // spaces around attributes so be mindful; use <!-- htmlmin:ignore -->
      trimCustomFragments: true,
      removeComments: true,
    }) }),
    style: preprocessStyle(),
  },
  emitCss: true,
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
        template: htmlTemplate,
        file: 'dist/n.html',
        title: 'New Tab',
        // XXX: First script is `loader.js` run through closure compiler + manual tweaks
        // TODO: Automate this again + manifest hash so it's easy to make changes to
        // loader.js -- could it be part of `makeHtml` to make it generic and reusable?
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
        template: htmlTemplate,
        file: 'dist/s.html',
        content: '%CSS%<script src=s.js async></script>',
      }),
      !dev && analyze(),
    ],
  },
];
