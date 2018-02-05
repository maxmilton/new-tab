/* eslint-disable strict, import/no-extraneous-dependencies, no-console */
/* tslint:disable:no-console */

'use strict';

const path = require('path');
const { performance } = require('perf_hooks'); // eslint-disable-line
const { fork } = require('child_process');
const bs = require('browser-sync').create();

const buildFile = path.join(__dirname, 'build');
let browsersync = '';

function doBuild() {
  const t0 = performance.now();
  const buildTask = fork(buildFile, [], {
    env: {
      ...process.env, // same env vars as this script
      QUIET: true, // no verbose logs
      BROWSERSYNC: browsersync,
    },
  });

  buildTask.on('exit', () => {
    const t1 = performance.now();
    console.log(
      '\x1b[1;32m%s\x1b[0m',
      `✔ Build OK - ${Math.round(t1 - t0)}ms`,
      `(${process.env.NODE_ENV === 'production' ? 'PROD' : 'DEV'})`
    );
    bs.reload();
  });

  buildTask.on('error', console.error.bind(console));
}

const config = {
  host: 'localhost',
  port: 3003,
  socket: { domain: 'http://localhost:3003' },
  script: { domain: 'http://localhost:3003' },
  open: false,
  ghostMode: false,
  logSnippet: false,
  logConnections: true,
};

bs.init(config, (err, _bs) => {
  if (err) throw err;
  browsersync = _bs.options.get('snippet');
  doBuild();
});

bs.watch('src/**/*', (event) => {
  if (event === 'change') {
    doBuild();
  }
});
