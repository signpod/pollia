const SESSION_ID_KEY = "pollia_action_tracking_session_id";
const TRACKED_ENTRY_PREFIX = "tracked_entry_";

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
  const utmParams: Record<string, string> = {};

  const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];

  utmKeys.forEach(key => {
    const value = urlParams.get(key);
    if (value) {
      utmParams[key] = value;
    }
  });

  return Object.keys(utmParams).length > 0 ? utmParams : undefined;
}
