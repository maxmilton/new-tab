/** @type {import("stylelint").Config} */
export default {
  reportInvalidScopeDisables: true,
  reportNeedlessDisables: true,
  reportUnscopedDisables: true,
  extends: ["stylelint-config-standard"],
  ignoreFiles: ["dist/*", "node_modules/**"],
  rules: {
    "comment-empty-line-before": null,
    "import-notation": null,
  },
};
