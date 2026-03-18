import type { ActionFormRawSnapshot } from "@/app/(site)/mission/[missionId]/manage/actions/components/ActionForm";

export { createDraftKey } from "./editorDraftKey";

export const EXISTING_ITEM_PREFIX = "existing:";
export const DRAFT_ITEM_PREFIX = "draft:";
const DEFAULT_COMPLETION_TITLE = "새 결과 화면";

export function getExistingItemKey(actionId: string) {
  return `${EXISTING_ITEM_PREFIX}${actionId}`;
}

export function getDraftItemKey(draftKey: string) {
  return `${DRAFT_ITEM_PREFIX}${draftKey}`;
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
            title: toNullableString(item.title) ?? DEFAULT_COMPLETION_TITLE,
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

export function filterByValidKeys<T>(
  prev: Record<string, T>,
  validKeys: Set<string>,
): Record<string, T> {
  let hasChange = false;
  const next: Record<string, T> = {};
  for (const [key, value] of Object.entries(prev)) {
    if (validKeys.has(key)) {
      next[key] = value;
    } else {
      hasChange = true;
    }
  }
  return hasChange ? next : prev;
}

export function deleteKeyFromRecord<T>(prev: Record<string, T>, key: string): Record<string, T> {
  if (!(key in prev)) return prev;
  const next = { ...prev };
  delete next[key];
  return next;
}

export function computeOrderedItems<T extends { key: string }>(
  items: T[],
  orderKeys: string[],
): T[] {
  if (items.length === 0) return [];

  const itemByKey = new Map(items.map(item => [item.key, item]));
  const orderedKeys: string[] = [];
  const seen = new Set<string>();

  for (const key of orderKeys) {
    if (seen.has(key) || !itemByKey.has(key)) continue;
    orderedKeys.push(key);
    seen.add(key);
  }

  for (const item of items) {
    if (seen.has(item.key)) continue;
    orderedKeys.push(item.key);
    seen.add(item.key);
  }

  return orderedKeys.flatMap(key => {
    const item = itemByKey.get(key);
    return item ? [item] : [];
  });
}

export function syncOrderKeys(prev: string[], validKeys: string[]): string[] {
  const validKeySet = new Set(validKeys);
  const next = prev.filter(key => validKeySet.has(key));

  for (const key of validKeys) {
    if (!next.includes(key)) {
      next.push(key);
    }
  }

  return areStringArraysEqual(prev, next) ? prev : next;
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
