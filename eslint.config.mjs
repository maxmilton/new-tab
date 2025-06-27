import eslint from '@eslint/js';
import mm from '@maxmilton/eslint-config';
import unicorn from 'eslint-plugin-unicorn';
import ts from 'typescript-eslint';

const OFF = 0;
const ERROR = 2;

export default ts.config(
  eslint.configs.recommended,
  ...ts.configs.strictTypeChecked,
  ...ts.configs.stylisticTypeChecked,
  unicorn.configs.recommended,
  mm.configs.recommended,
  {
    linterOptions: {
      reportUnusedDisableDirectives: ERROR,
    },
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ['*.mjs'],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      /* Rules not supported in oxlint yet */
      // eslint: https://github.com/oxc-project/oxc/issues/479
      // typescript-eslint: https://github.com/oxc-project/oxc/issues/2180
      // eslint-plugin-import: https://github.com/oxc-project/oxc/issues/1117
      // eslint-plugin-promise: https://github.com/oxc-project/oxc/issues/4655
      // eslint-plugin-unicorn: https://github.com/oxc-project/oxc/issues/684
      // eslint-plugin-jsdoc: https://github.com/oxc-project/oxc/issues/1170
      // eslint-plugin-n: https://github.com/oxc-project/oxc/issues/493

      // Bad browser support
      'unicorn/prefer-at': OFF,

      /* Performance and byte savings */
      // byte savings at the cost of readability
      '@typescript-eslint/no-confusing-void-expression': OFF,
      // alternatives offer byte savings and better performance
      '@typescript-eslint/prefer-string-starts-ends-with': OFF, // oxlint only has unicorn/prefer-string-starts-ends-with
      // byte savings (but reduces debugging ability)
      '@typescript-eslint/restrict-plus-operands': OFF,
      // byte savings (but reduces debugging ability)
      '@typescript-eslint/restrict-template-expressions': OFF,
      // byte savings with same performance
      'prefer-template': OFF,
      // byte savings
      'unicorn/no-array-callback-reference': OFF,

      /* stage1 */
      // underscores in synthetic event handler names
      'no-underscore-dangle': OFF,

      /* Rules covered by oxlint */
      '@typescript-eslint/no-explicit-any': OFF,
      '@typescript-eslint/no-non-null-assertion': OFF,
      '@typescript-eslint/no-var-requires': OFF,
      'func-names': OFF,
      'guard-for-in': OFF,
      'no-await-in-loop': OFF,
      'no-bitwise': OFF,
      'no-console': OFF,
      'no-empty-pattern': OFF,
      'no-multi-assign': OFF,
      'no-plusplus': OFF,
      // 'no-return-assign': OFF, // currently broken in oxlint
      'no-var': OFF,
      'unicorn/explicit-length-check': OFF,
      'unicorn/no-array-for-each': OFF,
      'unicorn/no-await-expression-member': OFF,
      'unicorn/no-lonely-if': 'off',
      'unicorn/prefer-add-event-listener': OFF,
      'unicorn/prefer-dom-node-append': OFF,
      'unicorn/prefer-dom-node-dataset': OFF,
      'unicorn/prefer-dom-node-remove': OFF,
      'unicorn/prefer-global-this': OFF,
      'unicorn/prefer-includes': OFF,
      'unicorn/prefer-native-coercion-functions': OFF,
      'unicorn/prefer-query-selector': OFF,
      'unicorn/prefer-string-replace-all': OFF,
      'unicorn/prefer-structured-clone': OFF,
      'unicorn/switch-case-braces': OFF,
      'vars-on-top': OFF,
    },
  },
  { ignores: ['**/*.bak', 'coverage', 'dist'] },
);
