/* eslint-disable @typescript-eslint/camelcase, import/no-extraneous-dependencies, sort-keys */

import { gitDescribe } from 'minna-tools';
import pkg from './package.json';

export default JSON.stringify({
  manifest_version: 2,

  name: 'New Tab',
  description:
    '⚡ A high performance new tab page that gets you where you need to go faster.',
  version: pkg.version,
  version_name: gitDescribe(),
  homepage_url: pkg.homepage,
  icons: {
    128: 'icon128.png',
    48: 'icon48.png',
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
    newtab: 'n.html',
  },
  options_ui: {
    chrome_style: true,
    page: 's.html',
  },
  offline_enabled: true,
  incognito: 'not_allowed',
  content_security_policy:
    "default-src 'none';" +
    // allow `loader.ts` to be embedded in the document
    " script-src 'self' 'sha256-FtIFk1UjzWWlhfMrIdJ9n60rbnTmldIAss9HFJTJeUM=';" +
    " style-src 'unsafe-inline';" +
    // `data:` used in settings page
    ' img-src chrome://favicon data:;',
});
