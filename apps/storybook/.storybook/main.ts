import { dirname, join, resolve } from "node:path";
import type { StorybookConfig } from "@storybook/nextjs";
import { config as dotenvConfig } from "dotenv";
import webpack from "webpack";

dotenvConfig({ path: resolve(__dirname, "../../web/.env.local") });

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
        "server-only": false,
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

    // node:crypto를 crypto-browserify로 폴리필
    config.resolve = {
      ...config.resolve,
      fallback: {
        ...config.resolve?.fallback,
        crypto: require.resolve("crypto-browserify"),
        stream: false,
        buffer: false,
      },
    };

    config.plugins = [
      ...(config.plugins || []),
      new webpack.NormalModuleReplacementPlugin(/^node:crypto$/, "crypto-browserify"),
      new webpack.EnvironmentPlugin({
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
          process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
        SUPABASE_SERVICE_SECRET_KEY: process.env.SUPABASE_SERVICE_SECRET_KEY ?? "",
      }),
    ];

    return config;
  },
};
export default config;
