import { makeDraftActionId } from "@/app/(site)/mission/[missionId]/manage/actions/logic";
import { ActionType } from "@prisma/client";
import { atom } from "jotai";
import {
  getCompletionDraftItemKey,
  makeDraftCompletionId,
} from "../components/EditorMissionDraftContext";
import { getDraftItemKey } from "../components/actionSettingsCard.utils";
import { createDraftKey } from "../components/editorDraftKey";
import {
  actionDraftItemsAtom,
  actionOpenItemKeyAtom,
  actionTypeByItemKeyAtom,
} from "./editorActionAtoms";
import { addCompletionDraftAtom, completionOpenItemKeyAtom } from "./editorCompletionAtoms";

export const createLinkedActionDraftAtom = atom(null, (_get, set) => {
  const draftKey = createDraftKey();
  const itemKey = getDraftItemKey(draftKey);
  const draftActionId = makeDraftActionId(draftKey);

  set(actionDraftItemsAtom, prev => [...prev, { key: draftKey }]);
  set(actionTypeByItemKeyAtom, prev => ({ ...prev, [itemKey]: ActionType.MULTIPLE_CHOICE }));
  set(actionOpenItemKeyAtom, itemKey);

  return { draftActionId, itemKey };
});

export const createLinkedCompletionDraftAtom = atom(null, (_get, set) => {
  const draftKey = createDraftKey();
  const draftCompletionId = makeDraftCompletionId(draftKey);
  const itemKey = getCompletionDraftItemKey(draftKey);

  set(addCompletionDraftAtom, { draftKey });
  set(completionOpenItemKeyAtom, itemKey);

  return { draftCompletionId, itemKey };
});
