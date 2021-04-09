'use strict'; // eslint-disable-line

const OFF = 0;
const WARN = 1;

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    extraFileExtensions: ['.mjs', '.cjs'],
    project: './tsconfig.json',
  },
  env: {
    browser: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'airbnb-typescript/base',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  rules: {
    '@typescript-eslint/no-use-before-define': WARN,
    'import/prefer-default-export': OFF,
    // stage0 uses underscores in synthetic event handler names
    'no-underscore-dangle': OFF,
  },
};
