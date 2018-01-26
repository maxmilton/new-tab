'use strict'; // eslint-disable-line

const fs = require('fs');
const path = require('path');
const lasso = require('lasso'); // eslint-disable-line import/no-extraneous-dependencies
const pkg = require('./package.json');
const manifest = require('./manifest.json');

const isProduction = process.env.NODE_ENV === 'production';

const banner = `/*!
 * new-tab v${pkg.version}
 * Copyright ${new Date().getFullYear()} ${pkg.author}
 * MIT licensed (https://github.com/MaxMilton/chrome-new-tab/blob/master/LICENCE)
 */`;

lasso.configure({
  plugins: ['lasso-marko'],
  urlPrefix: '',
  outputDir: path.join(__dirname, 'dist'),
  bundlingEnabled: true,
  minify: isProduction,
  fingerprintsEnabled: false,
  includeSlotNames: false,
});

// ultra-minimal template engine
// REF: https://github.com/Drulac/template-literal
function compile() {
  const template = fs.readFileSync('src/index.html');
  return new Function('d', 'return `' + template + '`'); // eslint-disable-line
}

// create JS and CSS bundles
lasso.lassoPage({
  name: 'app',
  dependencies: ['require-run: ./src/index'],
}).then((result) => {
  const cssFile = result.getCSSFiles()[0];
  const jsFile = result.getJavaScriptFiles()[0];
  const css = fs.readFileSync(cssFile); // contents of app.css
  const js = result.getJavaScriptUrls()[0]; // "app.js"

  // inject into HTML template
  fs.writeFileSync('dist/index.html', compile()({ css, js }), 'utf8');

  // clean up leftover CSS file
  fs.unlinkSync(cssFile);

  // all JS in a single file; append ready function
  fs.writeFileSync(jsFile, `${banner}\n${fs.readFileSync(jsFile)}\n$_mod.ready();`);
}).catch((err) => {
  throw err;
});

// write manifest
fs.mkdir('dist', () => {
  manifest.version = pkg.version;
  fs.writeFileSync('dist/manifest.json', JSON.stringify(manifest));
});
