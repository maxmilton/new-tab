/* eslint-disable import/no-extraneous-dependencies */

// https://developer.chrome.com/docs/extensions/mv3/manifest/
// https://developer.chrome.com/docs/extensions/reference/

import { gitRef } from 'git-ref';
import pkg from './package.json' assert { type: 'json' };

/** @type {() => chrome.runtime.Manifest} */
export const manifest = () => ({
  manifest_version: 3,
  name: 'New Tab',
  description: pkg.description,
  version: pkg.version,
  // production releases should not have a named version
  version_name: process.env.GITHUB_REF ? undefined : gitRef().replace(/^v/, ''),
  minimum_chrome_version: '113',
  homepage_url: pkg.homepage,
  icons: {
    16: 'icon16.png',
    48: 'icon48.png',
    128: 'icon128.png',
  },
  permissions: [
    'bookmarks',
    'favicon',
    'history',
    'sessions',
    'storage',
    'tabs',
    'topSites',
  ],
  chrome_url_overrides: {
    newtab: 'newtab.html',
  },
  background: {
    service_worker: 'sw.js',
  },
  options_ui: {
    page: 'settings.html',
    // open_in_tab: true, // dev only
  },
  offline_enabled: true,
  incognito: 'not_allowed',
  content_security_policy: {
    extension_pages: [
      "default-src 'none'",
      "script-src 'self'",
      "style-src 'self'",
      "img-src 'self'",
      "base-uri 'none'",
    ].join(';'),
  },
  // https://chrome.google.com/webstore/detail/new-tab/cpcibnbdmpmcmnkhoiilpnlaepkepknb
  key: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAk9BfRa5CXuCX1ElY0yu9kJSqxFirFtSy79ZR/fyKHdOzZurQXNmhIyxVnQXd2bxHvuKUyZGahm/gwgyyzGuxhsQEue6wTD9TnOvvM2vusXpnoCr6Ili7sBwUo9vA2aPI77NB0eArXz9WWNmoDWW5WEqI/rk26Tinl8SNU9iDJISbL+dMses1QPw64oYFWB1J4JeB1MhXnzTxECpGZTn33LhgBU4J3ooT6eoqrsJdRvuc0vjPMxq/jfqLkdBbzlsnrMbgtDoJ9WiWj2lA0MzHGDAQ8HgnMEi3SpXRNnod9CCBnxmkHqv3u4u7Tvp/WLAgJ+QjCt+9yYyw3nOYHpEweQIDAQAB',
});
