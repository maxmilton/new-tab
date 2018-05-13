// https://facebook.github.io/jest/docs/en/configuration.html

'use strict'; // eslint-disable-line

module.exports = {
  preset: '@minna-ui/jest-config',
  collectCoverageFrom: [
    'src/**/*.{js,html}',
  ],
  coverageDirectory: '<rootDir>/test/coverage',
};
