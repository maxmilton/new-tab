import { expect, test } from 'bun:test';
import { createManifest } from '../../manifest.config';

declare module 'bun:test' {
  interface Matchers {
    /** Asserts that a value is a plain `object`. */
    toBeObject(): void;
  }
}

expect.extend({
  toBeObject(received: unknown) {
    return Object.prototype.toString.call(received) === '[object Object]'
      ? { pass: true }
      : {
          pass: false,
          message: () => `expected ${String(received)} to be a plain object`,
        };
  },
});

const manifest = createManifest();

test('is an object', () => {
  expect(manifest).toBeObject();
});

test('is valid JSON', () => {
  const result = JSON.parse(JSON.stringify(manifest)) as typeof manifest;
  expect(result).toEqual(manifest);
});

test('contains expected properties', () => {
  expect(manifest.manifest_version).toBeDefined();
  expect(manifest.name).toBeDefined();
  expect(manifest.description).toBeDefined();
  expect(manifest.homepage_url).toBeDefined();
  expect(manifest.version).toBeDefined();
  expect(manifest.minimum_chrome_version).toBeDefined();
  expect(manifest.icons).toBeDefined();
  expect(manifest.icons?.[16]).toBeDefined();
  expect(manifest.icons?.[48]).toBeDefined();
  expect(manifest.icons?.[128]).toBeDefined();
  expect(manifest.permissions).toBeDefined();
  expect(manifest.chrome_url_overrides).toBeDefined();
  expect(manifest.chrome_url_overrides?.newtab).toBeDefined();
  expect(manifest.background).toBeDefined();
  expect(manifest.background?.service_worker).toBeDefined();
  expect(manifest.options_ui).toBeDefined();
  expect(manifest.options_ui?.page).toBeDefined();
  expect(manifest.offline_enabled).toBeDefined();
  expect(manifest.incognito).toBeDefined();
  expect(manifest.content_security_policy).toBeDefined();
  expect(manifest.content_security_policy?.extension_pages).toBeDefined();
  expect(manifest.cross_origin_embedder_policy).toBeDefined();
  expect(manifest.cross_origin_embedder_policy?.value).toBeDefined();
  expect(manifest.cross_origin_opener_policy).toBeDefined();
  expect(manifest.cross_origin_opener_policy?.value).toBeDefined();
  expect(manifest.key).toBeDefined();
});

test('properties are the correct type', () => {
  expect(manifest.manifest_version).toBeNumber();
  expect(manifest.name).toBeString();
  expect(manifest.description).toBeString();
  expect(manifest.homepage_url).toBeString();
  expect(manifest.version).toBeString();
  expect(manifest.minimum_chrome_version).toBeString();
  expect(manifest.icons).toBeObject();
  expect(manifest.icons?.[16]).toBeString();
  expect(manifest.icons?.[48]).toBeString();
  expect(manifest.icons?.[128]).toBeString();
  expect(manifest.permissions).toBeArray();
  expect(manifest.chrome_url_overrides).toBeObject();
  expect(manifest.chrome_url_overrides?.newtab).toBeString();
  expect(manifest.background).toBeObject();
  expect(manifest.background?.service_worker).toBeString();
  expect(manifest.options_ui).toBeObject();
  expect(manifest.options_ui?.page).toBeString();
  expect(manifest.offline_enabled).toBeBoolean();
  expect(manifest.incognito).toBeString();
  expect(manifest.content_security_policy).toBeObject();
  expect(manifest.content_security_policy?.extension_pages).toBeString();
  expect(manifest.cross_origin_embedder_policy).toBeObject();
  expect(manifest.cross_origin_embedder_policy?.value).toBeString();
  expect(manifest.cross_origin_opener_policy).toBeObject();
  expect(manifest.cross_origin_opener_policy?.value).toBeString();
  expect(manifest.key).toBeString();
});

test('does not contain any unexpected properties', () => {
  const expectedProperties = [
    'manifest_version',
    'name',
    'description',
    'homepage_url',
    'version',
    'version_name',
    'minimum_chrome_version',
    'icons',
    'permissions',
    'chrome_url_overrides',
    'background',
    'options_ui',
    'offline_enabled',
    'incognito',
    'content_security_policy',
    'cross_origin_embedder_policy',
    'cross_origin_opener_policy',
    'key',
  ];
  // eslint-disable-next-line guard-for-in
  for (const property in manifest) {
    expect(expectedProperties).toContain(property);
  }
  expect(Object.keys(manifest)).toHaveLength(expectedProperties.length);
});

test('does not contain any properties for development/debugging', () => {
  expect(manifest.options_ui?.open_in_tab).toBeUndefined();
});

test('manifest version is v3', () => {
  expect(manifest.manifest_version).toBe(3);
});

test('permissions contains expected values', () => {
  expect(manifest.permissions).toContain('bookmarks');
  expect(manifest.permissions).toContain('favicon');
  expect(manifest.permissions).toContain('history');
  expect(manifest.permissions).toContain('sessions');
  expect(manifest.permissions).toContain('storage');
  expect(manifest.permissions).toContain('tabs');
  expect(manifest.permissions).toContain('topSites');
  expect(manifest.permissions).toHaveLength(7);
});

test('has correct icons.* values', () => {
  expect(manifest.icons?.[16]).toBe('icon16.png');
  expect(manifest.icons?.[48]).toBe('icon48.png');
  expect(manifest.icons?.[128]).toBe('icon128.png');
  expect(Object.keys(manifest.icons!)).toHaveLength(3);
});

test('has correct chrome_url_overrides.newtab value', () => {
  expect(manifest.chrome_url_overrides?.newtab).toBe('newtab.html');
});

test('has correct service_worker value', () => {
  expect(manifest.background?.service_worker).toBe('sw.js');
});

test('has version_name when debug option is true', () => {
  const manifest2 = createManifest(true);
  expect(manifest2.version_name).toBeDefined();
});

test('does not have version_name when when debug option is false', () => {
  const manifest2 = createManifest(false);
  expect(manifest2.version_name).toBeUndefined();
});

// HACK: Mutating env vars that were set before the process started doesn't
// work in bun, so we skip tests which rely on the CI env var _not_ being set.
test.skipIf(!!process.env.CI)('has version_name when CI env var is not set', () => {
  const manifest2 = createManifest();
  expect(manifest2.version_name).toBeDefined();
});

const oldCI = process.env.CI;
const restoreCI = () => {
  if (oldCI === undefined) {
    // TODO: Consider setting to undefined instead. Delete does not currently
    // work in bun for env vars that were set before the process started.
    //  ↳ https://github.com/oven-sh/bun/issues/1559#issuecomment-1440507885
    //  ↳ May be fixed, need to investigate; https://github.com/oven-sh/bun/pull/7614
    delete process.env.CI;
  } else {
    process.env.CI = oldCI;
  }
};

test('does not have version_name when env var CI=true', () => {
  process.env.CI = 'true';
  const manifest2 = createManifest();
  expect(manifest2.version_name).toBeUndefined();
  restoreCI();
});
