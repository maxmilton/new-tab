import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "test/e2e",
  testMatch: "test/e2e/**/*.spec.ts",
  snapshotPathTemplate: "test/e2e/__snapshots__/{testFilePath}/{arg}{ext}",
  failOnFlakyTests: Boolean(process.env.CI),
  forbidOnly: Boolean(process.env.CI),
  fullyParallel: true,
  globalTimeout: 8 * 60 * 1000, // 8 minutes (keep under CI timeout)
  // repeatEach: 3, // uncomment to detect flaky tests
  retries: 0, // a flake is a bug; fix it, never retry it
  use: {
    acceptDownloads: false,
    contextOptions: { strictSelectors: true },
    locale: "en-US",
    offline: true, // the extension must work 100% offline
    timezoneId: "UTC",
    trace: "retain-on-failure",
  },
  expect: {
    toHaveScreenshot: {
      scale: "device",
      stylePath: "test/e2e/screenshot.css",
      // TODO: Use 0.02 once we have a good way to do cross-platform snapshots.
      maxDiffPixelRatio: 0.1, // allow for font rendering variance
    },
  },
});
