import { defineConfig, globalIgnores } from "eslint/config";

import eslintJS from "@eslint/js";
import eslintTS from "typescript-eslint";
import eslintVue from "eslint-plugin-vue";
import prettierEslint from "eslint-plugin-prettier/recommended";

export default defineConfig(
  globalIgnores(["coverage", "dist", "generated", "node_modules"]),
  {
    extends: [
      eslintJS.configs.recommended,
      eslintTS.configs.strict,
      eslintVue.configs["flat/strongly-recommended"],
      prettierEslint,
    ],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],
    },

    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },
);
