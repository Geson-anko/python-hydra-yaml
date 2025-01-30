import globals from "globals";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ["**/*.{js,mjs,cjs,ts}"] },
  { languageOptions: { globals: globals.browser } },
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  ...tseslint.configs.recommended,
  tseslint.config({
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  }),
];
