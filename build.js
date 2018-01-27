/* eslint-disable import/no-extraneous-dependencies */

'use strict'; // eslint-disable-line

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
// REF: https://github.com/Drulac/template-literal
function compile() {
  const template = fs.readFileSync('src/index.html');
  return new Function('d', 'return `' + template + '`'); // eslint-disable-line
}

// create JS, CSS, and HTML
lasso.lassoPage({
  name: 'app',
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
  if (src.warnings) console.warn(src.warnings); // eslint-disable-line no-console

  // inject into HTML template
  fs.writeFileSync('dist/index.html', compile()({ banner, css, js }), 'utf8');

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
