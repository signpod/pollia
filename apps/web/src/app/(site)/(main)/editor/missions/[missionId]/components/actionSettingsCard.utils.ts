import type { ActionFormRawSnapshot } from "@/app/(site)/mission/[missionId]/manage/actions/components/ActionForm";

export function createDraftKey() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `draft-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function getExistingItemKey(actionId: string) {
  return `existing:${actionId}`;
}

export function getDraftItemKey(draftKey: string) {
  return `draft:${draftKey}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function toNullableString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function parseCompletionDraftSnapshotForOptions(snapshot: unknown): {
  removedExistingIds: Set<string>;
  draftItems: Array<{ key: string; title: string }>;
  titleByItemKey: Record<string, string>;
} | null {
  if (!isRecord(snapshot)) {
    return null;
  }

  const removedExistingIds = new Set<string>(
    Array.isArray(snapshot.removedExistingIds)
      ? snapshot.removedExistingIds
          .map(id => toNullableString(id))
          .filter((id): id is string => Boolean(id))
      : [],
  );

  const draftItems = Array.isArray(snapshot.draftItems)
    ? snapshot.draftItems.flatMap(item => {
        if (!isRecord(item)) {
          return [];
        }

        const key = toNullableString(item.key);
        if (!key) {
          return [];
        }

        return [
          {
            key,
            title: toNullableString(item.title) ?? "새 결과 화면",
          },
        ];
      })
    : [];

  const titleByItemKey: Record<string, string> = {};
  if (isRecord(snapshot.formSnapshotByItemKey)) {
    for (const [itemKey, raw] of Object.entries(snapshot.formSnapshotByItemKey)) {
      if (!isRecord(raw)) {
        continue;
      }

      const title = toNullableString(raw.title);
      if (title) {
        titleByItemKey[itemKey] = title;
      }
    }
  }

  return {
    removedExistingIds,
    draftItems,
    titleByItemKey,
  };
}

export function areActionSnapshotsEqual(
  left: ActionFormRawSnapshot | undefined,
  right: ActionFormRawSnapshot,
) {
  if (!left) {
    return false;
  }

  return JSON.stringify(left) === JSON.stringify(right);
}

export function areStringArraysEqual(left: string[], right: string[]) {
  if (left.length !== right.length) {
    return false;
  }

  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) {
      return false;
    }
  }

  return true;
}
