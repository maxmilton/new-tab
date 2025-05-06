/** @type {import('stylelint').Config} */
export default {
  reportInvalidScopeDisables: true,
  reportNeedlessDisables: true,
  extends: ['stylelint-config-standard', '@maxmilton/stylelint-config'],
  ignoreFiles: ['**/*.bak/**', 'dist/**', 'node_modules/**'],
  rules: {
    'comment-empty-line-before': null,
    'import-notation': null,
  },
};
