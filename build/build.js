/* eslint-disable strict, import/no-extraneous-dependencies, no-console */
/* tslint:disable:no-console prefer-template */

'use strict';

const fs = require('fs');
const path = require('path');
const lasso = require('lasso');
const CleanCSS = require('clean-css');
const UglifyJS = require('uglify-es');
const pkg = require('../package');
const manifest = require('../manifest');

const isProduction = process.env.NODE_ENV === 'production';

const banner = `/*
 * New Tab v${pkg.version}
 * Copyright ${new Date().getFullYear()} ${pkg.author}
 * MIT licensed (https://github.com/MaxMilton/new-tab/blob/master/LICENCE)
 */`;

/**
 * Handle node async method errors.
 * @param {Error} err
 */
function cb(err) { if (err) throw err; }

/**
 * Ultra-minimal template engine.
 * @see https://github.com/Drulac/template-literal
 * @param {string} template
 * @returns {Function}
 */
function compile(template) {
 return new Function('d', 'return `' + template + '`'); // eslint-disable-line
}

lasso.configure({
  plugins: [
    'lasso-marko',
    'lasso-postcss',
  ],
  urlPrefix: '',
  outputDir: path.join(__dirname, '../dist'),
  bundlingEnabled: true,
  minify: false, // custom minification below
  resolveCssUrls: false,
  fingerprintsEnabled: false,
  includeSlotNames: false,
});

// process marko components; generate JS, CSS, and HTML
lasso.lassoPage({
  name: 'ntp',
  dependencies: ['require-run: ./src/index'],
}).then((result) => {
  // paths to files
  const cssFile = result.getCSSFiles()[0];
  const jsFile = result.getJavaScriptFiles()[0];

  // filenames
  const js = result.getJavaScriptUrls()[0].substr(1); // "ntp.js"

  // source code
  let css = fs.readFileSync(cssFile);
  let jsCode = `${fs.readFileSync(jsFile, 'utf8')}\n$_mod.ready();`;

  // resources for body, e.g. script tags
  let body = '';

  if (isProduction) {
    // minify CSS
    css = new CleanCSS({
      level: {
        1: { all: true },
        2: { all: true },
      },
    }).minify(css).styles;

    // minify JS
    const uglifyOpts = {
      compress: {
        drop_console: true,
        drop_debugger: true,
        negate_iife: false,
        passes: 2,
        unsafe: true,
      },
      // FIXME: Mangle properties for significant byte savings
      // mangle: {
      //   properties: {
      //     reserved: [
      //       '$_mod',
      //       // '$_def',
      //       // '$_exports',
      //       // '$_run',
      //       // '$_ready',
      //       // '$_out',
      //     ],
      //     // debug: 'XX',
      //   },
      // },
      output: {
        wrap_iife: true,
      },
      ecma: 8,
      toplevel: true,
      warnings: !process.env.QUIET,
    };
    const uglifyOptsBanner = Object.assign({}, uglifyOpts, {
      output: {
        preamble: banner,
      },
    });

    const src = UglifyJS.minify(jsCode, uglifyOptsBanner);
    if (src.error) throw src.error;
    if (src.warnings) console.log(src.warnings);
    jsCode = src.code;

  const head = isProduction ? '' : `\n${process.env.browserSync}`;

  // inject into HTML template
  const template = path.join(__dirname, '../src/template.html');
  const out = path.join(__dirname, '../dist/ntp.html');
  fs.readFile(template, 'utf8', (err, html) => {
    if (err) throw err;
    fs.writeFile(out, compile(html)({ banner, css, js, head }), cb);
  });

  // clean up leftover CSS file
  fs.unlink(cssFile, cb);

  // write JS to disk
  fs.writeFile(jsFile, jsCode, cb);
}).catch((err) => {
  throw err;
});

// write manifest to disk as JSON
const manifestPath = path.join(__dirname, '../dist/manifest.json');
fs.writeFile(manifestPath, JSON.stringify(manifest), cb);
