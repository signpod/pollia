import { atom } from "jotai";
import type { CompletionFormRawSnapshot } from "../components/CompletionForm";
import {
  type DraftCompletionRef,
  makeDraftCompletionId,
} from "../components/EditorMissionDraftContext";

export const completionDraftsAtom = atom<DraftCompletionRef[]>([]);

export const removedCompletionIdsAtom = atom<Set<string>>(new Set<string>());

export const completionDirtyByItemKeyAtom = atom<Record<string, boolean>>({});

export const completionFormSnapshotByItemKeyAtom = atom<Record<string, CompletionFormRawSnapshot>>(
  {},
);

export const completionOpenItemKeyAtom = atom<string | null>(null);

export const completionFormVersionByIdAtom = atom<Record<string, number>>({});

export const completionValidationIssueCountByItemKeyAtom = atom<Record<string, number>>({});

export const completionIsSavingAtom = atom(false);

export const completionDraftHydrationVersionAtom = atom(0);

export const completionScrollTargetItemKeyAtom = atom<string | null>(null);

export const addCompletionDraftAtom = atom(
  null,
  (get, set, { draftKey, title = "새 결과 화면" }: { draftKey: string; title?: string }) => {
    const prev = get(completionDraftsAtom);
    const nextId = makeDraftCompletionId(draftKey);
    const existing = prev.find(item => item.id === nextId);
    if (existing) {
      set(
        completionDraftsAtom,
        prev.map(item => (item.id === nextId ? { ...item, title } : item)),
      );
    } else {
      set(completionDraftsAtom, [...prev, { id: nextId, key: draftKey, title, isDraft: true }]);
    }
  },
);

export const removeCompletionDraftAtom = atom(null, (get, set, draftKey: string) => {
  const prev = get(completionDraftsAtom);
  const draftId = makeDraftCompletionId(draftKey);
  set(
    completionDraftsAtom,
    prev.filter(item => item.id !== draftId),
  );
});

export const removeCompletionDraftByIdAtom = atom(null, (get, set, draftId: string) => {
  const prev = get(completionDraftsAtom);
  set(
    completionDraftsAtom,
    prev.filter(item => item.id !== draftId),
  );
});

export const setCompletionDraftTitleAtom = atom(
  null,
  (get, set, { draftKey, title }: { draftKey: string; title: string }) => {
    const nextTitle = title.trim() || "새 결과 화면";
    const prev = get(completionDraftsAtom);
    set(
      completionDraftsAtom,
      prev.map(item => (item.key === draftKey ? { ...item, title: nextTitle } : item)),
    );
  },
);

export const clearCompletionDraftsAtom = atom(null, (_get, set) => {
  set(completionDraftsAtom, []);
});

export const markCompletionRemovedAtom = atom(null, (get, set, completionId: string) => {
  const prev = get(removedCompletionIdsAtom);
  const next = new Set(prev);
  next.add(completionId);
  set(removedCompletionIdsAtom, next);
});

export const resetCompletionAfterSaveAtom = atom(
  null,
  (
    get,
    set,
    {
      successfulItemKeys,
      successfulDraftKeys,
      successfulRemovedIds,
      successfulExistingIds,
    }: {
      successfulItemKeys: Set<string>;
      successfulDraftKeys: string[];
      successfulRemovedIds: Set<string>;
      successfulExistingIds: string[];
    },
  ) => {
    if (successfulExistingIds.length > 0 || successfulRemovedIds.size > 0) {
      set(completionFormVersionByIdAtom, prev => {
        const next = { ...prev };
        for (const completionId of successfulExistingIds) {
          next[completionId] = (next[completionId] ?? 0) + 1;
        }
        for (const completionId of successfulRemovedIds) {
          delete next[completionId];
        }
        return next;
      });
    }

    if (successfulItemKeys.size > 0) {
      set(completionDirtyByItemKeyAtom, prev => {
        const next = { ...prev };
        for (const key of successfulItemKeys) {
          delete next[key];
        }
        return next;
      });
      set(completionValidationIssueCountByItemKeyAtom, prev => {
        const next = { ...prev };
        for (const key of successfulItemKeys) {
          delete next[key];
        }
        return next;
      });
      set(completionFormSnapshotByItemKeyAtom, prev => {
        const next = { ...prev };
        for (const key of successfulItemKeys) {
          delete next[key];
        }
        return next;
      });
    }

    if (successfulDraftKeys.length > 0) {
      set(completionDraftsAtom, prev =>
        prev.filter(item => !successfulDraftKeys.includes(item.key)),
      );
    }

    if (successfulRemovedIds.size > 0) {
      const current = get(removedCompletionIdsAtom);
      const next = new Set<string>(current);
      for (const id of successfulRemovedIds) {
        next.delete(id);
      }
      set(removedCompletionIdsAtom, next);
    }
  },
);
