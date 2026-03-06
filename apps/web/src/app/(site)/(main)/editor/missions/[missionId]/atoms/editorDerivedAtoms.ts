import type { MissionCompletionWithMission } from "@/types/dto";
import { atom } from "jotai";
import { makeDraftCompletionId } from "../components/EditorMissionDraftContext";
import { getCompletionDraftItemKey } from "../components/EditorMissionDraftContext";
import {
  completionDraftsAtom,
  completionFormSnapshotByItemKeyAtom,
  removedCompletionIdsAtom,
} from "./editorCompletionAtoms";

export const serverCompletionsAtom = atom<MissionCompletionWithMission[]>([]);

export const isAiCompletionEnabledAtom = atom(false);

export const completionOptionsAtom = atom(get => {
  if (get(isAiCompletionEnabledAtom)) {
    return [];
  }

  const serverCompletions = get(serverCompletionsAtom);
  const drafts = get(completionDraftsAtom);
  const removedIds = get(removedCompletionIdsAtom);
  const formSnapshots = get(completionFormSnapshotByItemKeyAtom);

  const existingOptions = serverCompletions
    .filter(c => !removedIds.has(c.id))
    .map(c => {
      const itemKey = `existing:${c.id}`;
      const snapshotTitle = formSnapshots[itemKey]?.title?.trim();
      return {
        id: c.id,
        title: snapshotTitle || c.title || "완료 화면",
      };
    });

  const draftOptions = drafts.map(draft => {
    const itemKey = getCompletionDraftItemKey(draft.key);
    const snapshotTitle = formSnapshots[itemKey]?.title?.trim();
    return {
      id: makeDraftCompletionId(draft.key),
      title: snapshotTitle || draft.title || "새 결과 화면",
    };
  });

  return [...existingOptions, ...draftOptions];
});

export const completionIdSetAtom = atom(get => {
  const options = get(completionOptionsAtom);
  return new Set(options.map(o => o.id));
});
