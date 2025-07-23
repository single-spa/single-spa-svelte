import { defineConfig } from "eslint/config";
import babelParser from "@babel/eslint-parser";

export default defineConfig([
  {
    languageOptions: {
      parserOptions: {
        parser: babelParser,
        ecmaVersion: "latest",
      },
    },
  },
]);
