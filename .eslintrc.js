// https://eslint.org/docs/user-guide/configuring

'use strict';

module.exports = {
  root: true,
  extends: [
    '@wearegenki/eslint-config',
  ],
  // parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 9,
    sourceType: 'module',
  },
  env: {
    browser: true,
    es6: true,
    webextensions: true,
  },
};
