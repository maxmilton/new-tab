import { readFileSync, writeFile } from 'fs';
import path from 'path';
import preprocessMarkup from '@minna-ui/svelte-preprocess-markup';
import preprocessStyle from '@minna-ui/svelte-preprocess-style';
import svelte from 'rollup-plugin-svelte';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { minify } from 'terser'; // eslint-disable-line import/no-extraneous-dependencies
import { compiler as ClosureCompiler } from 'google-closure-compiler'; // eslint-disable-line import/no-extraneous-dependencies
import compiler from '@ampproject/rollup-plugin-closure-compiler';
import { createFilter } from 'rollup-pluginutils'; // eslint-disable-line import/no-extraneous-dependencies
import crass from 'crass';
import { plugin as analyze } from 'rollup-plugin-analyzer';
import manifest from './manifest';

const docTemplate = readFileSync(`${__dirname}/src/template.html`, 'utf8');
const isProd = !process.env.ROLLUP_WATCH;

// TODO: Replace terser with Closure Compiler once it can parse dynamic import https://github.com/google/closure-compiler/issues/2770
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
      regex: /^(_.+|each_value.*|component|changed|previous|destroy|root|fire|current|intro)$/,
      reserved: ['p', 'q'],
      // debug: 'XX',
    },
    reserved: ['p', 'q'],
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

const externs = [
  './node_modules/google-closure-compiler/contrib/externs/chrome.js',
  './node_modules/google-closure-compiler/contrib/externs/chrome_extensions.js',
  './node_modules/google-closure-compiler/contrib/externs/svg.js',
  './externs.js',
];

const compilerOpts = {
  externs,
  compilationLevel: 'ADVANCED',
};

const compilerOptsSimple = {
  externs,
};

/**
 * Generic error handler for nodejs callbacks.
 * @param {Error} err
 */
function catchErr(err) { if (err) throw err; }

/**
 * Ultra-minimal template engine.
 * @see https://github.com/Drulac/template-literal
 * @param {string} templateStr A HTML template to compile.
 * @returns {Function}
 */
function compileTemplate(templateStr) {
  return new Function('d', 'return `' + templateStr + '`'); // eslint-disable-line
}

// extension manifest
writeFile(`${__dirname}/dist/manifest.json`, JSON.stringify(manifest), catchErr);

// error tracking initialisation code
const initCode = new Promise((resolve, reject) => {
  const closureCompiler = new ClosureCompiler({
    externs,
    js: `${__dirname}/src/errors-init.js`,
    language_in: 'ECMASCRIPT_NEXT',
    compilation_level: 'ADVANCED',
  });

  closureCompiler.run((exitCode, stdOut, stdErr) => {
    if (exitCode !== 0 || stdErr) {
      reject(new Error(stdErr));
    } else {
      resolve(stdOut.trim());
    }
  });
});

// loader script code
// TODO: Make it work the same as initCode()
// XXX: Waiting on parser support for dynamic import in Closure Compiler
const loaderCode = minify(
  readFileSync(`${__dirname}/src/loader.js`, 'utf8'),
  Object.assign({}, terserOpts)
).code;

/** Generate HTML from a template and write it to disk */
function makeHtml({
  file,
  template,
  title,
  content,
  exclude,
  include = ['**/*.css', '**/*.postcss', '**/*.pcss'],
  ...options
} = {}) {
  const filter = createFilter(include, exclude);
  const injectHtml = compileTemplate(template);
  const styles = {};

  return {
    name: 'makeHtml',
    transform(source, id) {
      if (!filter(id)) return;

      styles[id] = source;

      return ''; // eslint-disable-line consistent-return
    },
    async generateBundle() {
      // combine all stylesheets
      let css = '';
      for (const id in styles) { // eslint-disable-line
        css += styles[id] || '';
      }

      // minify CSS
      if (isProd && css.length) {
        css = crass.parse(css).optimize({ o1: true, css4: true }).toString();
      }

      // compile HTML from template
      let body = typeof content === 'function'
        ? await content()
        : content;
      body = body.replace('%CSS%', css.length ? `<style>${css}</style>` : '');

      writeFile(path.join(__dirname, file), injectHtml({
        title,
        content: body,
        ...options,
      }).trim(), catchErr);
    },
  };
}

// svelte preprocess options
const preprocess = {
  ...(!isProd ? {} : { markup: preprocessMarkup({
    unsafeWhitespace: true,
    unsafe: true,
  }) }),
  style: preprocessStyle(),
};

export default [
  // new tab page app
  {
    input: 'src/app.js',
    output: {
      sourcemap: !isProd,
      format: 'es',
      file: 'dist/n.js',
    },
    plugins: [
      svelte({
        preprocess,
        dev: !isProd,
        emitCss: true,
        immutable: true, // be mindful during development
      }),
      nodeResolve(),
      commonjs(),
      isProd && compiler(compilerOpts),
      makeHtml({
        template: docTemplate,
        file: 'dist/n.html',
        title: 'New Tab',
        content: async () => `%CSS%<script>${await initCode}</script><script src=n.js type=module async></script><script type=module async>${loaderCode}</script>`,
      }),
      isProd && analyze(),
    ],
  },

  // settings app
  {
    input: 'src/settings.js',
    output: {
      sourcemap: !isProd,
      format: 'es',
      file: 'dist/s.js',
    },
    plugins: [
      svelte({
        preprocess,
        dev: !isProd,
        emitCss: true,
      }),
      isProd && compiler(compilerOpts),
      makeHtml({
        template: docTemplate,
        file: 'dist/s.html',
        title: 'New Tab Settings',
        content: async () => `%CSS%<script>${await initCode}</script><script src=s.js type=module async></script><script type=module async>${loaderCode}</script>`,
      }),
      isProd && analyze(),
    ],
  },

  // error tracking
  {
    input: 'src/errors.js',
    output: {
      sourcemap: false,
      format: 'iife',
      file: 'dist/e.js',
    },
    plugins: [
      nodeResolve(),
      commonjs(),
      isProd && compiler(compilerOptsSimple),
      isProd && analyze(),
    ],
  },

  // background process
  {
    input: 'src/background.js',
    output: {
      sourcemap: false,
      format: 'es',
      file: 'dist/b.js',
    },
    plugins: [
      isProd && compiler(compilerOpts),
      isProd && analyze(),
    ],
  },
];
