import Rollbar from "rollbar";

// Vercel은 VERCEL_GIT_COMMIT_SHA를 자동 제공
const codeVersion =
  process.env.NEXT_PUBLIC_ROLLBAR_CODE_VERSION || process.env.VERCEL_GIT_COMMIT_SHA || "unknown";

const isProduction = process.env.NODE_ENV === "production";
const isProductionDeployment = process.env.VERCEL_ENV === "production";

const getProductionHostname = (): string | null => {
  const url = process.env.NEXT_PUBLIC_APP_URL;
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
};

const productionHostname = getProductionHostname();

const isClientProductionDeployment =
  process.env.NEXT_PUBLIC_VERCEL_ENV === "production";

const baseConfig = {
  captureUncaught: true,
  captureUnhandledRejections: true,
  environment: process.env.NODE_ENV,
};

export const clientConfig = {
  accessToken: process.env.NEXT_PUBLIC_ROLLBAR_CLIENT_TOKEN,
  ...baseConfig,
  enabled: isProduction && isClientProductionDeployment,
  payload: {
    server: {
      root: "webpack:///./",
    },
    client: {
      javascript: {
        source_map_enabled: true,
        code_version: codeVersion,
        guess_uncaught_frames: true,
      },
    },
  },
};

export const serverInstance = new Rollbar({
  accessToken: process.env.ROLLBAR_SERVER_TOKEN,
  ...baseConfig,
  enabled: isProduction && isProductionDeployment,
  codeVersion,
});
