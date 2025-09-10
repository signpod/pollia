import { nextJsConfig } from "@repo/eslint-config/next-js";
import { fileURLToPath } from "url";
import path from "path";

/** @type {import("eslint").Linter.Config} */
const tsconfigRoot = path.dirname(fileURLToPath(import.meta.url));

export default [
  ...nextJsConfig,
  // 빌드 산출물 및 구성 파일은 린트 대상에서 제외
  {
    ignores: [
      "**/.next/**",
      "**/storybook-static/**",
      "**/dist/**",
      "**/eslint.config.js",
      "**/postcss.config.js",
      "**/next.config.js",
    ],
  },
  // TS/TSX 파일에만 프로젝트 기반 타입체크 적용
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.json"],
        tsconfigRootDir: tsconfigRoot,
        ecmaFeatures: { jsx: true },
      },
    },
  },
];
