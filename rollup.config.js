import fs from 'fs';
import preprocessMarkup from '@minna-ui/svelte-preprocess-markup';
import preprocessStyle from '@minna-ui/svelte-preprocess-style';
import svelte from 'rollup-plugin-svelte';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import uglify from 'rollup-plugin-uglify';
import CleanCSS from 'clean-css';
import manifest from './manifest';

const production = !process.env.ROLLUP_WATCH;

const banner = `New Tab ${process.env.APP_RELEASE} | github.com/MaxMilton/new-tab`;
const template = fs.readFileSync(`${__dirname}/src/template.html`, 'utf8');

const uglifyOpts = {
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
      regex: /^(_.*|each_value.*|.*_index.*|component|changed|previous|destroy|root|fire)$/,
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

/**
 * Compile a New Tab theme.
 * @param {string} nameLong The input file name.
 * @param {string} nameShort The output file name.
 */
function makeTheme(nameLong, nameShort) {
  fs.readFile(`${__dirname}/src/themes/${nameLong}.css`, 'utf8', async (err, res) => {
    if (err) throw err;

    const css = new CleanCSS(cleanCssOpts).minify(res).styles;
    fs.writeFile(`${__dirname}/dist/${nameShort}.css`, css, catchErr);
  });
}

// Optimise loader code
// eslint-disable-next-line import/no-extraneous-dependencies
const loaderCode = require('uglify-es').minify(
  fs.readFileSync(`${__dirname}/src/loader.js`, 'utf8'),
  Object.assign({}, uglifyOpts)
).code;

export default [
  // App: NTP
  {
    input: 'src/app.js',
    output: {
      sourcemap: true,
      banner: `/* ${banner} */`,
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

          // TODO: Once source maps are supported in svelte preprocessors, enable this:
          // const cssMap = production
          //   ? ''
          //   : `\n/*# sourceMappingURL=data:application/json;base64,${Buffer.from(JSON.stringify(css.map)).toString('base64')}*/`;
          const cssMap = '';

          // compile HTML from template
          fs.writeFile(`${__dirname}/dist/n.html`, compileHtml(template)({
            banner,
            title: 'New Tab',
            content: `<script src=n.js defer></script>\n<style>${cssCode}${cssMap}</style>\n<script>${loaderCode}</script>`,
          }), catchErr);
        },
      }),
      resolve(),
      commonjs(),
      production && uglify(uglifyOpts),
    ],
  },

  // App: Settings
  {
    input: 'src/settings.js',
    output: {
      sourcemap: true,
      banner: `/* ${banner} */`,
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
          fs.writeFile(`${__dirname}/dist/s.html`, compileHtml(template)({
            banner,
            title: 'New Tab Settings',
            content: `<script src=s.js defer></script>\n<style>${cssCode}</style>\n<script>${loaderCode}</script>`,
          }), catchErr);
        },
      }),
      production && uglify(uglifyOpts),
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
      production && uglify(uglifyOpts),
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
      production && uglify(uglifyOpts),
    ],
  },
];

// Extension manifest
fs.writeFile(`${__dirname}/dist/manifest.json`, JSON.stringify(manifest), catchErr);

// Themes
// NOTE: Dark theme is omitted because it's embedded into the page with the other CSS
makeTheme('light', 'l');
makeTheme('black', 'b');
