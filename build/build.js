/* eslint-disable strict, import/no-extraneous-dependencies, no-console */
/* tslint:disable:no-console prefer-template max-line-length */

'use strict';

const fs = require('fs');
const path = require('path');
const lasso = require('lasso');
const CleanCSS = require('clean-css');
const UglifyJS = require('uglify-es');
const optimizeJs = require('optimize-js');
const manifest = require('../src/manifest');

const template = fs.readFileSync(path.join(__dirname, '../src/template.html'), 'utf8');
const banner = `New Tab ${process.env.APP_RELEASE} | github.com/MaxMilton/new-tab`;
const isProduction = process.env.NODE_ENV === 'production';

// CSS minification options
const cleanCssOpts = {
  level: {
    1: { all: true },
    2: { all: true },
  },
};

// JS minification options
const uglifyOpts = {
  compress: {
    drop_console: true,
    negate_iife: false,
    passes: 2,
    pure_getters: true,
    unsafe: true,
    unsafe_proto: true,
  },
  ecma: 8,
  toplevel: true,
  warnings: !process.env.QUIET,
};

// lasso resource bundler options
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

/**
 * Node async method error handler.
 * @param {Error} err
 */
function cb(err) { if (err) throw err; }

function minifyCss(code, opts) {
  return new CleanCSS(opts || cleanCssOpts).minify(code).styles;
}

function minifyJs(code, optimize, opts, sourceMapPath) {
  const result = UglifyJS.minify(code, opts || uglifyOpts);

  if (result.error) throw result.error;
  if (result.warnings) console.log(result.warnings);

  if (optimize) {
    result.code = optimizeJs(result.code); // breaks source maps; https://git.io/vAq4g
  }

  if (sourceMapPath) {
    fs.writeFile(sourceMapPath, result.map, cb);
  }

  return result.code;
}

/**
 * Ultra-minimal template engine.
 * @see https://github.com/Drulac/template-literal
 * @returns {Function}
 */
function compile() {
  return new Function('d', 'return `' + template + '`'); // eslint-disable-line
}

// runtime file loader
const loader = fs.readFileSync(path.join(__dirname, '../src/loader.js'), 'utf8');
const loaderCode = minifyJs(loader);

// JS error tracking
const raven = fs.readFileSync(require.resolve('raven-js/dist/raven'), 'utf8');
const errors = fs.readFileSync(path.join(__dirname, '../src/errors.js'), 'utf8');
const errCode = minifyJs({ 'raven.js': raven, 'errors.js': errors }, true);
fs.writeFile(path.join(__dirname, '../dist/err.js'), errCode, cb);

// new tab page app
lasso.lassoPage({
  name: 'ntp',
  dependencies: ['require-run: ./src/index'],
}).then((result) => {
  const cssFilePath = result.getCSSFiles()[0];
  const jsFilePath = result.getJavaScriptFiles()[0];
  const jsFileName = result.getJavaScriptUrls()[0].substr(1);

  // source code
  let cssCode = fs.readFileSync(cssFilePath, 'utf8');
  let jsCode = `${fs.readFileSync(jsFilePath, 'utf8')}\n$_mod.ready();`;

  // clean up leftover files
  fs.unlink(cssFilePath, cb);

  // runtime file loader + other script tags for body
  let scripts = `<script>${loaderCode}</script>`;

  if (isProduction) {
    // minify CSS
    cssCode = minifyCss(cssCode);

    // write unminified source JS to disk
    const jsSrcPath = `${path.dirname(jsFilePath)}/src`;
    fs.writeFile(`${jsSrcPath}/${jsFileName}`, jsCode, cb);

    // custom uglify options for main JS bundle
    const uglifyOptsMain = Object.assign({}, uglifyOpts, {
      sourceMap: {
        filename: jsFileName,
        // don't include the source map link in released versions
        ...(process.env.NO_SOURCE_MAP_URL ? {} : { url: `src/${jsFileName}.map` }),
      },
      compress: {
        ...uglifyOpts.compress, // because Object.assign() only does a shallow clone
        // pure_funcs: [], // TODO: Find pure functions that could be replaced with their output
        unsafe_arrows: true,
        unsafe_methods: true,
      },
      mangle: {
        properties: {
          // XXX: Potentially fragile; needs adjustment if a future property conflicts
          //  ↳ Bad: key, input, update (chrome.tabs.update), runtime (chrome.runtime)
          //  ↳ Suspect: \w{1,2}, default, super (es classes)
          regex: /^(\$.*|_.*|.*_|\w{1,2}|def|installed|run|main|remap|builtin|require|resolve|ready|search(Path)?|load(ed|erMetadata)?|pending|code|cache|exports?|component|const|state|out|globals|data|subscribeTo|setState|default|filename|wait|createOut|template|emit|prependListener|once|removeListener|removeAllListeners|listenerCount|addDestroyListener|createTracker|appendTo|prependTo|replaceChildrenOf|insertAfter|getComponents?|afterInsert|getNode|getOutput|document|selectedIndex|correspondingUseElement|element|node|comment|html|beginElement|endElement|end|error|beginAsync|flush|sync|isSync|onLast|isVDOM|parentOut|render(ToString|sync|er)?|path|meta|elId|getEl(s|Id)?|destroy|isDestroyed|setStateDirty|replaceState|forceUpdate|shouldUpdate|els|getComponentForEl|init|register|renderBody|safeHTML|write|toHTML)$/i,
          reserved: [
            '$$', // lasso module (short version of '$_mod')
            'ax_', // fixes broken element placeholder attribute
            'e', // error tracking opt-out
            'id', // element attribute
          ],
          // debug: 'XX',
        },
        eval: true,
      },
      output: {
        preamble: `/* ${banner} */`,
      },
    });

    // minify JS
    jsCode = jsCode.replace(/\$_mod/g, '$$$$'); // shorten module object; $_mod >> $$
    jsCode = minifyJs(
      { [jsFileName]: jsCode },
      true,
      uglifyOptsMain,
      `${jsSrcPath}/${jsFileName}.map`
    );
  } else {
    // Browsersync client script
    scripts += `\n${process.env.BROWSERSYNC}`;
  }

  const body = '<div id=ntp><div id=a><div id=b></div><div class="b f">Other bookmarks</div></div><div id=m><div id=i>☰</div></div><div class=c><input type=text placeholder="Search tabs, bookmarks, and history..." id=s><h2>Open Tabs (</h2></div></div>';

  // HTML template
  fs.writeFile(path.join(__dirname, '../dist/ntp.html'), compile()({
    banner: `<!-- ${banner} -->`,
    title: 'New Tab',
    head: `<style>${cssCode}</style>`,
    body,
    foot: `${scripts}\n<script src=${jsFileName}></script>`,
  }), cb);

  // write JS to disk
  fs.writeFile(jsFilePath, jsCode, cb);
}).catch((err) => {
  throw err;
});

// settings page app
// XXX: Could easily do this as plain HTML but may as well use Lasso+Marko for fun
lasso.lassoPage({
  name: 'settings',
  dependencies: ['require-run: ./src/settings'],
  // bundles: [{
  //   name: 'bunbun',
  //   dependencies: [
  //     'require: ./src/components/settings',
  //   ],
  // }],
}).then((result) => {
  console.log('@@ SETTINGS RES', result);

  const cssFilePath = result.getCSSFiles()[0];
  const jsFilePath = result.getJavaScriptFiles()[0];
  const jsFileName = result.getJavaScriptUrls()[0].substr(1);

  // source code
  const cssCode = fs.readFileSync(cssFilePath, 'utf8');
  const jsCode = `${fs.readFileSync(jsFilePath, 'utf8')}\n$_mod.ready();`;

  // clean up leftover files
  fs.unlink(cssFilePath, cb);

  // write JS to disk
  fs.writeFile(jsFilePath, minifyJs(jsCode), cb);

  // HTML template
  fs.writeFile(path.join(__dirname, '../dist/settings.html'), compile()({
    banner: '',
    title: 'New Tab Settings',
    head: `<style>${minifyCss(cssCode)}</style>`,
    body: '<div id=settings></div>',
    foot: `<script>${loaderCode}</script>\n<script src=${jsFileName}></script>`,
  }), cb);
}).catch((err) => {
  throw err;
});

// write extension manifest to disk
const manifestPath = path.join(__dirname, '../dist/manifest.json');
fs.writeFile(manifestPath, JSON.stringify(manifest), cb);
