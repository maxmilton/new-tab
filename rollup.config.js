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
const production = !process.env.ROLLUP_WATCH;

const terserOpts = {
  compress: {
    drop_console: production,
    drop_debugger: production,
    negate_iife: false, // better chrome performance when false
    passes: 2,
    pure_getters: true,
    unsafe: true,
    unsafe_proto: true,
  },
  mangle: {
    properties: {
      // NOTE: Fragile; needs attention, especially between Svelte releases.
      regex: /^(_.*|each_value.*|component|changed|previous|destroy|root|fire)$/,
      // debug: 'XX',
    },
  },
  output: {
    comments: !!process.env.DEBUG,
    wrap_iife: true,
  },
  ecma: 8,
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

// Optimise loader code
const loaderCode = minify(
  readFileSync(`${__dirname}/src/loader.js`, 'utf8'),
  Object.assign({}, terserOpts)
).code;

export default [
  // App: NTP
  {
    input: 'src/app.js',
    output: {
      sourcemap: true,
      format: 'iife',
      name: 'n',
      file: 'dist/n.js',
    },
    plugins: [
      svelte({
        dev: !production,
        preprocess: {
          // only remove whitespace in production; better feedback during development
          ...(production ? { markup: preprocessMarkup({ unsafe: true }) } : {}),
          style: preprocessStyle(),
        },
        css: (css) => {
          const cssCode = production
            ? new CleanCSS(cleanCssOpts).minify(css.code).styles
            : css.code;

          // TODO: Enable once source maps are supported in svelte preprocess()
          // const cssMap = production
          //   ? ''
          //   : `\n/*# sourceMappingURL=data:application/json;base64,${
          //     Buffer.from(JSON.stringify(css.map)).toString('base64')
          //   }*/`;
          const cssMap = '';

          // compile HTML from template
          writeFile(`${__dirname}/dist/n.html`, makeHtml({
            title: 'New Tab',
            content: `<script src=n.js defer></script><style>${cssCode}${cssMap}</style><script>${loaderCode}</script>`,
          }), catchErr);
        },
      }),
      resolve(),
      commonjs(),
      production && terser(terserOpts),
    ],
  },

  // App: Settings
  {
    input: 'src/settings.js',
    output: {
      sourcemap: true,
      format: 'iife',
      name: 's',
      file: 'dist/s.js',
    },
    plugins: [
      svelte({
        dev: !production,
        // shared: false, // not possible to override at the moment
        preprocess: {
          // only remove whitespace in production; better feedback during development
          ...(production ? { markup: preprocessMarkup({ unsafe: true }) } : {}),
          style: preprocessStyle(),
        },
        css: (css) => {
          const cssCode = production
            ? new CleanCSS(cleanCssOpts).minify(css.code).styles
            : css.code;

          // compile HTML from template
          writeFile(`${__dirname}/dist/s.html`, makeHtml({
            title: 'New Tab Settings',
            content: `<script src=s.js defer></script><style>${cssCode}</style><script>${loaderCode}</script>`,
          }), catchErr);
        },
      }),
      production && terser(terserOpts),
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
      production && terser(terserOpts),
    ],
  },

  // Background process
  {
    input: 'src/background.js',
    output: {
      sourcemap: false,
      format: 'iife',
      name: 'b',
      file: 'dist/b.js',
    },
    plugins: [
      production && terser(terserOpts),
    ],
  },
];

// Extension manifest
writeFile(`${__dirname}/dist/manifest.json`, JSON.stringify(manifest), catchErr);

// Themes
// NOTE: Dark theme is omitted because it's embedded into the page with the other CSS
makeTheme('light', 'l');
makeTheme('black', 'b');
