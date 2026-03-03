export interface EditorMissionDraftPayload {
  basic?: unknown | null;
  reward?: unknown | null;
  action?: unknown | null;
  completion?: unknown | null;
}

export interface LocalEditorDraftPayload extends EditorMissionDraftPayload {}

export interface ServerEditorDraftPayload extends EditorMissionDraftPayload {}

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

function sanitizeActionSnapshotForServer(value: unknown): unknown | null {
  if (!isRecord(value)) {
    return value ?? null;
  }

  return {
    draftItems: Array.isArray(value.draftItems) ? value.draftItems : [],
    actionTypeByItemKey: isRecord(value.actionTypeByItemKey) ? value.actionTypeByItemKey : {},
    formSnapshotByItemKey: isRecord(value.formSnapshotByItemKey) ? value.formSnapshotByItemKey : {},
  };
}

function sanitizeCompletionSnapshotForServer(value: unknown): unknown | null {
  if (!isRecord(value)) {
    return value ?? null;
  }

  return {
    draftItems: Array.isArray(value.draftItems) ? value.draftItems : [],
    formSnapshotByItemKey: isRecord(value.formSnapshotByItemKey) ? value.formSnapshotByItemKey : {},
  };
}

export function toServerEditorDraftPayload(
  payload: EditorMissionDraftPayload | null | undefined,
): ServerEditorDraftPayload {
  const normalized = normalizeEditorMissionDraftPayload(payload);
  if (!normalized) {
    return {
      basic: null,
      reward: null,
      action: null,
      completion: null,
    };
  }

  return {
    basic: normalized.basic ?? null,
    reward: normalized.reward ?? null,
    action: sanitizeActionSnapshotForServer(normalized.action),
    completion: sanitizeCompletionSnapshotForServer(normalized.completion),
  };
}
