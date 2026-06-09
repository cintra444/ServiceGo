module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "react", "react-hooks"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
  ],
  env: {
    es2022: true,
    node: true,
  },
  settings: {
    react: {
      version: "detect",
    },
  },
  ignorePatterns: ["android/**", "node_modules/**"],
  overrides: [
    {
      files: ["*.config.js", ".eslintrc.js", "babel.config.js", "metro.config.js"],
      rules: {
        "@typescript-eslint/no-require-imports": "off",
      },
    },
  ],
  rules: {
    "react/react-in-jsx-scope": "off",
    "@typescript-eslint/no-shadow": "error",
  },
};
