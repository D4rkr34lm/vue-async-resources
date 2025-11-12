import { config } from "typescript-eslint";

import eslintVueConfig from "./eslint-configs/eslint.vue.config.js";
import eslintTestConfig from "./eslint-configs/eslint.test.config.js";

export default config(eslintVueConfig, eslintTestConfig);
