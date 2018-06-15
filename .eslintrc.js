// https://eslint.org/docs/user-guide/configuring

'use strict';

module.exports = {
  root: true,
  extends: [
    '@minna-ui/eslint-config',
  ],
  parser: 'babel-eslint',
  parserOptions: {
    allowImportExportEverywhere: true,
  },
  env: {
    webextensions: true,
  },
};
