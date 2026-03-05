export interface EditorMissionDraftPayload {
  basic?: unknown | null;
  reward?: unknown | null;
  action?: unknown | null;
  completion?: unknown | null;
  meta?: {
    updatedAtMs?: number | null;
  } | null;
}

export interface LocalEditorDraftPayload extends EditorMissionDraftPayload {}

export interface ServerEditorDraftPayload extends EditorMissionDraftPayload {}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeDraftUpdatedAtMs(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return value;
}

export function normalizeEditorMissionDraftPayload(
  value: unknown,
): EditorMissionDraftPayload | null {
  if (!isRecord(value)) {
    return null;
  }

  const rawMeta = isRecord(value.meta) ? value.meta : null;

  return {
    basic: value.basic ?? null,
    reward: value.reward ?? null,
    action: value.action ?? null,
    completion: value.completion ?? null,
    meta: {
      updatedAtMs: normalizeDraftUpdatedAtMs(rawMeta?.updatedAtMs),
    },
  };
}

export function selectLatestEditorMissionDraft(
  localDraft: EditorMissionDraftPayload | null | undefined,
  serverDraft: EditorMissionDraftPayload | null | undefined,
): EditorMissionDraftPayload | null {
  const normalizedLocal = normalizeEditorMissionDraftPayload(localDraft);
  const normalizedServer = normalizeEditorMissionDraftPayload(serverDraft);

  const localUpdatedAtMs = normalizedLocal?.meta?.updatedAtMs ?? null;
  const serverUpdatedAtMs = normalizedServer?.meta?.updatedAtMs ?? null;

  if (normalizedLocal && normalizedServer) {
    if (localUpdatedAtMs !== null && serverUpdatedAtMs !== null) {
      return localUpdatedAtMs >= serverUpdatedAtMs ? normalizedLocal : normalizedServer;
    }

    if (localUpdatedAtMs !== null) {
      return normalizedLocal;
    }

    if (serverUpdatedAtMs !== null) {
      return normalizedServer;
    }

    return normalizedServer;
  }

  if (normalizedLocal) {
    return localUpdatedAtMs !== null ? normalizedLocal : null;
  }

  if (normalizedServer) {
    return normalizedServer;
  }

  return null;
}

function sanitizeActionSnapshotForServer(value: unknown): unknown | null {
  if (!isRecord(value)) {
    return value ?? null;
  }

  return {
    draftItems: Array.isArray(value.draftItems) ? value.draftItems : [],
    itemOrderKeys: Array.isArray(value.itemOrderKeys) ? value.itemOrderKeys : [],
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

function isOmittableObjectPropertyValue(value: unknown): boolean {
  const valueType = typeof value;
  return (
    value === undefined ||
    valueType === "function" ||
    valueType === "symbol" ||
    valueType === "bigint"
  );
}

function toJsonSafeValue(value: unknown, seen: WeakSet<object> = new WeakSet()): unknown | null {
  if (value === null) {
    return null;
  }

  if (typeof value === "string" || typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (isOmittableObjectPropertyValue(value)) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString();
  }

  if (typeof value !== "object") {
    return null;
  }

  if (seen.has(value)) {
    return null;
  }
  seen.add(value);

  if (Array.isArray(value)) {
    const normalizedArray = value.map(item => toJsonSafeValue(item, seen));
    seen.delete(value);
    return normalizedArray;
  }

  const normalizedObject: Record<string, unknown> = {};
  for (const [key, entryValue] of Object.entries(value)) {
    if (isOmittableObjectPropertyValue(entryValue)) {
      continue;
    }
    normalizedObject[key] = toJsonSafeValue(entryValue, seen);
  }
  seen.delete(value);
  return normalizedObject;
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
      meta: {
        updatedAtMs: null,
      },
    };
  }

  return {
    basic: toJsonSafeValue(normalized.basic),
    reward: toJsonSafeValue(normalized.reward),
    action: toJsonSafeValue(sanitizeActionSnapshotForServer(normalized.action)),
    completion: toJsonSafeValue(sanitizeCompletionSnapshotForServer(normalized.completion)),
    meta: {
      updatedAtMs: normalizeDraftUpdatedAtMs(normalized.meta?.updatedAtMs),
    },
  };
}
