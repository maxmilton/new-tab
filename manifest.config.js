/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-extraneous-dependencies */

// https://developer.chrome.com/docs/extensions/mv2/manifest/
// https://developer.chrome.com/docs/extensions/reference/

const { gitRef } = require('git-ref');
const pkg = require('./package.json');

/** @type {chrome.runtime.Manifest} */
const manifest = {
  manifest_version: 2,
  name: 'New Tab',
  description:
    '⚡ A high performance new tab page that gets you where you need to go faster.',
  version: pkg.version,
  version_name: process.env.GITHUB_REF
    ? process.env.GITHUB_REF.replace('refs/tags/', '')
    : gitRef().replace(/^v/, ''),
  homepage_url: pkg.homepage,
  icons: {
    16: 'icon16.png',
    48: 'icon48.png',
    128: 'icon128.png',
  },
  permissions: [
    // https://developer.chrome.com/docs/extensions/reference/bookmarks/
    'bookmarks',
    'chrome://favicon/',
    // https://developer.chrome.com/docs/extensions/reference/history/
    'history',
    // https://developer.chrome.com/docs/extensions/reference/sessions/
    'sessions',
    // https://developer.chrome.com/docs/extensions/reference/storage/
    'storage',
    // https://developer.chrome.com/docs/extensions/reference/tabs/
    'tabs',
    // https://developer.chrome.com/docs/extensions/reference/topSites/
    'topSites',
  ],
  chrome_url_overrides: {
    newtab: 'newtab.html',
  },
  background: {
    // empty persistent background script
    scripts: ['background.js'],
  },
  options_ui: {
    page: 'settings.html',
  },
  offline_enabled: true,
  incognito: 'not_allowed',
  content_security_policy:
    "default-src 'none';"
    // hash of inline theme loader script embedded in the HTML
    + " script-src 'self' 'sha256-saGvUmKsyK2biD//gX6NmEe5sLkFCspZq73EYAhI1Io=';"
    // app styles are embedded in the HTML for fastest load performance
    + " style-src 'unsafe-inline';"
    + ' img-src chrome://favicon;',

  // https://chrome.google.com/webstore/detail/new-tab/cpcibnbdmpmcmnkhoiilpnlaepkepknb
  key: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAk9BfRa5CXuCX1ElY0yu9kJSqxFirFtSy79ZR/fyKHdOzZurQXNmhIyxVnQXd2bxHvuKUyZGahm/gwgyyzGuxhsQEue6wTD9TnOvvM2vusXpnoCr6Ili7sBwUo9vA2aPI77NB0eArXz9WWNmoDWW5WEqI/rk26Tinl8SNU9iDJISbL+dMses1QPw64oYFWB1J4JeB1MhXnzTxECpGZTn33LhgBU4J3ooT6eoqrsJdRvuc0vjPMxq/jfqLkdBbzlsnrMbgtDoJ9WiWj2lA0MzHGDAQ8HgnMEi3SpXRNnod9CCBnxmkHqv3u4u7Tvp/WLAgJ+QjCt+9yYyw3nOYHpEweQIDAQAB',
};

module.exports = manifest;
