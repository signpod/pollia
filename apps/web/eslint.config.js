import { nextJsConfig } from "@repo/eslint-config/next-js";
import { fileURLToPath } from "url";
import path from "path";

/** @type {import("eslint").Linter.Config} */
const tsconfigRoot = path.dirname(fileURLToPath(import.meta.url));

export default [
  ...nextJsConfig,
  {
    languageOptions: {
      parserOptions: {
        // JSX/TSX를 올바른 tsconfig로 파싱하도록 프로젝트 지정
        project: [
          "./tsconfig.json",
        ],
        tsconfigRootDir: tsconfigRoot,
        ecmaFeatures: { jsx: true },
      },
    },
  },
];
