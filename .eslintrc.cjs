'use strict'; // eslint-disable-line

const OFF = 0;
const WARN = 1;
const ERROR = 2;

/** @type {import('eslint/lib/shared/types').ConfigData & { parserOptions: import('@typescript-eslint/types').ParserOptions }} */
module.exports = {
  root: true,
  reportUnusedDisableDirectives: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['tsconfig.json', 'tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
  extends: [
    'eslint:recommended',
    'airbnb-base',
    'airbnb-typescript/base',
    'plugin:@typescript-eslint/strict-type-checked',
    'plugin:@typescript-eslint/stylistic-type-checked',
    'plugin:unicorn/recommended',
    'prettier',
  ],
  plugins: ['prettier'],
  rules: {
    '@typescript-eslint/explicit-module-boundary-types': ERROR,
    // TODO: Would prefer a warning rather than disabling this but auto-fix is
    // undesirable (adds unnecessary braces leading to byte bloat).
    // '@typescript-eslint/no-confusing-void-expression': WARN,
    '@typescript-eslint/no-non-null-assertion': WARN,
    '@typescript-eslint/no-use-before-define': WARN,
    'import/order': OFF, // broken with prettier
    'import/prefer-default-export': OFF,
    'no-restricted-syntax': OFF,
    'no-void': OFF,
    'prettier/prettier': WARN,
    'unicorn/filename-case': OFF,
    'unicorn/no-abusive-eslint-disable': WARN,
    'unicorn/no-null': OFF,
    'unicorn/prefer-module': WARN,
    'unicorn/prefer-top-level-await': WARN,
    'unicorn/prevent-abbreviations': OFF,

    /* Performance and byte savings */
    // byte savings
    '@typescript-eslint/no-confusing-void-expression': OFF,
    // alternatives offer byte savings
    '@typescript-eslint/prefer-string-starts-ends-with': OFF,
    // byte savings with same performance
    'prefer-template': OFF,
    // byte savings
    'no-plusplus': OFF,
    // byte savings + faster
    'unicorn/explicit-length-check': OFF,
    'unicorn/no-array-callback-reference': OFF,
    // forEach is often faster (in Chrome and Firefox but not Safari)
    'unicorn/no-array-for-each': OFF,
    'unicorn/no-await-expression-member': OFF,
    // indexOf is faster (in Chrome)
    'unicorn/prefer-includes': OFF,
    // saves 3 bytes to use arrow function
    'unicorn/prefer-native-coercion-functions': OFF,
    // byte savings (minification doesn't currently automatically remove)
    'unicorn/switch-case-braces': [ERROR, 'avoid'],

    /* stage1 */
    '@typescript-eslint/consistent-type-definitions': OFF, // FIXME: Issue with stage1 collect Refs
    // underscores in synthetic event handler names
    'no-underscore-dangle': OFF,
    'unicorn/prefer-add-event-listener': OFF,
    'unicorn/prefer-dom-node-append': OFF,
    'unicorn/prefer-query-selector': OFF,
  },
  overrides: [
    {
      files: ['*.spec.ts', '*.test.ts', 'build.ts', '*.config.ts', '*.d.ts'],
      rules: {
        'import/no-extraneous-dependencies': OFF,
      },
    },
  ],
};
