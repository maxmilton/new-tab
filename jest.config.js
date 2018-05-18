// https://facebook.github.io/jest/docs/en/configuration.html

'use strict';

module.exports = {
  preset: '@minna-ui/jest-config',
  setupFiles: ['<rootDir>/test/__setup__.js'],
  collectCoverageFrom: [
    'src/**/*.{js,html}',
    '!src/app.js',
    '!src/settings.js',
    '!src/template.html',
  ],
  coverageDirectory: '<rootDir>/test/coverage',
};
