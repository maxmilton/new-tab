'use strict'; // eslint-disable-line

const fs = require('fs');
const path = require('path');
const lasso = require('lasso');

const isProduction = process.env.NODE_ENV === 'production';

lasso.configure({
  plugins: ['lasso-marko'],
  // urlPrefix: '/static',
  // outputDir: path.join(__dirname, 'dist/static'),
  urlPrefix: '',
  outputDir: path.join(__dirname, 'dist'),
  bundlingEnabled: true,
  minify: isProduction,
  fingerprintsEnabled: false,
  includeSlotNames: false,
  // relativeUrlsEnabled: true,
  // resolveCssUrls: false,
});

// ultra-minimal template engine
// REF: https://github.com/Drulac/template-literal
function compile() {
  const template = fs.readFileSync('src/index.html');
  return new Function('d', 'return `' + template + '`'); // eslint-disable-line
}

// create JS and CSS bundles + inject into HTML template
lasso.lassoPage({
  name: 'app',
  dependencies: ['require-run: ./src/index'],
}).then((result) => {
  const head = result.getHtmlForSlot('head');
  const body = result.getHtmlForSlot('body');

  fs.writeFileSync('dist/index.html', compile()({ head, body }), 'utf8');
}).then(() => {
  // copy manifest
  fs.copyFileSync('manifest.json', 'dist/manifest.json');
}).catch((err) => {
  throw err;
});

