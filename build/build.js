/* eslint-disable strict, import/no-extraneous-dependencies, no-console */

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
* @returns {string}
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
  minify: false, // custom CSS and JS minification below
  resolveCssUrls: false,
  fingerprintsEnabled: false,
  includeSlotNames: !isProduction,
});

// generate JS, CSS, and HTML
lasso.lassoPage({
  name: 'ntp',
  dependencies: ['require-run: ./src/index'],
}).then((result) => {
  const cssFile = result.getCSSFiles()[0];
  const jsFile = result.getJavaScriptFiles()[0];

  const js = result.getJavaScriptUrls()[0].substr(1); // "app.js"
  let css = fs.readFileSync(cssFile);
  let src = `${fs.readFileSync(jsFile, 'utf8')}\n$_mod.ready();`;

  if (isProduction) {
    // minify CSS
    css = new CleanCSS().minify(css).styles;

    // minify JS
    src = UglifyJS.minify(src, {
      compress: {
        drop_console: true,
        drop_debugger: true,
        negate_iife: false,
        passes: 2,
        unsafe: true,
      },
      output: {
        preamble: banner,
        wrap_iife: true,
      },
      ecma: 8,
      toplevel: true,
      warnings: true,
    }).code;

    if (src.error) throw src.error;
    if (src.warnings) console.log(src.warnings);
  }

  // browser-sync script
  const bs = isProduction ? '' : `\n${process.env.browserSync}`;

  // inject into HTML template
  const template = path.join(__dirname, '../src/template.html');
  const out = path.join(__dirname, '../dist/ntp.html');
  fs.readFile(template, 'utf8', (err, html) => {
    if (err) throw err;
    fs.writeFile(out, compile(html)({ banner, css, js, bs }), cb);
  });

  // clean up leftover CSS file
  fs.unlink(cssFile, cb);

  // write JS to disk
  fs.writeFile(jsFile, src, cb);
}).catch((err) => {
  throw err;
});

// write manifest to disk as JSON
const manifestPath = path.join(__dirname, '../dist/manifest.json');
fs.writeFile(manifestPath, JSON.stringify(manifest), cb);

// REF: https://developer.chrome.com/webstore/publish (dev docs)
// REF: https://developer.chrome.com/webstore/launching#pre-launch-checklist (checklist)
// REF: http://humaan.com/checklist/ (long checklist)
// REF: https://chrome.google.com/webstore/developer/dashboard (publishing dashboard)
// REF: https://developer.chrome.com/extensions/packaging (local packing, only installable on Linux?)
//  ↳ REF: https://developer.chrome.com/extensions/linux_hosting

// TODO: Create a publish step
//  ↳ Can this be automated from this script?
//    ↳ Probably put in another file, possibly a bash script or Makefile
//  ↳ Canary release flow
//    ↳ Separate package which is only published in the wearegenki.com domain (?)
//    ↳ There is a test account feature we should leverage for this
//  ↳ Update version
//  ↳ Upload packaged zip file
