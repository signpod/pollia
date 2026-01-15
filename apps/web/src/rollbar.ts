import Rollbar from "rollbar";

const baseConfig = {
  captureUncaught: true,
  captureUnhandledRejections: true,
  environment: process.env.NODE_ENV,
  enabled: process.env.NODE_ENV === "production",
};

export const clientConfig = {
  accessToken: process.env.NEXT_PUBLIC_ROLLBAR_CLIENT_TOKEN,
  ...baseConfig,
  payload: {
    client: {
      javascript: {
        source_map_enabled: true,
        code_version: process.env.NEXT_PUBLIC_ROLLBAR_CODE_VERSION || "unknown",
        guess_uncaught_frames: true,
      },
    },
  },
};

export const serverInstance = new Rollbar({
  accessToken: process.env.ROLLBAR_SERVER_TOKEN,
  ...baseConfig,
  codeVersion: process.env.NEXT_PUBLIC_ROLLBAR_CODE_VERSION || "unknown",
});
