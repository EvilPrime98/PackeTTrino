import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ignores: ["tests/**"],
  },
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended"],
    rules: {
      'no-unused-vars': 'off',
      'no-undef': 'off',
      'prefer-const': 'warn',
    },
    languageOptions: {
      ecmaVersion: "latest",
      globals: { ...globals.browser, ...globals.node },
    }
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
    }
  },
]);