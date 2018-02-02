/* eslint-disable strict, import/no-extraneous-dependencies, no-console */

'use strict';

const { fork } = require('child_process');
const bs = require('browser-sync').create();

let browserSync = '';

function doBuild() {
  const buildTask = fork('./build', {
    env: { browserSync },
  });

  buildTask.on('exit', () => {
    console.log('Build complete');
    bs.reload();
  });

  buildTask.on('error', console.error.bind(console));
}

bs.init({
  host: 'localhost',
  port: 3000,
  socket: { domain: 'http://localhost:3000' },
  script: { domain: 'http://localhost:3000' },
  open: false,
  ghostMode: false,
  logSnippet: false,
  logConnections: true,
}, (_, data) => {
  browserSync = data.options.get('snippet');
  doBuild();
});

bs.watch('src/**/*', (event) => {
  if (event === 'change') {
    doBuild();
  }
});
