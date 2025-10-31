import { dirname, join } from "path";
import type { StorybookConfig } from "@storybook/nextjs";

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, "package.json")));
}
const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: ["@storybook/addon-docs"],
  framework: {
    name: getAbsolutePath("@storybook/nextjs"),
    options: {},
  },
  webpackFinal: async config => {
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        "@": join(__dirname, "../../web/src"),
        "@public": join(__dirname, "../../web/public"),
      };
    }

    // SVG를 React 컴포넌트로 import할 수 있도록 설정
    const fileLoaderRule = config.module?.rules?.find(rule => {
      if (typeof rule !== "object" || !rule) return false;
      if (!("test" in rule)) return false;
      return rule.test instanceof RegExp && rule.test.test(".svg");
    });

    if (fileLoaderRule && typeof fileLoaderRule === "object") {
      fileLoaderRule.exclude = /\.svg$/;
    }

    config.module?.rules?.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
};
export default config;
