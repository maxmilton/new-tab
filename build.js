/* eslint-disable strict, import/no-extraneous-dependencies */

'use strict';

const fs = require('fs');
const path = require('path');
const lasso = require('lasso');
const CleanCSS = require('clean-css');
const UglifyJS = require('uglify-es');
const pkg = require('./package');
const manifest = require('./manifest');

const isProduction = process.env.NODE_ENV === 'production';

const banner = `/*
 * New Tab v${pkg.version}
 * Copyright ${new Date().getFullYear()} ${pkg.author}
 * MIT licensed (https://github.com/MaxMilton/new-tab/blob/master/LICENCE)
 */`;

lasso.configure({
  plugins: [
    'lasso-marko',
    'lasso-postcss',
  ],
  urlPrefix: '',
  outputDir: path.join(__dirname, 'dist'),
  bundlingEnabled: true,
  minify: false, // custom CSS and JS minification below
  fingerprintsEnabled: false,
  includeSlotNames: false,
});

// ultra-minimal template engine
// @see https://github.com/Drulac/template-literal
function compile() {
  const template = fs.readFileSync('src/template.html');
  return new Function('d', 'return `' + template + '`'); // eslint-disable-line
}

// create JS, CSS, and HTML
lasso.lassoPage({
  name: 'ntp',
  dependencies: ['require-run: ./src/index'],
}).then((result) => {
  const cssFile = result.getCSSFiles()[0];
  const jsFile = result.getJavaScriptFiles()[0];

  const css = isProduction
    ? new CleanCSS().minify(fs.readFileSync(cssFile)).styles
    : fs.readFileSync(cssFile);

  const js = result.getJavaScriptUrls()[0].substr(1); // "app.js"

  const src = isProduction
    ? UglifyJS.minify(`${fs.readFileSync(jsFile)}$_mod.ready();`, {
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
    }).code
    : `${fs.readFileSync(jsFile)}$_mod.ready();`;

  if (src.error) throw src.error;
  if (src.warnings) console.log(src.warnings); // eslint-disable-line no-console

  // browser sync script
  const bs = isProduction ? '' : `\n${process.env.browserSync}`;

  // inject into HTML template
  fs.writeFileSync('dist/ntp.html', compile()({ banner, css, js, bs }), 'utf8');

  // clean up leftover CSS file
  fs.unlinkSync(cssFile);

  // write JS to disk
  fs.writeFileSync(jsFile, src);
}).catch((err) => {
  throw err;
});

// write manifest to disk as JSON
fs.mkdir('dist', () => {
  fs.writeFileSync('dist/manifest.json', JSON.stringify(manifest));
});

// REF: https://developer.chrome.com/webstore/publish (dev docs)
// REF: https://developer.chrome.com/webstore/launching#pre-launch-checklist (checklist)
// REF: http://humaan.com/checklist/ (long checklist)
// REF: https://chrome.google.com/webstore/developer/dashboard (publishing dashboard)
// REF: https://developer.chrome.com/extensions/packaging (local packing, only installable on Linux?)
//  ↳ REF: https://developer.chrome.com/extensions/linux_hosting

// TODO: Create a packing step
//  ↳ Zip dist contents

// TODO: Create a publish step
//  ↳ Can this be automated from this script?
//  ↳ Canary release flow
//    ↳ Separate package which is only published in the wearegenki.com domain (?)
//    ↳ There is a test account feature we should leverage for this
//  ↳ Update version
//  ↳ Upload packaged zip file
