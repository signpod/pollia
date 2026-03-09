const DRAFT_KEY_FALLBACK_PREFIX = "draft-";

export function createDraftKey() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${DRAFT_KEY_FALLBACK_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
