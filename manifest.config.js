/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-extraneous-dependencies */

const { gitRef } = require('git-ref');
const pkg = require('./package.json');

const manifest = {
  manifest_version: 2,

  name: 'New Tab',
  description:
    '⚡ A high performance new tab page that gets you where you need to go faster.',
  version: pkg.version,
  version_name: gitRef(),
  homepage_url: pkg.homepage,
  icons: {
    16: 'icon16.png',
    48: 'icon48.png',
    128: 'icon128.png',
  },
  permissions: [
    'bookmarks',
    'chrome://favicon/',
    'history',
    'storage',
    'tabs',
    'topSites',
  ],
  chrome_url_overrides: {
    newtab: 'newtab.html',
  },
  options_ui: {
    page: 'settings.html',
  },
  offline_enabled: true,
  incognito: 'not_allowed',
  content_security_policy:
    "default-src 'none';"
    // theme loader script to be embedded inline in the document
    + " script-src 'self' 'sha256-FtIFk1UjzWWlhfMrIdJ9n60rbnTmldIAss9HFJTJeUM=';"
    + " style-src 'unsafe-inline';"
    // `data:` used in settings page
    + ' img-src chrome://favicon data:;',
};

module.exports = JSON.stringify(manifest);
