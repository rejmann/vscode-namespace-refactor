import eslintJS from '@eslint/js';
import tsParser from "@typescript-eslint/parser";
import typescriptEslint from "@typescript-eslint/eslint-plugin";

export default [
  eslintJS.configs.recommended,
  {
    files: ["**/*.ts"],
  },
  {
    plugins: {
      "@typescript-eslint": typescriptEslint,
      "@typescript-eslint/parser": tsParser,
    },

    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        Buffer: "readonly",
        suite: "readonly",
        test: "readonly",
      },
    },

    rules: {
      "@typescript-eslint/naming-convention": ["warn", {
        selector: "import",
        format: ["camelCase", "PascalCase"],
      }],

      curly: "warn",
      eqeqeq: "warn",
      "no-throw-literal": "warn",
      semi: "warn",

      "@typescript-eslint/no-explicit-any": "off",
      "no-warning-comments": "error",
      "no-console": ["error", { "allow": ["debug", "error"] }],
      "no-unused-vars": "off",
      "sort-imports": [
        "error",
        {
          "ignoreCase": true,
          "ignoreDeclarationSort": false,
          "ignoreMemberSort": false,
          "memberSyntaxSortOrder": [
            "none",
            "all",
            "multiple",
            "single"
          ],
          "allowSeparatedGroups": false
        },
      ],
    },
  },
];
