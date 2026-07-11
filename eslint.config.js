import js from "@eslint/js";
import mm from "@maxmilton/eslint-config";
import oxlint from "eslint-plugin-oxlint";
import unicorn from "eslint-plugin-unicorn";
import { defineConfig } from "eslint/config";
import ts from "typescript-eslint";

export default defineConfig(
  js.configs.recommended,
  ts.configs.strictTypeChecked,
  ts.configs.stylisticTypeChecked,
  unicorn.configs.recommended,
  mm.configs.recommended,
  ...oxlint.buildFromOxlintConfigFile(".oxlintrc.jsonc"),
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

      "unicorn/import-style": "off",
      "unicorn/no-top-level-assignment-in-function": "off", // used carefully
      "unicorn/single-line-block-comment-style": "off",

      // TODO: Remove these once buildFromOxlintConfigFile correctly disables them.
      "@typescript-eslint/naming-convention": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",
      "consistent-return": "off",
      "global-require": "off",
      "unicorn/explicit-length-check": "off",
      "unicorn/no-array-sort": "off",
      "unicorn/no-await-expression-member": "off",
      "unicorn/no-for-each": "off",
      "unicorn/prefer-add-event-listener": "off",
      "unicorn/prefer-dom-node-append": "off",
      "unicorn/prefer-global-this": "off",
    },
  },
  {
    files: ["test/**"],
    rules: {
      "unicorn/no-global-object-property-assignment": "off",
    },
  },
  { ignores: ["dist"] },
);
