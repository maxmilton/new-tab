import js from "@eslint/js";
import mm from "@maxmilton/eslint-config";
import { defineConfig } from "eslint/config";
import oxlint from "eslint-plugin-oxlint";
import unicorn from "eslint-plugin-unicorn";
import ts from "typescript-eslint";

export default defineConfig(
  js.configs.recommended,
  ts.configs.strictTypeChecked,
  ts.configs.stylisticTypeChecked,
  unicorn.configs.recommended,
  mm.configs.recommended,
  ...oxlint.buildFromOxlintConfigFile(".oxlintrc.json"),
  {
    linterOptions: {
      reportUnusedDisableDirectives: "error",
      reportUnusedInlineConfigs: "error",
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      /* Rules not supported in oxlint yet */
      // https://github.com/oxc-project/oxc/issues/481
      // https://github.com/oxc-project/oxc/issues?q=%E2%98%82%EF%B8%8F

      "no-underscore-dangle": "off", // synthetic event handler names
      "unicorn/import-style": "off",

      /* Performance */
      "@typescript-eslint/no-confusing-void-expression": "off", // byte savings (but reduces readability)
      "@typescript-eslint/restrict-plus-operands": "off", // byte savings (but harder to debug)
      "@typescript-eslint/restrict-template-expressions": "off", // byte savings (but harder to debug)

      // TODO: Remove these once buildFromOxlintConfigFile correctly disables them.
      "@typescript-eslint/naming-convention": "off",
      "@typescript-eslint/prefer-string-starts-ends-with": "off",
      "unicorn/explicit-length-check": "off",
      "unicorn/no-array-for-each": "off",
      "unicorn/no-array-sort": "off",
      "unicorn/no-await-expression-member": "off",
      "unicorn/prefer-add-event-listener": "off",
      "unicorn/prefer-dom-node-append": "off",
      "unicorn/prefer-global-this": "off",
    },
  },
  { ignores: ["dist"] },
);
