import { readFileSync, writeFile } from 'fs';
import path from 'path';
import preprocessMarkup from '@minna-ui/svelte-preprocess-markup';
import preprocessStyle from '@minna-ui/svelte-preprocess-style';
import svelte from 'rollup-plugin-svelte';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import compiler from '@ampproject/rollup-plugin-closure-compiler';
import { createFilter } from 'rollup-pluginutils'; // eslint-disable-line import/no-extraneous-dependencies
import crass from 'crass';
import { plugin as analyze } from 'rollup-plugin-analyzer';
import manifest from './manifest.js';

const docTemplate = readFileSync(`${__dirname}/src/template.html`, 'utf8');
const isProd = !process.env.ROLLUP_WATCH;

const compilerOpts = {
  charset: 'UTF-8',
  externs: [
    './node_modules/google-closure-compiler/contrib/externs/chrome.js',
    './node_modules/google-closure-compiler/contrib/externs/chrome_extensions.js',
    // './node_modules/google-closure-compiler/contrib/externs/svg.js',
    './externs.js',
  ],
  compilation_level: 'ADVANCED',
  // warning_level: 'VERBOSE',

  // uncomment the following for debugging
  // formatting: 'PRETTY_PRINT',
  // debug: true,
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

const svelteOpts = {
  preprocess: {
    ...(!isProd ? {} : { markup: preprocessMarkup({
      unsafeWhitespace: true,
      unsafe: true,
    }) }),
    style: preprocessStyle(),
  },
  dev: !isProd,
  emitCss: true,
};

export default [
  /** New Tab Page app */
  {
    input: 'src/app.js',
    output: {
      sourcemap: !isProd,
      format: 'es',
      file: 'dist/n.js',
    },
    plugins: [
      svelte(svelteOpts),
      resolve(),
      commonjs(),
      isProd && compiler(compilerOpts),
      makeHtml({
        template: docTemplate,
        file: 'dist/n.html',
        title: 'New Tab',
        content: '%CSS%<script src=n.js async></script>',
      }),
      isProd && analyze(),
    ],
  },

  /** Settings app */
  {
    input: 'src/settings.js',
    output: {
      sourcemap: !isProd,
      format: 'es',
      file: 'dist/s.js',
    },
    plugins: [
      svelte(svelteOpts),
      isProd && compiler(compilerOpts),
      makeHtml({
        template: docTemplate,
        file: 'dist/s.html',
        content: '%CSS%<script src=s.js async></script>',
      }),
      isProd && analyze(),
    ],
  },

  /** Background process */
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
