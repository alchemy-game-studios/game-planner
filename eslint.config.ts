import globals from "globals";
import pluginJs from "@eslint/js"
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";
import tseslint from 'typescript-eslint';

import { fixupConfigRules } from "@eslint/compat";

export default [
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...fixupConfigRules(pluginReactConfig)
];
