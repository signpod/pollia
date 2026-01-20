import type { Prisma } from "@prisma/client";

const SESSION_ID_PREFIX = "pollia_session_";
const SESSION_TIMESTAMP_PREFIX = "pollia_session_ts_";
const TRACKED_ENTRY_PREFIX = "tracked_entry_";
const SESSION_TTL_MS = 30 * 60 * 1000;

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

export function getOrCreateSessionId(actionId: string): string {
  if (typeof window === "undefined") return "";

  const now = Date.now();
  const sessionKey = `${SESSION_ID_PREFIX}${actionId}`;
  const timestampKey = `${SESSION_TIMESTAMP_PREFIX}${actionId}`;

  let sessionId = localStorage.getItem(sessionKey);
  const timestampStr = localStorage.getItem(timestampKey);

  if (!sessionId || !timestampStr || now - Number(timestampStr) > SESSION_TTL_MS) {
    sessionId = crypto.randomUUID();
  }

  localStorage.setItem(sessionKey, sessionId);
  localStorage.setItem(timestampKey, String(now));

  return sessionId;
}

export function clearActionSession(actionId: string): void {
  if (typeof window === "undefined") return;

  const sessionKey = `${SESSION_ID_PREFIX}${actionId}`;
  const timestampKey = `${SESSION_TIMESTAMP_PREFIX}${actionId}`;
  const trackedKey = `${TRACKED_ENTRY_PREFIX}${actionId}`;

  localStorage.removeItem(sessionKey);
  localStorage.removeItem(timestampKey);
  sessionStorage.removeItem(trackedKey);
}

export function hasTrackedEntry(actionId: string): boolean {
  if (typeof window === "undefined") return false;

  const trackedKey = `${TRACKED_ENTRY_PREFIX}${actionId}`;
  return sessionStorage.getItem(trackedKey) !== null;
}

export function markEntryAsTracked(actionId: string): void {
  if (typeof window === "undefined") return;

  const trackedKey = `${TRACKED_ENTRY_PREFIX}${actionId}`;
  sessionStorage.setItem(trackedKey, Date.now().toString());
}

export function getUtmParams(): Record<string, string> | undefined {
  if (typeof window === "undefined") return undefined;

  const urlParams = new URLSearchParams(window.location.search);

  const utmParams = Object.fromEntries(
    UTM_KEYS.map(key => [key, urlParams.get(key)]).filter(([_, value]) => value !== null),
  ) as Record<string, string>;

  return Object.keys(utmParams).length > 0 ? utmParams : undefined;
}

type RecordActionResponseInput = Pick<
  Prisma.TrackingActionResponseUncheckedCreateInput,
  "missionId" | "sessionId" | "userId" | "actionId" | "metadata"
>;

export function sendActionResponseBeacon(data: RecordActionResponseInput): boolean {
  const url = "/api/tracking/record-action-response";
  const blob = new Blob([JSON.stringify(data)], {
    type: "application/json",
  });

  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    return navigator.sendBeacon(url, blob);
  }

  if (typeof fetch !== "undefined") {
    fetch(url, {
      method: "POST",
      body: blob,
      keepalive: true,
      headers: {
        "Content-Type": "application/json",
      },
    }).catch(err => {
      console.error("[Tracking] Fallback fetch failed:", err);
    });
    return true;
  }

  return false;
}
