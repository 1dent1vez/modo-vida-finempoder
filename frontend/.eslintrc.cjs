module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: { ecmaVersion: "latest", sourceType: "module" },
  settings: { react: { version: "detect" } },
  env: { browser: true, es2022: true, node: true },
  plugins: ["react", "react-hooks", "@typescript-eslint", "import", "jsx-a11y", "prettier"],
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:prettier/recommended"
  ],
  rules: {
    "prettier/prettier": "warn",
    "react/react-in-jsx-scope": "off",
    "import/order": ["warn", { "alphabetize": { "order": "asc", "caseInsensitive": true }, "newlines-between": "always" }]
  }
};
