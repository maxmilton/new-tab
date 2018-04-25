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

const template = fs.readFileSync(`${__dirname}/src/template.html`, 'utf8');
const banner = `New Tab ${process.env.APP_RELEASE} | github.com/MaxMilton/new-tab`;

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
  // FIXME: Redo this as which props are safe to mangle has changed between releases
  mangle: {
    properties: {
      // Bad patterns: children, pathname, previous
      // Suspect: nodeName
      // regex: /^(__.*|state|actions|attributes|isExact|exact|subscribe|detail|params|render|oncreate|onupdate|onremove|ondestroy|nodeName)$/,
      regex: /^(__.*)$/,
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

// TODO: Make this generic and also use it to load the settings page
/**
 * Compile HTML from template
 */
function renderHtml() {
  return {
    name: 'renderHtml',
    onwrite(opts, bundle) {
      // console.log('\n\n@@ 111', opts);
      // console.log('\n\n@@ 222', bundle);

      return fs.writeFile(`${__dirname}/dist/ntp.html`, compileHtml(template)({
        banner: `<!-- ${banner} -->\n`,
        title: 'New Tab',
        // head: `<script src=${jsFileName} defer></script>\n<style>${await cssCode}</style>\n${scripts}<script>${await loaderCode}</script>`,
        head: '<script src=ntp.js defer></script><link rel=stylesheet href=ntp.css>',
        body: '<div id=a><div id=b></div><div class="b f">Other bookmarks</div></div><div id=m><div id=i>☰</div></div><div class=c><input type=text placeholder="Search tabs, bookmarks, and history..." id=s><h2>Open Tabs (</h2></div>',
      }), catchErr);
    },
  };
}

// NTP
export default {
  input: 'src/main.js',
  output: {
    sourcemap: true,
    format: 'iife',
    name: 'ntp',
    file: 'dist/ntp.js',
  },
  plugins: [
    // TODO: Review and add anything interesting from: https://github.com/sveltejs/svelte#api
    svelte({
      // enable run-time checks when not in production
      dev: !production,

      preprocess: {
        // TODO: Source map support
        style: ({ content, filename }) =>
          postcssLoadConfig({}).then(({ plugins }) =>
            postcss(plugins)
              .process(content, {
                from: filename,
              })
              .then((code) => ({ code }))
          ),
      },

      // extract component CSS into a separate file
      css: (css) => {
        css.write('dist/ntp.css');
      },
      // css: false,
    }),

    // resolve(),
    resolve({
      jsnext: true,
      extensions: ['.js', '.json', '.css'],
    }),
    commonjs(),

    // production && buble({ exclude: 'node_modules/**' }),
    production && uglify(uglifyOpts),

    // compile HTML
    renderHtml(),
  ],
};

// extension manifest
fs.writeFile(`${__dirname}/dist/manifest.json`, JSON.stringify(manifest), catchErr);
