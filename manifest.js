/* tslint:disable:quotemark max-line-length */

const pkg = require('./package.json');

const isProd = process.env.NODE_ENV === 'production';
const cspHash = "'sha256-YEDeigdATq/qONj0g3Dz+aRAzq9XT8EZX3ZwEdIFqAQ='"; // loader.js

export default {
  manifest_version: 2,

  name: 'New Tab',
  description: '⚡ A high performance new tab page that gets you where you need to go faster.',
  version: pkg.version,
  version_name: process.env.APP_RELEASE,
  homepage_url: pkg.homepage,

  permissions: [
    'bookmarks',
    'chrome://favicon/',
    'history',
    'storage',
    'tabs',
    'topSites',
  ],
  chrome_url_overrides: {
    newtab: 'n.html',
  },
  options_ui: {
    chrome_style: true,
    page: 's.html',
  },
  background: {
    scripts: ['b.js'],
    persistent: true, // keep the extension in memory for fast load
  },
  offline_enabled: true,
  incognito: 'not_allowed',

  ...(isProd
    // tighter security than default
    ? { content_security_policy: `default-src 'none'; script-src 'self' ${cspHash}; style-src 'unsafe-inline'; img-src data: chrome: *; connect-src https://sentry.io` }
    // allow connections from http://localhost during local development
    : { content_security_policy: `script-src 'self' blob: filesystem: chrome-extension-resource: http://localhost:* ${cspHash}; object-src 'self'` }
  ),
};
