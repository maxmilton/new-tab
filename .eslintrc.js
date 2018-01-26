// https://eslint.org/docs/user-guide/configuring

'use strict';

module.exports = {
  root: true,
  extends: [
    '@wearegenki/eslint-config',
  ],
  parserOptions: {
    ecmaVersion: 8,
    sourceType: 'module',
    ecmaFeatures: {
      experimentalObjectRestSpread: true,
    },
  },
  env: {
    webextensions: true,
    es6: true,
    browser: true,
  },
};
