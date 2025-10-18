import js from "@eslint/js";
import mm from "@maxmilton/eslint-config";
import unicorn from "eslint-plugin-unicorn";
import { defineConfig } from "eslint/config";
import ts from "typescript-eslint";

export default defineConfig(
  js.configs.recommended,
  ts.configs.strictTypeChecked,
  ts.configs.stylisticTypeChecked,
  // @ts-expect-error - broken upstream types
  unicorn.configs.recommended,
  mm.configs.recommended,
  {
    linterOptions: {
      reportUnusedDisableDirectives: "error",
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

      "no-underscore-dangle": "off", // synthetic event handler names

      /* Performance */
      "@typescript-eslint/no-confusing-void-expression": "off", // byte savings (but reduces readability)
      "@typescript-eslint/restrict-plus-operands": "off", // byte savings (but worse debugging)
      "@typescript-eslint/restrict-template-expressions": "off", // byte savings (but worse debugging)
      "prefer-template": "off", // byte savings with same performance
      "unicorn/no-array-sort": "off",
      "unicorn/prefer-at": "off", // worse performance

      /* Covered by oxlint */
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-explicit-module-boundary-types": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-var-requires": "off",
      "@typescript-eslint/prefer-string-starts-ends-with": "off",
      "comma-dangle": "off",
      "func-names": "off",
      "guard-for-in": "off",
      "no-await-in-loop": "off",
      "no-bitwise": "off",
      "no-console": "off",
      "no-empty-pattern": "off",
      "no-multi-assign": "off",
      "no-plusplus": "off",
      "no-var": "off",
      "unicorn/explicit-length-check": "off",
      "unicorn/filename-case": "off",
      "unicorn/no-array-for-each": "off",
      "unicorn/no-await-expression-member": "off",
      "unicorn/no-lonely-if": "off",
      "unicorn/prefer-add-event-listener": "off",
      "unicorn/prefer-dom-node-append": "off",
      "unicorn/prefer-dom-node-dataset": "off",
      "unicorn/prefer-dom-node-remove": "off",
      "unicorn/prefer-global-this": "off",
      "unicorn/prefer-includes": "off",
      "unicorn/prefer-native-coercion-functions": "off",
      "unicorn/prefer-query-selector": "off",
      "unicorn/prefer-string-replace-all": "off",
      "unicorn/prefer-structured-clone": "off",
      "unicorn/switch-case-braces": "off",
      "vars-on-top": "off",
    },
  },
  { ignores: ["**/*.bak", "coverage", "dist"] },
);
