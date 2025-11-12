import { config, parser } from "typescript-eslint";

import globals from "globals";

import vueConfig from "eslint-plugin-vue";
import baseConfig from "./eslint.base.config.js";

export default config({
  files: ["**/*.vue", "**/*.ts"],

  extends: [baseConfig, vueConfig.configs["flat/recommended"]],
  languageOptions: {
    globals: {
      ...globals.browser,
    },
    parserOptions: {
      parser: parser,
    },
  },

  rules: {
    "vue/no-undef-components": [
      "error",
      {
        ignorePatterns: [
          "Button",
          "Card",
          "Dialog",
          "Divider",
          "Select",
          "FloatLabel",
          "Fluid",
          "InputText",
          "InputSwitch",
          "InputNumber",
          "InputTextarea",
          "SelectButton",
          "Checkbox",
          "RadioButton",
          "Dropdown",
          "ProgressSpinner",
          "Toast",
          "ScrollPanel",
          "Message",
          "Column",
          "DataTable",
          "Panel",
          "RouterView",
          "RouterLink",
          "Tag",
          "Textarea",
          "DatePicker",
          "Toolbar",
          "Avatar",
          "Popover",
          "Skeleton",
        ],
      },
    ],
  },
});
