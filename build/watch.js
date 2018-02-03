/* eslint-disable strict, import/no-extraneous-dependencies, no-console */

'use strict';

const path = require('path');
const { fork } = require('child_process');
const bs = require('browser-sync').create();

const buildFile = path.join(__dirname, 'build');
let browserSync = '';

function doBuild() {
  const buildTask = fork(buildFile, {
    env: { browserSync },
  });

  buildTask.on('exit', () => {
    console.log('Build complete');
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
  browserSync = _bs.options.get('snippet');
  doBuild();
});

bs.watch('../src/**/*', (event) => {
  if (event === 'change') {
    doBuild();
  }
});
