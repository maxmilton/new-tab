import js from "@eslint/js";
import mm from "@maxmilton/eslint-config";
import unicorn from "eslint-plugin-unicorn";
import ts from "typescript-eslint";

const OFF = 0;
const ERROR = 2;

export default ts.config(
  js.configs.recommended,
  ts.configs.strictTypeChecked,
  ts.configs.stylisticTypeChecked,
  unicorn.configs.recommended,
  mm.configs.recommended,
  {
    linterOptions: {
      reportUnusedDisableDirectives: ERROR,
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      /* Rules not supported in oxlint yet */
      // https://github.com/oxc-project/oxc/issues?q=%E2%98%82%EF%B8%8F

      "no-underscore-dangle": OFF, // synthetic event handler names
      quotes: [ERROR, "double", { avoidEscape: true }],

      /* Performance and byte savings */
      "@typescript-eslint/no-confusing-void-expression": OFF, // byte savings (but reduces readability)
      "@typescript-eslint/restrict-plus-operands": OFF, // byte savings (but reduces debugging ability)
      "@typescript-eslint/restrict-template-expressions": OFF, // byte savings (but reduces debugging ability)
      "prefer-template": OFF, // byte savings with same performance
      "unicorn/prefer-at": OFF, // worse performance

      /* Rules covered by oxlint */
      "@typescript-eslint/no-explicit-any": OFF,
      "@typescript-eslint/no-explicit-module-boundary-types": OFF,
      "@typescript-eslint/no-non-null-assertion": OFF,
      "@typescript-eslint/no-var-requires": OFF,
      "@typescript-eslint/prefer-string-starts-ends-with": OFF,
      "comma-dangle": OFF,
      "func-names": OFF,
      "guard-for-in": OFF,
      "no-await-in-loop": OFF,
      "no-bitwise": OFF,
      "no-console": OFF,
      "no-empty-pattern": OFF,
      "no-multi-assign": OFF,
      "no-plusplus": OFF,
      "no-var": OFF,
      "unicorn/explicit-length-check": OFF,
      "unicorn/filename-case": OFF,
      "unicorn/no-array-for-each": OFF,
      "unicorn/no-await-expression-member": OFF,
      "unicorn/no-lonely-if": "off",
      "unicorn/prefer-add-event-listener": OFF,
      "unicorn/prefer-dom-node-append": OFF,
      "unicorn/prefer-dom-node-dataset": OFF,
      "unicorn/prefer-dom-node-remove": OFF,
      "unicorn/prefer-global-this": OFF,
      "unicorn/prefer-includes": OFF,
      "unicorn/prefer-native-coercion-functions": OFF,
      "unicorn/prefer-query-selector": OFF,
      "unicorn/prefer-string-replace-all": OFF,
      "unicorn/prefer-structured-clone": OFF,
      "unicorn/switch-case-braces": OFF,
      "vars-on-top": OFF,
    },
  },
  { ignores: ["**/*.bak", "coverage", "dist"] },
);
