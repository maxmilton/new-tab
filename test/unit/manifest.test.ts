import { expect, test } from 'bun:test';
// @ts-expect-error - TODO: Remove this line after we switch to pure Bun (and convert to .ts)
// eslint-disable-next-line import/extensions
import { manifest as getManifest } from '../../manifest.config.mjs';

const manifest = getManifest();

test('is valid JSON', () => {
  const result = JSON.parse(JSON.stringify(manifest)) as typeof manifest;
  expect(result).toEqual(manifest);
});

test('contains expected properties', () => {
  expect(manifest.manifest_version).toBeDefined();
  expect(manifest.name).toBeDefined();
  expect(manifest.description).toBeDefined();
  expect(manifest.version).toBeDefined();
  expect(manifest.minimum_chrome_version).toBeDefined();
  expect(manifest.homepage_url).toBeDefined();
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
  expect(typeof manifest.manifest_version).toBe('number');
  expect(typeof manifest.name).toBe('string');
  expect(typeof manifest.description).toBe('string');
  expect(typeof manifest.version).toBe('string');
  expect(typeof manifest.minimum_chrome_version).toBe('string');
  expect(typeof manifest.homepage_url).toBe('string');
  expect(typeof manifest.icons).toBe('object');
  expect(typeof manifest.icons?.[16]).toBe('string');
  expect(typeof manifest.icons?.[48]).toBe('string');
  expect(typeof manifest.icons?.[128]).toBe('string');
  expect(typeof manifest.permissions).toBe('object');
  expect(manifest.permissions).toBeInstanceOf(Array);
  expect(typeof manifest.chrome_url_overrides).toBe('object');
  expect(typeof manifest.chrome_url_overrides?.newtab).toBe('string');
  expect(typeof manifest.background).toBe('object');
  expect(typeof manifest.background?.service_worker).toBe('string');
  expect(typeof manifest.options_ui).toBe('object');
  expect(typeof manifest.options_ui?.page).toBe('string');
  expect(typeof manifest.offline_enabled).toBe('boolean');
  expect(typeof manifest.incognito).toBe('string');
  expect(typeof manifest.content_security_policy).toBe('object');
  expect(typeof manifest.content_security_policy?.extension_pages).toBe('string');
  expect(typeof manifest.key).toBe('string');
});

test('does not contain any unexpected properties', () => {
  const expectedProperties = [
    'manifest_version',
    'name',
    'description',
    'version',
    'version_name',
    'minimum_chrome_version',
    'homepage_url',
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
  expect(manifest.permissions).toHaveLength(7);
  expect(manifest.permissions).toContain('bookmarks');
  expect(manifest.permissions).toContain('favicon');
  expect(manifest.permissions).toContain('history');
  expect(manifest.permissions).toContain('sessions');
  expect(manifest.permissions).toContain('storage');
  expect(manifest.permissions).toContain('tabs');
  expect(manifest.permissions).toContain('topSites');
});

// test('does not have version_name when GITHUB_REF is set', () => {
//   process.env.GITHUB_REF = 'v1.0.0';
//   const manifest2 = getManifest();
//   expect(manifest2.version_name).toBeUndefined();
// });

// test('has version_name when GITHUB_REF is not set', () => {
//   delete process.env.GITHUB_REF;
//   const manifest2 = getManifest();
//   expect(manifest2.version_name).toBeDefined();
// });

test('does not have version_name when env var CI=true', () => {
  process.env.CI = 'true';
  const manifest2 = getManifest();
  expect(manifest2.version_name).toBeUndefined();
  delete process.env.CI;
});

test('has version_name when CI env var is not set', () => {
  const oldCI = process.env.CI;
  delete process.env.CI;
  const manifest2 = getManifest();
  expect(manifest2.version_name).toBeDefined();
  process.env.CI = oldCI;
});
