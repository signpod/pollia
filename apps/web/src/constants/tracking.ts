export const TRACKING_CONFIG = {
  SESSION_ID_PREFIX: "pollia_session_",
  SESSION_TIMESTAMP_PREFIX: "pollia_session_ts_",
  TRACKED_ENTRY_PREFIX: "tracked_entry_",
  SESSION_TTL_MS: 30 * 60 * 1000,
} as const;

export const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;
