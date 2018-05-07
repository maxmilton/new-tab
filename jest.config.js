'use strict'; // eslint-disable-line

module.exports = {
  transform: {
    '^.+\\.js$': 'babel-jest',
    '^.+\\.html$': './test/svelte-jest.js',
  },
  moduleFileExtensions: [
    'js',
    'json',
    'html',
  ],
  testPathIgnorePatterns: [
    '/coverage/',
    '/dist/',
    '/node_modules/',
  ],
  collectCoverageFrom: [
    'src/**/*.{js,html}',
  ],
  coverageDirectory: '<rootDir>/test/coverage',
};
