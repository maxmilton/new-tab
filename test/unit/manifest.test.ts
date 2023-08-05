import { expect, test } from 'bun:test';
import { createManifest } from '../../manifest.config';

const manifest = createManifest();

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
  expect(manifest.key).toBeDefined();
});

test('properties are the correct type', () => {
  expect(manifest.manifest_version).toBeTypeOf('number');
  expect(manifest.name).toBeTypeOf('string');
  expect(manifest.description).toBeTypeOf('string');
  expect(manifest.homepage_url).toBeTypeOf('string');
  expect(manifest.version).toBeTypeOf('string');
  expect(manifest.minimum_chrome_version).toBeTypeOf('string');
  expect(manifest.icons).toBeTypeOf('object');
  expect(manifest.icons?.[16]).toBeTypeOf('string');
  expect(manifest.icons?.[48]).toBeTypeOf('string');
  expect(manifest.icons?.[128]).toBeTypeOf('string');
  expect(manifest.permissions).toBeArray();
  expect(manifest.chrome_url_overrides).toBeTypeOf('object');
  expect(manifest.chrome_url_overrides?.newtab).toBeTypeOf('string');
  expect(manifest.background).toBeTypeOf('object');
  expect(manifest.background?.service_worker).toBeTypeOf('string');
  expect(manifest.options_ui).toBeTypeOf('object');
  expect(manifest.options_ui?.page).toBeTypeOf('string');
  expect(manifest.offline_enabled).toBeTypeOf('boolean');
  expect(manifest.incognito).toBeTypeOf('string');
  expect(manifest.content_security_policy).toBeTypeOf('object');
  expect(manifest.content_security_policy?.extension_pages).toBeTypeOf('string');
  expect(manifest.key).toBeTypeOf('string');
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
});

test('has correct chrome_url_overrides.newtab value of "newtab.html"', () => {
  expect(manifest.chrome_url_overrides?.newtab).toBe('newtab.html');
});

test('has correct service_worker value of "sw.js"', () => {
  expect(manifest.background?.service_worker).toBe('sw.js');
});

const oldCI = process.env.CI;
const restoreCI = () => {
  if (oldCI === undefined) {
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

test('has version_name when CI env var is not set', () => {
  process.env.CI = ''; // using "delete" doesn't work
  const manifest2 = createManifest();
  expect(manifest2.version_name).toBeDefined();
  restoreCI();
});
