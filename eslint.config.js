import globals from "globals";
import pluginJs from "@eslint/js";
import { configs as wcConfigs } from 'eslint-plugin-wc';
import { configs as litConfigs } from 'eslint-plugin-lit';


export default [
  wcConfigs.recommended,
  litConfigs['flat/recommended'],
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
];
