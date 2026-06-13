import js from "@eslint/js";
import globals from "globals";
import unusedImports from "eslint-plugin-unused-imports";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ignores: ["tests/**"],
  },
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: {
      js,
      "unused-imports": unusedImports,
    },
    extends: ["js/recommended"],
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error",
      "prefer-const": "warn",
      ""
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": "warn",
    },
    languageOptions: {
      ecmaVersion: "latest",
      globals: { ...globals.browser, ...globals.node },
    },
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "module",
    },
  },
]);