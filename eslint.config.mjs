import reactHooks from "eslint-plugin-react-hooks";

export default [
  {
    ignores: [".next/**", "node_modules/**", "database/**", "public/**", "scripts/**", ".agents/**"]
  },
  {
    files: ["src/**/*.{js,jsx,mjs}"],
    plugins: {
      "react-hooks": reactHooks
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    rules: {
      "no-unused-vars": "off",
      "no-undef": "off",
      "react-hooks/exhaustive-deps": "warn"
    }
  }
];
