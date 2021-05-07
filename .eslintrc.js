'use strict'; // eslint-disable-line

const OFF = 0;
const WARN = 1;

/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  reportUnusedDisableDirectives: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    extraFileExtensions: ['.mjs', '.cjs'],
    project: ['./tsconfig.json', './test/tsconfig.json'],
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
    'no-restricted-syntax': OFF,
    // stage1 uses underscores in synthetic event handler names
    'no-underscore-dangle': OFF,
  },
  overrides: [
    {
      files: ['.eslintrc.js'],
      parserOptions: {
        createDefaultProgram: true,
      },
    },
  ],
};
