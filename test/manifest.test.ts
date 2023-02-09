import { test } from 'uvu';
import * as assert from 'uvu/assert';
// eslint-disable-next-line import/extensions
import manifest from '../manifest.config.mjs';

test('is valid JSON', () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const result = JSON.parse(JSON.stringify(manifest));
  assert.ok(result);
  assert.type(result, 'object');
  assert.instance(result, Object);
});

test('contains expected properties', () => {
  assert.ok(manifest.manifest_version, 'has manifest_version');
  assert.ok(manifest.name, 'has name');
  assert.ok(manifest.description, 'has description');
  assert.ok(manifest.version, 'has version');
  assert.ok(manifest.version_name, 'has version_name');
  assert.ok(manifest.minimum_chrome_version, 'has minimum_chrome_version');
  assert.ok(manifest.homepage_url, 'has homepage_url');
  assert.ok(manifest.icons, 'has icons');
  assert.ok(manifest.icons[16], 'has icons.16');
  assert.ok(manifest.icons[48], 'has icons.48');
  assert.ok(manifest.icons[128], 'has icons.128');
  assert.ok(manifest.permissions, 'has permissions');
  assert.ok(manifest.chrome_url_overrides, 'has chrome_url_overrides');
  assert.ok(manifest.chrome_url_overrides.newtab, 'has chrome_url_overrides.newtab');
  assert.ok(manifest.background, 'has background');
  // @ts-expect-error - Not in upstream types yet
  assert.ok(manifest.background.service_worker, 'has background.service_worker');
  assert.ok(manifest.options_ui, 'has options_ui');
  assert.ok(manifest.options_ui.page, 'has options_ui.page');
  assert.ok(manifest.offline_enabled, 'has offline_enabled');
  assert.ok(manifest.incognito, 'has incognito');
  assert.ok(manifest.content_security_policy, 'has content_security_policy');
  // @ts-expect-error - Not in upstream types yet
  assert.ok(manifest.content_security_policy.extension_pages, 'has content_security_policy.extension_pages');
  assert.ok(manifest.key, 'has key');

  assert.not.ok(manifest.options_ui.open_in_tab, "doesn't have options_ui.open_in_tab");
});

test('properties are the correct type', () => {
  assert.type(manifest.manifest_version, 'number', 'manifest_version is a number');
  assert.type(manifest.name, 'string', 'name is a string');
  assert.type(manifest.description, 'string', 'description is a string');
  assert.type(manifest.version, 'string', 'version is a string');
  assert.type(manifest.version_name, 'string', 'version_name is a string');
  assert.type(manifest.minimum_chrome_version, 'string', 'minimum_chrome_version is a string');
  assert.type(manifest.homepage_url, 'string', 'homepage_url is a string');
  assert.type(manifest.icons, 'object', 'icons is an object');
  assert.type(manifest.icons?.[16], 'string', 'icons.16 is a string');
  assert.type(manifest.icons?.[48], 'string', 'icons.48 is a string');
  assert.type(manifest.icons?.[128], 'string', 'icons.128 is a string');
  assert.type(manifest.permissions, 'object', 'permissions is an object');
  assert.instance(manifest.permissions, Array, 'permissions is an instance of array');
  assert.type(manifest.chrome_url_overrides, 'object', 'chrome_url_overrides is an object');
  assert.type(manifest.chrome_url_overrides?.newtab, 'string', 'chrome_url_overrides.newtab is a string');
  assert.type(manifest.background, 'object', 'background is an object');
  // @ts-expect-error - Not in upstream types yet
  assert.type(manifest.background.service_worker, 'string', 'background.service_worker is a string');
  assert.type(manifest.options_ui, 'object', 'options_ui is an object');
  assert.type(manifest.options_ui?.page, 'string', 'options_ui.page is a string');
  assert.type(manifest.offline_enabled, 'boolean', 'offline_enabled is a boolean');
  assert.type(manifest.incognito, 'string', 'incognito is a string');
  assert.type(manifest.content_security_policy, 'object', 'content_security_policy is a object');
  // @ts-expect-error - Not in upstream types yet
  assert.type(manifest.content_security_policy.extension_pages, 'string', 'content_security_policy.extension_pages is a string');
  assert.type(manifest.key, 'string', 'key is a string');

  assert.not.type(manifest.options_ui?.open_in_tab, 'boolean', 'options_ui.open_in_tab is not a boolean');
});

test('manifest version is v3', () => {
  assert.is(manifest.manifest_version, 3);
});

test('permissions contains expected values', () => {
  assert.ok(manifest.permissions?.includes('bookmarks'), 'has bookmarks');
  // @ts-expect-error - Not in upstream types yet
  assert.ok(manifest.permissions?.includes('favicon'), 'has favicon');
  assert.ok(manifest.permissions?.includes('history'), 'has history');
  assert.ok(manifest.permissions?.includes('sessions'), 'has sessions');
  assert.ok(manifest.permissions?.includes('storage'), 'has storage');
  assert.ok(manifest.permissions?.includes('tabs'), 'has tabs');
  assert.ok(manifest.permissions?.includes('topSites'), 'has topSites');
  assert.is(manifest.permissions?.length, 7);
});

test.run();
