import type { Prisma } from "@prisma/client";

const SESSION_ID_KEY = "pollia_action_tracking_session_id";
const TRACKED_ENTRY_PREFIX = "tracked_entry_";

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";

  let sessionId = localStorage.getItem(SESSION_ID_KEY);

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }

  return sessionId;
}

export function hasTrackedEntry(sessionId: string, actionId: string): boolean {
  if (typeof window === "undefined") return false;

  const trackedKey = `${TRACKED_ENTRY_PREFIX}${sessionId}_${actionId}`;
  return sessionStorage.getItem(trackedKey) !== null;
}

export function markEntryAsTracked(sessionId: string, actionId: string): void {
  if (typeof window === "undefined") return;

  const trackedKey = `${TRACKED_ENTRY_PREFIX}${sessionId}_${actionId}`;
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
