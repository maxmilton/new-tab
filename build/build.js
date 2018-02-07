/* eslint-disable strict, import/no-extraneous-dependencies, no-console */
/* tslint:disable:no-console prefer-template */

'use strict';

const fs = require('fs');
const path = require('path');
const lasso = require('lasso');
const CleanCSS = require('clean-css');
const UglifyJS = require('uglify-es');
const optimizeJs = require('optimize-js');
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

  // script tags for body
  let body = '';

  if (isProduction) {
    // minify CSS
    css = new CleanCSS({
      level: {
        1: { all: true },
        2: { all: true },
      },
    }).minify(css).styles;

    // TODO: Replace module ("/path/to/module") with a short form or new module resolve strategy

    // set up JS minification
    const uglifyOpts = {
      compress: {
        drop_console: true,
        drop_debugger: true,
        negate_iife: false,
        passes: 2,
        unsafe: true,
      },
      ecma: 8,
      toplevel: true,
      warnings: !process.env.QUIET,
    };
    const uglifyOptsMain = Object.assign({}, uglifyOpts, {
      mangle: {
        properties: {
          // XXX: Potentially fragile; needs adjustment if a future property conflicts
          //  ↳ Bad: key, input, update (chrome.tabs.update)
          //  ↳ Suspect: \w{1,2}, default, super (es6 classes)
          regex: /^(\$.*|_.*|.*_|\w{1,2}|def|installed|run(time)?|main|remap|builtin|require|resolve|ready|search(Path)?|load(ed|erMetadata)?|pending|code|cache|exports?|component|const|state|out|globals|data|subscribeTo|setState|default|filename|wait|createOut|template|emit|prependListener|once|removeListener|removeAllListeners|listenerCount|addDestroyListener|createTracker|appendTo|prependTo|replaceChildrenOf|insertAfter|getComponents?|afterInsert|getNode|getOutput|document|selectedIndex|correspondingUseElement|element|node|comment|html|beginElement|endElement|end|error|beginAsync|flush|sync|isSync|onLast|isVDOM|parentOut|render(ToString|sync|er)?|path|meta|elId|getEl(s|Id)?|destroy|isDestroyed|setStateDirty|replaceState|forceUpdate|shouldUpdate|els|getComponentForEl|init|register|renderBody|safeHTML|write|toHTML)$/i,
          reserved: [
            '$_mod', // lasso module
            'ax_', // fixes broken element placeholder attribute
            'id', // element attribute
          ],
          // debug: 'XX',
        },
        eval: true,
      },
      output: {
        preamble: banner,
      },
    });

    // minify JS
    const src = UglifyJS.minify(jsCode, uglifyOptsMain);
    if (src.error) throw src.error;
    if (src.warnings) console.log(src.warnings);
    jsCode = src.code.replace(/\$_mod/g, '$$$$'); // short module object; $_mod >> $$
    jsCode = optimizeJs(jsCode);

    // extra JS file loader
    const loader = fs.readFileSync(path.join(__dirname, '../src/loader.js'), 'utf8');
    const loaderSrc = UglifyJS.minify(loader, uglifyOpts);
    if (loaderSrc.error) throw loaderSrc.error;
    if (loaderSrc.warnings) console.log(loaderSrc.warnings);
    body = `<script>${loaderSrc.code}</script>`;

    // JS error tracking
    const raven = fs.readFileSync(require.resolve('raven-js/dist/raven'), 'utf8');
    const errors = fs.readFileSync(path.join(__dirname, '../src/errors.js'), 'utf8');
    const errSrc = UglifyJS.minify({ 'raven.js': raven, 'errors.js': errors }, uglifyOpts);
    if (errSrc.error) throw errSrc.error;
    if (errSrc.warnings) console.log(errSrc.warnings);
    fs.writeFile(path.join(__dirname, '../dist/err.js'), optimizeJs(errSrc.code), cb);
  } else {
    // Browsersync client script
    body = `\n${process.env.BROWSERSYNC}`;
  }

  // inject into HTML template
  const template = path.join(__dirname, '../src/template.html');
  const out = path.join(__dirname, '../dist/ntp.html');
  fs.readFile(template, 'utf8', (err, html) => {
    if (err) throw err;
    fs.writeFile(out, compile(html)({ banner, css, js, body }), cb);
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
