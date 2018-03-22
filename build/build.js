/* eslint-disable strict, import/no-extraneous-dependencies, no-console */
/* tslint:disable:no-console max-line-length */

'use strict';

const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks'); // eslint-disable-line
const lasso = require('lasso');
const {
  mangleRegex,
  mangleUnsafe,
  uglifyOpts,
  catchErr,
  minifyCss,
  minifyJs,
  shortenLassoModule,
  compileHtml,
  finished,
} = require('./utils');
const manifest = require('../src/manifest');

const template = fs.readFileSync(path.join(__dirname, '../src/template.html'), 'utf8');
const banner = `New Tab ${process.env.APP_RELEASE} | github.com/MaxMilton/new-tab`;
const isProduction = process.env.NODE_ENV === 'production';

const ravenjs = require.resolve('raven-js/dist/raven');
const src = path.join(__dirname, '../src');
const dist = path.join(__dirname, '../dist');
const paths = {
  // sourceMapDir: `${dist}/src`,
  loader: `${src}/loader.js`,
  errors: {
    in: `${src}/errors.js`,
    out: `${dist}/e.js`,
  },
  ntp: `${dist}/ntp.html`,
  settings: {
    html: {
      in: `${src}/settings.html`,
      out: `${dist}/s.html`,
    },
    js: {
      in: `${src}/settings.js`,
      out: `${dist}/s.js`,
    },
  },
  background: {
    in: `${src}/background.js`,
    out: `${dist}/b.js`,
  },
  manifest: `${dist}/manifest.json`,
};

/**
 * Compile a New Tab theme.
 * @param {string} nameLong The input filename.
 * @param {string} nameShort The output filename.
 */
function makeTheme(nameLong, nameShort) {
  fs.readFile(`${src}/themes/${nameLong}.css`, 'utf8', async (err, res) => {
    if (err) throw err;
    fs.writeFile(`${dist}/${nameShort}.css`, await minifyCss(res), catchErr);
  });
}

// runtime file loader
const loader = fs.readFileSync(paths.loader, 'utf8');
const loaderCode = minifyJs(loader);

// lasso resource bundler options
lasso.configure({
  plugins: [
    'lasso-marko',
    'lasso-postcss',
  ],
  urlPrefix: '',
  outputDir: dist,
  bundlingEnabled: true,
  minify: false, // custom minification below
  resolveCssUrls: false,
  fingerprintsEnabled: false,
  includeSlotNames: false,
});

// new tab page app
const t0 = performance.now();
lasso
  .lassoPage({
    name: 'ntp',
    dependencies: ['require-run: ./src/index'],
  })
  .then(async (result) => {
    const t1 = performance.now();
    console.log(`[lasso] ntp 🕑 ${Math.round(t1 - t0)}ms`);

    const cssFilePath = result.getCSSFiles()[0];
    const jsFilePath = result.getJavaScriptFiles()[0];
    const jsFileName = result.getJavaScriptUrls()[0].substr(1);

    // source code
    let cssCode = fs.readFileSync(cssFilePath, 'utf8');
    let jsCode = `${fs.readFileSync(jsFilePath, 'utf8')}\n$_mod.ready();`;

    // clean up leftover files
    fs.unlink(cssFilePath, catchErr);

    // runtime file loader + other script tags for body
    let scripts = '';

    if (isProduction) {
      // write unminified source JS to disk
      // fs.writeFile(`${paths.sourceMapDir}/${jsFileName}`, jsCode, catchErr);

      // custom uglify options for main JS bundle
      // FIXME: Implement a deep clone function so I don't have to extend compress below: https://dassur.ma/things/deep-copy/
      const uglifyOptsMain = Object.assign({}, uglifyOpts, {
        // sourceMap: {
        //   filename: jsFileName,
        //   // don't include the source map link in released versions
        //   ...(process.env.NO_SOURCE_MAP_URL ? {} : { url: `src/${jsFileName}.map` }),
        // },
        compress: {
          ...uglifyOpts.compress, // because Object.assign() only does a shallow clone
          // pure_funcs: [], // TODO: Find pure functions that could be replaced with their output
          unsafe_arrows: true,
          unsafe_methods: true,
        },
        mangle: {
          properties: {
            /** XXX: Potentially fragile; needs adjustment if a future property conflicts. */
            regex: mangleRegex,
            reserved: [
              ...mangleUnsafe,
              's', // state.s in ntp-search.marko
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
      jsCode = minifyJs(
        { [jsFileName]: shortenLassoModule(jsCode) },
        true,
        uglifyOptsMain,
        // `${paths.sourceMapDir}/${jsFileName}.map`
      );

      // minify CSS
      cssCode = minifyCss(cssCode);
    } else {
      // Browsersync client script
      scripts += `\n${process.env.BROWSERSYNC}`;
    }

    const body = '<div id=ntp><div id=a><div id=b></div><div class="b f">Other bookmarks</div></div><div id=m><div id=i>☰</div></div><div class=c><input type=text placeholder="Search tabs, bookmarks, and history..." id=s><h2>Open Tabs (</h2></div></div>';

    // HTML template
    fs.writeFile(paths.ntp, compileHtml(template)({
      banner: `<!-- ${banner} -->\n`,
      title: 'New Tab',
      head: `<script src=${jsFileName} defer></script>\n<style>${await cssCode}</style>\n${scripts}<script>${await loaderCode}</script>`,
      body,
    }), catchErr);

    // write JS to disk
    fs.writeFile(jsFilePath, await jsCode, catchErr);
  })
  .then(finished) // this must be called after all tasks are finished; race condition
  .catch(catchErr);

// JS error tracking
const raven = fs.readFileSync(ravenjs, 'utf8');
const errors = fs.readFileSync(paths.errors.in, 'utf8');
minifyJs({ 'raven.js': raven, 'errors.js': errors }, true).then((errCode) => {
  fs.writeFile(paths.errors.out, errCode, catchErr);
});

// themes
makeTheme('light', 'l');
makeTheme('black', 'b');

// settings page
fs.copyFile(paths.settings.html.in, paths.settings.html.out, catchErr);
fs.readFile(paths.settings.js.in, 'utf8', async (err, res) => {
  if (err) throw err;
  fs.writeFile(paths.settings.js.out, await minifyJs(res), catchErr);
});

// background script
const background = fs.readFileSync(paths.background.in, 'utf8');
minifyJs({ 'background.js': background }, true).then((bgCode) => {
  fs.writeFile(paths.background.out, bgCode, catchErr);
});

// extension manifest
fs.writeFile(paths.manifest, JSON.stringify(manifest), catchErr);
