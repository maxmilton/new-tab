import { fixupPluginRules } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import eslint from '@eslint/js';
import unicorn from 'eslint-plugin-unicorn';
// eslint-disable-next-line import/no-unresolved
import tseslint from 'typescript-eslint';

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

const OFF = 0;
const WARN = 1;
const ERROR = 2;

export default tseslint.config(
  eslint.configs.recommended,
  ...compat.extends('airbnb-base').map((config) => ({
    ...config,
    plugins: {}, // delete
  })),
  ...compat.extends('airbnb-typescript/base'),
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  // @ts-expect-error - no types
  // eslint-disable-next-line
  unicorn.configs['flat/recommended'],
  {
    linterOptions: {
      reportUnusedDisableDirectives: WARN,
    },
    languageOptions: {
      parserOptions: {
        project: ['tsconfig.json', 'tsconfig.node.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    // settings: {
    //   'import/resolver': {
    //     typescript: {
    //       alwaysTryTypes: true,
    //       project: ['tsconfig.json', 'tsconfig.node.json'],
    //       // project: true,
    //     },
    //   },
    // },
    plugins: {
      import: fixupPluginRules(
        compat.plugins('eslint-plugin-import')[0].plugins?.import ?? {},
      ),
    },
    rules: {
      '@typescript-eslint/explicit-module-boundary-types': ERROR,
      '@typescript-eslint/no-confusing-void-expression': WARN,
      '@typescript-eslint/no-non-null-assertion': WARN,
      '@typescript-eslint/no-use-before-define': WARN,
      'import/prefer-default-export': OFF,
      'no-restricted-syntax': OFF,
      'no-void': OFF,
      'unicorn/filename-case': OFF,
      'unicorn/import-style': WARN,
      'unicorn/no-abusive-eslint-disable': WARN,
      'unicorn/no-null': OFF,
      'unicorn/prefer-module': WARN,
      'unicorn/prefer-top-level-await': WARN,
      'unicorn/prevent-abbreviations': OFF,

      /* Covered by biome formatter */
      '@typescript-eslint/indent': OFF,
      'function-paren-newline': OFF,
      'implicit-arrow-linebreak': OFF,
      'max-len': OFF,
      'object-curly-newline': OFF,
      'operator-linebreak': OFF,
      'unicorn/no-nested-ternary': OFF,

      /* Performance and byte savings */
      // alternatives offer byte savings and better performance
      '@typescript-eslint/prefer-string-starts-ends-with': OFF,
      // byte savings (but reduces debugging ability)
      '@typescript-eslint/restrict-plus-operands': OFF,
      // byte savings (but reduces debugging ability)
      '@typescript-eslint/restrict-template-expressions': OFF,
      // byte savings with same performance
      'prefer-template': OFF,
      // byte savings
      'no-plusplus': OFF,
      // byte savings + faster
      'unicorn/explicit-length-check': OFF,
      'unicorn/no-array-callback-reference': OFF,
      // forEach is slower but more compact (for non-performance-critical code)
      'unicorn/no-array-for-each': OFF,
      'unicorn/no-await-expression-member': OFF,
      // indexOf is faster (in Chrome)
      'unicorn/prefer-includes': OFF,
      // saves 3 bytes to use arrow function
      'unicorn/prefer-native-coercion-functions': OFF,
      // byte savings (minification doesn't currently automatically remove)
      'unicorn/switch-case-braces': [ERROR, 'avoid'],

      /* stage1 */
      // underscores in synthetic event handler names
      'no-underscore-dangle': OFF,
      'unicorn/prefer-add-event-listener': OFF,
      'unicorn/prefer-dom-node-append': OFF,
      'unicorn/prefer-query-selector': OFF,
    },
  },
  {
    files: [
      '*.config.mjs',
      '*.config.ts',
      '*.d.ts',
      '**/*.spec.ts',
      '**/*.test.ts',
      'build.ts',
      'test/**',
    ],
    rules: {
      'import/no-extraneous-dependencies': OFF,
    },
  },
  {
    ignores: ['**/*.bak', 'dist/**'],
  },
);
