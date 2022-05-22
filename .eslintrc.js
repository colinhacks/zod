module.exports = {
  env: { browser: true, node: true },
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: [
    "@typescript-eslint",
    "import",
    "simple-import-sort",
    "unused-imports",
    "ban",
  ],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  rules: {
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
    "@typescript-eslint/no-namespace": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/ban-types": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-empty-interface": "off",
    /**
     * ESLint core rules @see https://eslint.org/docs/rules/
     */
    "no-case-declarations": "off",
    "no-empty": "off",
    "no-useless-escape": "off",
    "no-control-regex": "off",

    "ban/ban": [
      2,
      {
        name: ["Object", "keys"],
        message:
          "Object.keys() is not supported in legacy browsers, use objectKeys()",
      },
      {
        name: ["Object", "setPrototypeOf"],
        message: "Object.setPrototypeOf() is not supported in legacy browsers",
      },
      {
        name: ["Number", "isNaN"],
        message: "Number.isNaN() is not supported in legacy browsers",
      },
      {
        name: ["Number", "isInteger"],
        message: "Number.isInteger() is not supported in legacy browsers",
      },
    ],
  },
};
