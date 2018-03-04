// https://eslint.org/docs/user-guide/configuring

'use strict';

module.exports = {
  root: true,
  extends: [
    '@wearegenki/eslint-config/marko',
  ],
  parserOptions: {
    ecmaVersion: 9,
    sourceType: 'module',
  },
  env: {
    webextensions: true,
    es6: true,
  },
};
