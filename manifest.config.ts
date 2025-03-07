// https://developer.chrome.com/docs/extensions/mv3/manifest/
// https://developer.chrome.com/docs/extensions/reference/

import pkg from './package.json' with { type: 'json' };

function gitRef() {
  return Bun.spawnSync([
    'git',
    'describe',
    '--always',
    '--dirty=-dev',
    '--broken',
  ])
    .stdout.toString()
    .trim()
    .replace(/^v/, '');
}

// FIXME: Remove these once @types/chrome is updated.
// https://developer.chrome.com/docs/extensions/mv3/cross-origin-isolation/
interface ManifestExtra {
  /** https://developer.chrome.com/docs/extensions/mv3/manifest/cross_origin_embedder_policy/ */
  cross_origin_embedder_policy?: {
    value: string;
  };
  /** https://developer.chrome.com/docs/extensions/mv3/manifest/cross_origin_opener_policy/ */
  cross_origin_opener_policy?: {
    value: string;
  };
}

export const createManifest = (
  debug = !process.env.CI,
): chrome.runtime.ManifestV3 & ManifestExtra => ({
  manifest_version: 3,
  name: 'New Tab',
  description: pkg.description,
  homepage_url: pkg.homepage,
  version: pkg.version.split('-')[0],
  // shippable releases should not have a named version
  version_name: debug ? gitRef() : undefined,
  minimum_chrome_version: '123', // for light-dark() CSS function
  icons: {
    16: 'icon16.png',
    48: 'icon48.png',
    128: 'icon128.png',
  },
  permissions: [
    'bookmarks',
    'favicon', // for favicon cache
    'history',
    'sessions', // for recently closed tabs
    'storage', // to persist user settings
    'tabs', // to access tab title and URL
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
      "base-uri 'none'",
      "script-src 'self'",
      "style-src 'self'",
      "img-src 'self'",
      '', // include trailing semicolon
    ].join(';'),
  },
  // https://developer.chrome.com/docs/extensions/mv3/cross-origin-isolation/
  cross_origin_embedder_policy: { value: 'require-corp' },
  cross_origin_opener_policy: { value: 'same-origin' },

  // https://chrome.google.com/webstore/detail/new-tab/cpcibnbdmpmcmnkhoiilpnlaepkepknb
  // biome-ignore lint/nursery/noSecrets: not a secret
  key: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAk9BfRa5CXuCX1ElY0yu9kJSqxFirFtSy79ZR/fyKHdOzZurQXNmhIyxVnQXd2bxHvuKUyZGahm/gwgyyzGuxhsQEue6wTD9TnOvvM2vusXpnoCr6Ili7sBwUo9vA2aPI77NB0eArXz9WWNmoDWW5WEqI/rk26Tinl8SNU9iDJISbL+dMses1QPw64oYFWB1J4JeB1MhXnzTxECpGZTn33LhgBU4J3ooT6eoqrsJdRvuc0vjPMxq/jfqLkdBbzlsnrMbgtDoJ9WiWj2lA0MzHGDAQ8HgnMEi3SpXRNnod9CCBnxmkHqv3u4u7Tvp/WLAgJ+QjCt+9yYyw3nOYHpEweQIDAQAB',
});
