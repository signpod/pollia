import type { ActionFormRawSnapshot } from "@/app/(site)/mission/[missionId]/manage/actions/components/ActionForm";
import { ActionType } from "@prisma/client";
import { atom } from "jotai";
import type { DraftActionItem } from "../components/actionSettingsCard.types";

export const actionDraftItemsAtom = atom<DraftActionItem[]>([]);

export const actionItemOrderKeysAtom = atom<string[]>([]);

export const actionOpenItemKeyAtom = atom<string | null>(null);

export const actionIsApplyingAtom = atom(false);

export const actionDirtyByItemKeyAtom = atom<Record<string, boolean>>({});

export const actionFormVersionByIdAtom = atom<Record<string, number>>({});

export const actionTypeByItemKeyAtom = atom<Record<string, ActionType>>({});

export const actionFormSnapshotByItemKeyAtom = atom<Record<string, ActionFormRawSnapshot>>({});

export const actionValidationIssueCountByItemKeyAtom = atom<Record<string, number>>({});

export const actionDraftHydrationVersionAtom = atom(0);

export const actionIsFlowDialogOpenAtom = atom(false);

export const cleanupDeletedActionRefsAtom = atom(
  null,
  (get, set, { itemKey, deletedActionId }: { itemKey: string; deletedActionId: string }) => {
    const prev = get(actionFormSnapshotByItemKeyAtom);
    let hasReferenceChange = false;
    const next: Record<string, ActionFormRawSnapshot> = {};

    for (const [key, snapshot] of Object.entries(prev)) {
      if (key === itemKey) continue;
      const vals = snapshot.values;
      const nextActionIdMatch = vals.nextActionId === deletedActionId;
      const optionsMatch = vals.options?.some(o => o.nextActionId === deletedActionId);

      if (!nextActionIdMatch && !optionsMatch) {
        next[key] = snapshot;
        continue;
      }

      hasReferenceChange = true;
      next[key] = {
        ...snapshot,
        values: {
          ...vals,
          nextActionId: nextActionIdMatch ? null : vals.nextActionId,
          options: vals.options?.map(o =>
            o.nextActionId === deletedActionId ? { ...o, nextActionId: null } : o,
          ),
        },
      };
    }

    set(actionFormSnapshotByItemKeyAtom, next);
    if (hasReferenceChange) {
      set(actionDraftHydrationVersionAtom, v => v + 1);
    }
  },
);

export const cleanupDeletedCompletionRefsAtom = atom(
  null,
  (get, set, deletedCompletionId: string) => {
    const prev = get(actionFormSnapshotByItemKeyAtom);
    let hasReferenceChange = false;
    const next: Record<string, ActionFormRawSnapshot> = {};

    for (const [key, snapshot] of Object.entries(prev)) {
      const vals = snapshot.values;
      const topMatch = vals.nextCompletionId === deletedCompletionId;
      const optionsMatch = vals.options?.some(o => o.nextCompletionId === deletedCompletionId);

      if (!topMatch && !optionsMatch) {
        next[key] = snapshot;
        continue;
      }

      hasReferenceChange = true;
      next[key] = {
        ...snapshot,
        values: {
          ...vals,
          nextCompletionId: topMatch ? null : vals.nextCompletionId,
          options: vals.options?.map(o =>
            o.nextCompletionId === deletedCompletionId ? { ...o, nextCompletionId: null } : o,
          ),
        },
      };
    }

    set(actionFormSnapshotByItemKeyAtom, next);
    if (hasReferenceChange) {
      set(actionDraftHydrationVersionAtom, v => v + 1);
    }
  },
);

export const actionScrollTargetItemKeyAtom = atom<string | null>(null);

export const removedActionIdsAtom = atom<Set<string>>(new Set<string>());

export const markActionRemovedAtom = atom(null, (get, set, actionId: string) => {
  const prev = get(removedActionIdsAtom);
  const next = new Set(prev);
  next.add(actionId);
  set(removedActionIdsAtom, next);
});

export const resetActionAfterSaveAtom = atom(
  null,
  (get, set, successfulRemovedIds: Set<string>) => {
    if (successfulRemovedIds.size === 0) return;

    set(actionFormVersionByIdAtom, prev => {
      const next = { ...prev };
      for (const actionId of successfulRemovedIds) {
        delete next[actionId];
      }
      return next;
    });

    const current = get(removedActionIdsAtom);
    const next = new Set<string>(current);
    for (const id of successfulRemovedIds) {
      next.delete(id);
    }
    set(removedActionIdsAtom, next);
  },
);
