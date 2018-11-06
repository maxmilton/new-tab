const pkg = require('../package.json');

export default {
  manifest_version: 2,

  name: 'New Tab',
  description: '⚡ A high performance new tab page that gets you where you need to go faster.',
  version: pkg.version,
  version_name: process.env.APP_RELEASE,
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
    "default-src 'none';"
    // hash is `loader.js` embedded into the document
    + " script-src 'self' 'sha256-FtIFk1UjzWWlhfMrIdJ9n60rbnTmldIAss9HFJTJeUM=';"
    + " style-src 'unsafe-inline';"
    // `data:` is used in the settings page
    + ' img-src chrome://favicon data:;',
};
