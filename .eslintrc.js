module.exports = {
  env: { browser: true, node: true },
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: [
    "@typescript-eslint",
    "import",
    "simple-import-sort",
    // 'prettier' commented as we don't want to run prettier through eslint because of performance degradation
  ],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier/@typescript-eslint", // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
  ],
  rules: {
    /**
     * eslint-plugin-import @see https://github.com/benmosher/eslint-plugin-import
     */
    "import/order": 0, // turn off in favor of eslint-plugin-simple-import-sort
    "import/no-unresolved": 0,
    "import/no-duplicates": 1,
    /**
     * eslint-plugin-simple-import-sort @see https://github.com/lydell/eslint-plugin-simple-import-sort
     */
    "sort-imports": 0, // we use eslint-plugin-import instead
    "simple-import-sort/imports": 1,
    "simple-import-sort/exports": 1,
    /**
     * @typescript-eslint/eslint-plugin @see https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin
     */
    "@typescript-eslint/no-namespace": 0,
    "@typescript-eslint/explicit-module-boundary-types": 0,
    "@typescript-eslint/no-explicit-any": 0,
    "@typescript-eslint/ban-types": 0,
    "@typescript-eslint/no-unused-vars": 0,
    "@typescript-eslint/no-empty-function": 0,
    "@typescript-eslint/ban-ts-comment": 0,
    "@typescript-eslint/no-non-null-assertion": 0,
    /**
     * ESLint core rules @see https://eslint.org/docs/rules/
     */
    "no-case-declarations": 0,
    "no-empty": 0,
  },
};
