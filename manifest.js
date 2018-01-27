'use strict'; // eslint-disable-line

const pkg = require('./package.json');

module.exports = {
  manifest_version: 2,

  name: 'New Tab',
  description: 'A minimal and high performance Google Chrome new tab page (NTP) extension.',
  version: pkg.version,

  permissions: [
    'tabs',
    'bookmarks',
    'history',
    'chrome://favicon/',
  ],
  chrome_url_overrides: {
    newtab: 'index.html',
  },
};
