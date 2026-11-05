import { describe, expect, onTestFinished, test } from "bun:test";
import { browserslistToTargets } from "lightningcss";
import dist from "../../dist/manifest.json" with { type: "json" };
import { createManifest, cssTarget, MIN_CHROME_VERSION } from "../../manifest.config.ts";

// MAJOR[.MINOR[.BUILD[.PATCH]]] without leading zeros, e.g., "152" or "152.0.7000.12"
// https://www.chromium.org/developers/version-numbers/
const CHROME_VERSION_RE = /^[1-9]\d*(?:\.(?:0|[1-9]\d*)){0,3}$/u;
// Independent oracle: lightningcss's own encoding of a major-only Chrome target.
const browserslistTarget = (major: number | string) =>
  // oxlint-disable-next-line typescript/no-non-null-assertion
  browserslistToTargets([`chrome ${major}`]).chrome!;

const manifest = createManifest(true);

describe("MIN_CHROME_VERSION", () => {
  const [major] = MIN_CHROME_VERSION.split(".", 1);

  test("is a valid Chrome version", () => {
    expect.assertions(1);
    expect(MIN_CHROME_VERSION).toMatch(CHROME_VERSION_RE);
  });

  test("is at least Chrome 88 (manifest v3 minimum)", () => {
    expect.assertions(1);
    expect(Number(major)).toBeGreaterThanOrEqual(88);
  });

  test("is the manifest minimum_chrome_version", () => {
    expect.assertions(2);
    expect(manifest.minimum_chrome_version).toBe(MIN_CHROME_VERSION);
    expect(dist.minimum_chrome_version).toBe(MIN_CHROME_VERSION);
  });

  test("build CSS target is its major version", () => {
    expect.assertions(1);
    expect(cssTarget(MIN_CHROME_VERSION)).toBe(browserslistTarget(major));
  });
});

describe("Chrome browser version", () => {
  // Oracle validation: the "is valid"/"is invalid" cases check CHROME_VERSION_RE
  // against Chromium's version spec, not product code.
  describe.each([
    ["152", 152],
    ["152.0", 152],
    ["152.0.7000", 152],
    ["152.0.7000.12", 152],
    ["1", 1],
    ["1000.10.100000.1", 1000],
  ])("%s", (version, major) => {
    test("is valid", () => {
      expect.assertions(1);
      expect(version).toMatch(CHROME_VERSION_RE);
    });

    test(`build CSS target is chrome ${major}`, () => {
      expect.assertions(1);
      expect(cssTarget(version)).toBe(browserslistTarget(major));
    });
  });

  test.each([
    "",
    " ",
    "-1",
    "0",
    "0152",
    "152.",
    ".152",
    "152..0",
    "152.01",
    "152.0.7000.12.1",
    "v152",
    "152.0-beta",
    " 152",
  ])("%p is invalid", (version) => {
    expect.assertions(1);
    expect(version).not.toMatch(CHROME_VERSION_RE);
  });
});

test("is an object", () => {
  expect.assertions(1);
  expect(manifest).toBePlainObject();
});

test("is valid JSON", () => {
  expect.assertions(1);
  // oxlint-disable-next-line unicorn/prefer-structured-clone
  expect(JSON.parse(JSON.stringify(manifest))).toEqual(manifest);
});

test("is equal to dist/manifest.json (excluding version_name)", () => {
  expect.assertions(1);
  const { version_name: _vn1, ...restSrc } = manifest;
  const { version_name: _vn2, ...restDist } = dist as ReturnType<typeof createManifest>;
  expect(restSrc).toEqual(restDist);
});

test("contains expected properties", () => {
  expect.assertions(27);
  expect(manifest).toHaveProperty("manifest_version");
  expect(manifest).toHaveProperty("name");
  expect(manifest).toHaveProperty("description");
  expect(manifest).toHaveProperty("homepage_url");
  expect(manifest).toHaveProperty("version");
  expect(manifest).toHaveProperty("version_name");
  expect(manifest).toHaveProperty("minimum_chrome_version");
  expect(manifest).toHaveProperty("icons");
  expect(manifest).toHaveProperty(["icons", "16"]);
  expect(manifest).toHaveProperty(["icons", "48"]);
  expect(manifest).toHaveProperty(["icons", "128"]);
  expect(manifest).toHaveProperty("permissions");
  expect(manifest).toHaveProperty("chrome_url_overrides");
  expect(manifest).toHaveProperty(["chrome_url_overrides", "newtab"]);
  expect(manifest).toHaveProperty("background");
  expect(manifest).toHaveProperty(["background", "service_worker"]);
  expect(manifest).toHaveProperty("options_ui");
  expect(manifest).toHaveProperty(["options_ui", "page"]);
  expect(manifest).toHaveProperty("offline_enabled");
  expect(manifest).toHaveProperty("incognito");
  expect(manifest).toHaveProperty("content_security_policy");
  expect(manifest).toHaveProperty(["content_security_policy", "extension_pages"]);
  expect(manifest).toHaveProperty("cross_origin_embedder_policy");
  expect(manifest).toHaveProperty(["cross_origin_embedder_policy", "value"]);
  expect(manifest).toHaveProperty("cross_origin_opener_policy");
  expect(manifest).toHaveProperty(["cross_origin_opener_policy", "value"]);
  expect(manifest).toHaveProperty("key");
});

test("properties are the correct type", () => {
  expect.assertions(27);
  expect(manifest.manifest_version).toBeNumber();
  expect(manifest.name).toBeString();
  expect(manifest.description).toBeString();
  expect(manifest.homepage_url).toBeString();
  expect(manifest.version).toBeString();
  expect(manifest.version_name).toBeString();
  expect(manifest.minimum_chrome_version).toBeString();
  expect(manifest.icons).toBePlainObject();
  expect(manifest.icons?.[16]).toBeString();
  expect(manifest.icons?.[48]).toBeString();
  expect(manifest.icons?.[128]).toBeString();
  expect(manifest.permissions).toBeArray();
  expect(manifest.chrome_url_overrides).toBePlainObject();
  expect(manifest.chrome_url_overrides?.newtab).toBeString();
  expect(manifest.background).toBePlainObject();
  expect(manifest.background?.service_worker).toBeString();
  expect(manifest.options_ui).toBePlainObject();
  expect(manifest.options_ui?.page).toBeString();
  expect(manifest.offline_enabled).toBeBoolean();
  expect(manifest.incognito).toBeString();
  expect(manifest.content_security_policy).toBePlainObject();
  expect(manifest.content_security_policy?.extension_pages).toBeString();
  expect(manifest.cross_origin_embedder_policy).toBePlainObject();
  expect(manifest.cross_origin_embedder_policy?.value).toBeString();
  expect(manifest.cross_origin_opener_policy).toBePlainObject();
  expect(manifest.cross_origin_opener_policy?.value).toBeString();
  expect(manifest.key).toBeString();
});

test("does not contain any unexpected properties", () => {
  expect.assertions(19);
  const expectedProperties: readonly string[] = [
    "manifest_version",
    "name",
    "description",
    "homepage_url",
    "version",
    "version_name",
    "minimum_chrome_version",
    "icons",
    "permissions",
    "chrome_url_overrides",
    "background",
    "options_ui",
    "offline_enabled",
    "incognito",
    "content_security_policy",
    "cross_origin_embedder_policy",
    "cross_origin_opener_policy",
    "key",
  ];
  // oxlint-disable-next-line guard-for-in
  for (const property in manifest) {
    expect(expectedProperties).toContain(property);
  }
  expect(Object.keys(manifest)).toHaveLength(expectedProperties.length);
});

test("opens settings in a dedicated full tab", () => {
  expect.assertions(1);
  expect(manifest.options_ui?.open_in_tab).toBeTrue();
});

test("manifest version is v3", () => {
  expect.assertions(1);
  expect(manifest.manifest_version).toBe(3);
});

test("permissions contains expected values", () => {
  expect.assertions(8);
  expect(manifest.permissions).toContain("bookmarks");
  expect(manifest.permissions).toContain("favicon");
  expect(manifest.permissions).toContain("history");
  expect(manifest.permissions).toContain("sessions");
  expect(manifest.permissions).toContain("storage");
  expect(manifest.permissions).toContain("tabs");
  expect(manifest.permissions).toContain("topSites");
  expect(manifest.permissions).toHaveLength(7);
});

test("has correct icons.* values", () => {
  expect.assertions(4);
  expect(manifest.icons).toHaveProperty("16", "icon16.png");
  expect(manifest.icons).toHaveProperty("48", "icon48.png");
  expect(manifest.icons).toHaveProperty("128", "icon128.png");
  // oxlint-disable-next-line typescript/no-non-null-assertion
  expect(Object.keys(manifest.icons!)).toHaveLength(3);
});

test("has correct chrome_url_overrides.newtab value", () => {
  expect.assertions(1);
  expect(manifest.chrome_url_overrides?.newtab).toBe("newtab.html");
});

test("has correct service_worker value", () => {
  expect.assertions(1);
  expect(manifest.background?.service_worker).toBe("sw.js");
});

test("has version_name when debug option is true", () => {
  expect.assertions(1);
  const manifest2 = createManifest(true);
  expect(manifest2.version_name).toBeDefined();
});

test("does not have version_name when when debug option is false", () => {
  expect.assertions(1);
  const manifest2 = createManifest(false);
  expect(manifest2.version_name).toBeUndefined();
});

/** Pins `process.env.CI` for one test. */
function pinCI(value: string) {
  const old = process.env.CI;
  onTestFinished(() => {
    if (old === undefined) delete process.env.CI;
    else process.env.CI = old;
  });
  process.env.CI = value;
}

test.serial("has version_name when CI env var is empty", () => {
  expect.assertions(1);
  pinCI(""); // empty is falsy, same as unset for `!process.env.CI`
  const manifest2 = createManifest();
  expect(manifest2.version_name).toBeDefined();
});

test.serial("does not have version_name when env var CI=true", () => {
  expect.assertions(1);
  pinCI("true");
  const manifest2 = createManifest();
  expect(manifest2.version_name).toBeUndefined();
});

test("has a strict content security policy for extension pages", () => {
  expect.assertions(1);
  expect(manifest.content_security_policy?.extension_pages).toBe(
    "default-src 'none';base-uri 'none';script-src 'self';style-src 'self';img-src 'self';",
  );
});

// https://developer.chrome.com/docs/extensions/develop/concepts/cross-origin-isolation
test("is cross-origin isolated", () => {
  expect.assertions(2);
  expect(manifest.cross_origin_embedder_policy).toEqual({ value: "require-corp" });
  expect(manifest.cross_origin_opener_policy).toEqual({ value: "same-origin" });
});

test("is enabled offline", () => {
  expect.assertions(1);
  expect(manifest.offline_enabled).toBeTrue();
});

test("is not allowed in incognito", () => {
  expect.assertions(1);
  expect(manifest.incognito).toBe("not_allowed");
});

// https://developer.chrome.com/docs/extensions/reference/manifest/version
// 1-4 dot-separated integers in 0..65535, no leading zeros, not all zero.
test("version is a valid extension version", () => {
  expect.assertions(3);
  const parts = manifest.version.split(".");
  expect(manifest.version).toMatch(/^(?:0|[1-9]\d*)(?:\.(?:0|[1-9]\d*)){0,3}$/u);
  expect(Math.max(...parts.map(Number))).toBeLessThanOrEqual(65_535);
  expect(parts.some((part) => part !== "0")).toBeTrue();
});

// https://developer.chrome.com/docs/extensions/reference/manifest/description
test("description is non-empty and at most 132 characters", () => {
  expect.assertions(2);
  expect(manifest.description?.length).toBeGreaterThan(0);
  expect(manifest.description?.length).toBeLessThanOrEqual(132);
});
