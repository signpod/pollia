import type { ActionFormRawSnapshot } from "@/app/(site)/mission/[missionId]/manage/actions/components/ActionForm";
import { ActionType } from "@prisma/client";
import { atom } from "jotai";
import type { DraftActionItem } from "../../../missions/[missionId]/components/actionSettingsCard.types";

export const quizActionDraftItemsAtom = atom<DraftActionItem[]>([]);

export const quizActionItemOrderKeysAtom = atom<string[]>([]);

export const quizActionOpenItemKeyAtom = atom<string | null>(null);

export const quizActionIsApplyingAtom = atom(false);

export const quizActionDirtyByItemKeyAtom = atom<Record<string, boolean>>({});

export const quizActionFormVersionByIdAtom = atom<Record<string, number>>({});

export const quizActionTypeByItemKeyAtom = atom<Record<string, ActionType>>({});

export const quizActionFormSnapshotByItemKeyAtom = atom<Record<string, ActionFormRawSnapshot>>({});

export const quizActionValidationIssueCountByItemKeyAtom = atom<Record<string, number>>({});

export const quizActionDraftHydrationVersionAtom = atom(0);

export const quizActionScrollTargetItemKeyAtom = atom<string | null>(null);

export const quizDraftVersionAtom = atom(0);

export const quizRemovedActionIdsAtom = atom<Set<string>>(new Set<string>());

export const quizMarkActionRemovedAtom = atom(null, (get, set, actionId: string) => {
  const prev = get(quizRemovedActionIdsAtom);
  const next = new Set(prev);
  next.add(actionId);
  set(quizRemovedActionIdsAtom, next);
});

export const quizResetActionAfterSaveAtom = atom(
  null,
  (get, set, successfulRemovedIds: Set<string>) => {
    if (successfulRemovedIds.size === 0) return;

    set(quizActionFormVersionByIdAtom, prev => {
      const next = { ...prev };
      for (const actionId of successfulRemovedIds) {
        delete next[actionId];
      }
      return next;
    });

    const current = get(quizRemovedActionIdsAtom);
    const next = new Set<string>(current);
    for (const id of successfulRemovedIds) {
      next.delete(id);
    }
    set(quizRemovedActionIdsAtom, next);
  },
);
