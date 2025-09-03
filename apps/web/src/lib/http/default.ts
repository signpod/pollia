import { createHttpClient } from "./client";

export const http = createHttpClient(
  {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    timeoutMs: 15000,
  },
  {
    retries: 1,
    factor: 2,
    minTimeoutMs: 300,
    maxTimeoutMs: 2000,
  }
);


