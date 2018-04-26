import fs from 'fs';
import svelte from 'rollup-plugin-svelte';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
// import buble from 'rollup-plugin-buble';
import uglify from 'rollup-plugin-uglify';
import postcssLoadConfig from 'postcss-load-config';
import postcss from 'postcss';
import manifest from './manifest';

const production = !process.env.ROLLUP_WATCH;
const nameCache = {};

const banner = `New Tab ${process.env.APP_RELEASE} | github.com/MaxMilton/new-tab`;
const template = fs.readFileSync(`${__dirname}/src/template.html`, 'utf8');

// configuration for UglifyJS
const uglifyOpts = {
  compress: {
    drop_console: production,
    drop_debugger: production,
    negate_iife: false, // better performance when false
    passes: 2,
    pure_getters: true,
    unsafe: true,
    unsafe_proto: true,
  },
  mangle: {
    properties: {
      // NOTE: Fragile; needs close attention especially between Svelte releases!
      regex: /^(_.*|each_value.*|.*_index.*|component|changed|previous|destroy)$/,
      // debug: 'XX',
    },
  },
  output: {
    comments: !!process.env.DEBUG,
    wrap_iife: true,
  },
  nameCache,
  ecma: 8,
  toplevel: true,
  warnings: !!process.env.DEBUG,
};

/**
 * Generic error handler for nodejs callbacks.
 * @param {Error} err
 */
function catchErr(err) { if (err) throw err; }

/**
 * Preprocess PostCSS code into CSS for Svelte.
 * @param {object} obj
 * @param {string} obj.content Contents of the style elements or CSS.
 * @param {string} obj.filename Full path to the file containing the CSS.
 * @returns {object} An object containing CSS code and source map.
 */
function sveltePostcss({ content, filename }) {
  return postcssLoadConfig({}).then(({ plugins }) =>
    postcss(plugins)
      .process(content, {
        from: filename,
        to: filename,
      })
      .then(result => ({
        code: result.css,
        map: result.map,
      }))
  ); // eslint-disable-line function-paren-newline
}

/**
 * Ultra-minimal template engine.
 * @see https://github.com/Drulac/template-literal
 * @param {string} html A HTML template to compile.
 * @returns {Function}
 */
function compileHtml(html) {
  return new Function('d', 'return `' + html + '`'); // eslint-disable-line
}

export default [
  // App: NTP
  {
    input: 'src/app.js',
    output: {
      sourcemap: true,
      banner: `/* ${banner} */`,
      format: 'iife',
      name: 'ntp',
      file: 'dist/ntp.js',
    },
    plugins: [
      svelte({
        dev: !production,
        preprocess: {
          style: sveltePostcss,
        },
        css: (css) => {
          // compile HTML from template
          fs.writeFile(`${__dirname}/dist/ntp.html`, compileHtml(template)({
            banner: `<!-- ${banner} -->\n`,
            title: 'New Tab',
            // head: `<script src=${jsFileName} defer></script>\n<style>${await cssCode}</style>\n${scripts}<script>${await loaderCode}</script>`,
            head: `<script src=ntp.js defer></script>\n<style>${css.code}</style>`,
            body: '<div id=a><div class="b f">Other bookmarks</div></div><div id=m><div id=i>☰</div></div><div class=c><input type=text id=s></div>',
          }), catchErr);
        },
      }),

      resolve(),
      commonjs(),

      // production && buble({ exclude: 'node_modules/**' }),
      production && uglify(uglifyOpts),
    ],
  },

  // App: Settings
  {
    input: 'src/settings.js',
    output: {
      sourcemap: false,
      banner: `/* ${banner} */`,
      format: 'iife',
      name: 's',
      file: 'dist/s.js',
    },
    plugins: [
      svelte({
        dev: !production,
        preprocess: {
          style: sveltePostcss,
        },
        css: (css) => {
          // compile HTML from template
          fs.writeFile(`${__dirname}/dist/s.html`, compileHtml(template)({
            banner: `<!-- ${banner} -->\n`,
            title: 'Settings | New Tab',
            head: `<script src=s.js defer></script>\n<style>${css.code}</style>`,
            body: '',
          }), catchErr);
        },
      }),

      // production && buble({ exclude: 'node_modules/**' }),
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

// extension manifest
fs.writeFile(`${__dirname}/dist/manifest.json`, JSON.stringify(manifest), catchErr);
