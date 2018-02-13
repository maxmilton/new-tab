/* tslint:disable:quotemark max-line-length */

'use strict'; // eslint-disable-line

const pkg = require('../package.json');

const isProduction = process.env.NODE_ENV === 'production';
let hashes = "'sha256-vYMJ2ORxi1FGLgYPh62KiRPKPCuCWJVB8goB6ku0AmI='"; // file loader, settings page
hashes += " 'sha256-sRcSAAj4ZwPU9swceTK3zzN//6FK9lOpIjnliU+GTCY='"; // file loader, new tab page

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
    'storage',
    'tabs',
  ],
  chrome_url_overrides: {
    newtab: 'ntp.html',
  },
  options_ui: {
    page: 'settings.html',
    chrome_style: true,
  },
  offline_enabled: true,

  ...(isProduction
    // tighter security than default
    ? { content_security_policy: `script-src 'self' ${hashes}; object-src 'self'` }
    // allow connections from http://localhost during local development
    : { content_security_policy: `script-src 'self' blob: filesystem: chrome-extension-resource: http://localhost:* ${hashes}; object-src 'self'` }
  ),
};
