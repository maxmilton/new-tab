'use strict'; // eslint-disable-line

const pkg = require('./package.json');

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  manifest_version: 2,

  name: 'New Tab',
  description: 'A high performance new tab page that gets you where you need to go faster.',
  version: pkg.version,
  version_name: process.env.APP_RELEASE,
  homepage_url: 'https://github.com/MaxMilton/new-tab',

  permissions: [
    'bookmarks',
    'chrome://favicon/',
    'history',
    'tabs',
  ],
  chrome_url_overrides: {
    newtab: 'ntp.html',
  },
  offline_enabled: true,

  ...(isProduction
    // tighter security than default
    ? { content_security_policy: "script-src 'self'; object-src 'self'" }
    // allow connections from http://localhost during local development
    : { content_security_policy: "script-src 'self' blob: filesystem: chrome-extension-resource: http://localhost:*; object-src 'self'" }
  ),
};
