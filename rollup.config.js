import { readFile, readFileSync, writeFile } from 'fs';
import preprocessMarkup from '@minna-ui/svelte-preprocess-markup';
import preprocessStyle from '@minna-ui/svelte-preprocess-style';
import svelte from 'rollup-plugin-svelte';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import { minify } from 'terser'; // eslint-disable-line import/no-extraneous-dependencies
import CleanCSS from 'clean-css';
import manifest from './manifest';

const template = readFileSync(`${__dirname}/src/template.html`, 'utf8');
const isProd = !process.env.ROLLUP_WATCH;
const nameCache = {};

const terserOpts = {
  compress: {
    drop_console: isProd,
    drop_debugger: isProd,
    negate_iife: false, // better chrome performance when false
    passes: 2,
    pure_getters: true,
    unsafe: true,
    unsafe_arrows: true,
    unsafe_comps: true,
    unsafe_Function: true,
    unsafe_math: true,
    unsafe_methods: true,
    unsafe_proto: true,
    unsafe_regexp: true,
    unsafe_undefined: true,
    hoist_funs: true,
  },
  mangle: {
    properties: {
      // NOTE: Fragile; needs attention, especially between Svelte releases.
      regex: /^(_.*|each_value.*|component|changed|previous|destroy|root|fire|current|intro)$/,
      reserved: ['l', 'u', 'q'],
      // debug: 'XX',
    },
    reserved: ['l', 'u', 'q'],
  },
  output: {
    comments: !!process.env.DEBUG,
    wrap_iife: true,
  },
  nameCache,
  ecma: 8,
  module: true,
  toplevel: true,
  warnings: !!process.env.DEBUG,
};

const cleanCssOpts = {
  level: {
    1: { all: true },
    2: { all: true },
  },
};

/**
 * Generic error handler for nodejs callbacks.
 * @param {Error} err
 */
function catchErr(err) { if (err) throw err; }

/**
 * Ultra-minimal template engine.
 * @see https://github.com/Drulac/template-literal
 * @param {string} html A HTML template to compile.
 * @returns {Function}
 */
function compileHtml(html) {
  return new Function('d', 'return `' + html + '`'); // eslint-disable-line
}

const makeHtml = compileHtml(template);

/**
 * Compile a New Tab theme.
 * @param {string} nameLong The input file name.
 * @param {string} nameShort The output file name.
 */
function makeTheme(nameLong, nameShort) {
  readFile(`${__dirname}/src/themes/${nameLong}.css`, 'utf8', async (err, res) => {
    if (err) throw err;

    const css = new CleanCSS(cleanCssOpts).minify(res).styles;
    writeFile(`${__dirname}/dist/${nameShort}.css`, css, catchErr);
  });
}

// errors init script
const errorsInitCode = minify(
  readFileSync(`${__dirname}/src/errors-init.js`, 'utf8'),
  Object.assign({}, terserOpts)
).code;

// loader script
const loaderCode = minify(
  readFileSync(`${__dirname}/src/loader.js`, 'utf8'),
  Object.assign({}, terserOpts)
).code;

export default [
  // App: NTP
  {
    input: 'src/app.js',
    output: {
      sourcemap: !isProd,
      format: 'es',
      name: 'n',
      file: 'dist/n.js',
    },
    plugins: [
      svelte({
        dev: !isProd,
        immutable: true, // better performance but be aware during development
        preprocess: {
          // only remove whitespace in production; better feedback during development
          ...(isProd ? { markup: preprocessMarkup({ unsafe: true }) } : {}),
          style: preprocessStyle(),
        },
        css: (css) => {
          const cssCode = isProd
            ? (() => {
              // run CSS minification twice for better compression
              const code = new CleanCSS(cleanCssOpts).minify(css.code).styles;
              return new CleanCSS(cleanCssOpts).minify(code).styles;
            })()
            : css.code;

          // add CSS source map data
          const cssMap = isProd
            ? ''
            : `\n/*# sourceMappingURL=data:application/json;base64,${
              Buffer.from(JSON.stringify(css.map)).toString('base64')
            }*/`;

          // compile HTML from template
          writeFile(`${__dirname}/dist/n.html`, makeHtml({
            title: 'New Tab',
            content: `<style>${cssCode}${cssMap}</style><script>${errorsInitCode}</script><script src=n.js type=module async></script><script type=module async>${loaderCode}</script>`,
          }).trim(), catchErr);
        },
        // XXX: Svelte v3 defaults
        // skipIntroByDefault: true,
        // nestedTransitions: false,
      }),
      resolve(),
      commonjs(),
      isProd && terser(terserOpts),
    ],
  },

  // App: Settings
  {
    input: 'src/settings.js',
    output: {
      sourcemap: !isProd,
      format: 'es',
      name: 's',
      file: 'dist/s.js',
    },
    plugins: [
      svelte({
        dev: !isProd,
        preprocess: {
          // only remove whitespace in production; better feedback during development
          ...(isProd ? { markup: preprocessMarkup({ unsafe: true }) } : {}),
          style: preprocessStyle(),
        },
        css: (css) => {
          const cssCode = isProd
            ? new CleanCSS(cleanCssOpts).minify(css.code).styles
            : css.code;

          // compile HTML from template
          writeFile(`${__dirname}/dist/s.html`, makeHtml({
            title: 'New Tab Settings',
            content: `<style>${cssCode}</style><script>${errorsInitCode}</script><script src=s.js type=module async></script><script type=module async>${loaderCode}</script>`,
          }).trim(), catchErr);
        },
      }),
      isProd && terser(terserOpts),
    ],
  },

  // Error tracking
  {
    input: 'src/errors.js',
    output: {
      sourcemap: false,
      format: 'iife',
      name: 'e',
      file: 'dist/e.js',
    },
    plugins: [
      resolve(),
      commonjs(),
      isProd && terser(terserOpts),
    ],
  },

  // Background process
  {
    input: 'src/background.js',
    output: {
      sourcemap: false,
      format: 'es',
      name: 'b',
      file: 'dist/b.js',
    },
    plugins: [
      isProd && terser(terserOpts),
    ],
  },
];

// Extension manifest
writeFile(`${__dirname}/dist/manifest.json`, JSON.stringify(manifest), catchErr);

// Themes
// NOTE: Dark theme is omitted because it's embedded into the page with the other CSS
makeTheme('light', 'l');
makeTheme('black', 'b');
