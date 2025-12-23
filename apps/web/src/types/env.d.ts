declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: "development" | "production" | "test";

    NEXT_PUBLIC_APP_URL: string;

    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;

    DATABASE_URL: string;
    DIRECT_URL: string;

    CLEANUP_SECRET: string;

    ROLLBAR_SERVER_TOKEN: string;
    NEXT_PUBLIC_ROLLBAR_CLIENT_TOKEN: string;

    NEXT_PUBLIC_KAKAO_JS_KEY: string;
    KAKAO_REST_API_KEY: string;

    NEXT_PUBLIC_PRIVACY_POLICY_URL: string;

    NEXT_PUBLIC_GA_ID: string;
  }
}
