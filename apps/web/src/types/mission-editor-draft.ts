export interface EditorMissionDraftPayload {
  basic?: unknown | null;
  reward?: unknown | null;
  action?: unknown | null;
  completion?: unknown | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function normalizeEditorMissionDraftPayload(
  value: unknown,
): EditorMissionDraftPayload | null {
  if (!isRecord(value)) {
    return null;
  }

  return {
    basic: value.basic ?? null,
    reward: value.reward ?? null,
    action: value.action ?? null,
    completion: value.completion ?? null,
  };
}
