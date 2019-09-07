/**
 * Jest config for end-to-end testing.
 */

/* eslint-disable sort-keys, strict */

'use strict';

module.exports = {
  preset: 'minna-tools',
  globalSetup: 'jest-environment-puppeteer/setup',
  globalTeardown: 'jest-environment-puppeteer/teardown',
  testEnvironment: 'jest-environment-puppeteer',
  setupFilesAfterEnv: ['expect-puppeteer'],
};
