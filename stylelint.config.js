/** @type {import("stylelint").Config} */
export default {
  reportInvalidScopeDisables: true,
  reportNeedlessDisables: true,
  reportUnscopedDisables: true,
  extends: ["stylelint-config-standard"],
  rules: {
    "comment-empty-line-before": null,
    "import-notation": null,
  },
  ignoreFiles: ["dist/*", "node_modules/**"],
};
