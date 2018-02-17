/* eslint-disable strict, import/no-extraneous-dependencies, no-console */
/* tslint:disable:no-console prefer-template */

'use strict';

const fs = require('fs');
const { performance } = require('perf_hooks'); // eslint-disable-line
const WorkerNodes = require('worker-nodes');
const CleanCSS = require('clean-css');
const UglifyJS = require('uglify-es');
const optimizeJs = require('optimize-js');
const { mangleRegex, mangleUnsafe } = require('./mangle-props');

const nameCache = {};

// default CSS minification options
const cleanCssOpts = {
  level: {
    1: { all: true },
    2: { all: true },
  },
};

// default JS minification options
const uglifyOpts = {
  compress: {
    drop_console: true,
    negate_iife: false,
    passes: 2,
    pure_getters: true,
    unsafe: true,
    unsafe_proto: true,
  },
  mangle: {
    reserved: ['d', 'w'], // fixes conflict in loader + error tracking script
  },
  nameCache,
  ecma: 8,
  toplevel: true,
  warnings: !process.env.QUIET,
};

/**
 * Generic error handler for callbacks.
 * @param {Error} err
 */
function catchErr(err) { if (err) throw err; }

/**
 * Make CSS code smaller and faster.
 * @param {string} code The CSS code to minify.
 * @param {object} [opts] Custom CleanCSS options.
 * @returns {string} The minified CSS code.
 */
function minifyCss(code, opts) {
  const result = new CleanCSS(opts || cleanCssOpts).minify(code);

  if (result.errors.length) throw result.errors;
  if (result.warnings.length) console.log('[minify CSS] Warnings:\n', result.warnings);

  if (!process.env.QUIET) {
    // log CSS minification statistics to console
    const from = result.stats.originalSize;
    const now = result.stats.minifiedSize;
    const percent = Math.round(result.stats.efficiency * 100);
    const time = Math.round(result.stats.timeSpent);
    console.log(`[minify CSS] 🔻 ${from} > ${now}; ${percent}% 🕑 ${time}ms`);
  }

  return result.styles;
}

/**
 * Make JavaScript code smaller and faster.
 * @param {(string|object)} code The JavaScript source code to minify.
 * @param {boolean} [optimize] If true code will be run through optimize-js.
 * @param {object} [opts] Custom UglifyJS options.
 * @param {string} [sourceMapPath] An absolute path where to save a source map. If
 * this is omitted, no source map will be saved.
 * @returns {Promise<string>} The minified JavaScript code.
 */
function _minifyJs(code, optimize, opts, sourceMapPath) {
  const t0 = performance.now();

  const result = UglifyJS.minify(code, opts || uglifyOpts);

  if (result.error) throw result.error;
  if (result.warnings) console.log('[minify JS] Warnings:\n', result.warnings);

  if (optimize) {
    result.code = optimizeJs(result.code); // breaks source maps; https://git.io/vAq4g
  }

  if (sourceMapPath) {
    fs.writeFile(sourceMapPath, result.map, catchErr);
  }

  if (!process.env.QUIET) {
    // log JS minification statistics to console
    const t1 = performance.now();
    const from = Buffer.from(typeof code === 'object' ? Object.values(code).join() : code).length;
    const now = Buffer.from(result.code).length;
    const percent = Math.round((now / from) * 100);
    const time = Math.round(t1 - t0);
    console.log(`[minify JS] 🔻 ${from} > ${now}; ${percent}% 🕑 ${time}ms`);
  }

  return result.code;
}

/**
 * Shorten the Lasso.js module object from "$_mod" to "$$".
 * @param {string} code Lasso.js generated JavaScript source code.
 * @param {string} [name] What to rename the object to (use $ as escape character).
 * @returns {string}
 */
function shortenLassoModule(code, name = '$$$$') {
  return code.replace(/\$_mod/g, name);
}

/**
 * Ultra-minimal template engine.
 * @see https://github.com/Drulac/template-literal
 * @param {string} template A HTML template to compile.
 * @returns {Function}
 */
function compileHtml(template) {
  return new Function('d', 'return `' + template + '`'); // eslint-disable-line
}

// run the most CPU intensive tasks async in a seperate thread
const workers = new WorkerNodes(__filename);

const minifyJs = workers.call._minifyJs;
const finished = () => workers.terminate();

module.exports = {
  mangleRegex,
  mangleUnsafe,
  cleanCssOpts,
  uglifyOpts,
  catchErr,
  minifyCss,
  _minifyJs,
  minifyJs,
  shortenLassoModule,
  compileHtml,
  finished,
};
