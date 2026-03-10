import { useSetAtom } from "jotai";
import { useCallback } from "react";
import {
  createLinkedActionDraftAtom,
  createLinkedCompletionDraftAtom,
} from "../atoms/editorLinkedItemAtoms";
import { scrollToEditorItem } from "./editorScrollToItem";

export function useCreateLinkedItem() {
  const dispatchCreateAction = useSetAtom(createLinkedActionDraftAtom);
  const dispatchCreateCompletion = useSetAtom(createLinkedCompletionDraftAtom);

  const createLinkedAction = useCallback(() => {
    const { draftActionId, itemKey } = dispatchCreateAction();
    scrollToEditorItem(itemKey);
    return draftActionId;
  }, [dispatchCreateAction]);

  const createLinkedCompletion = useCallback(() => {
    const { draftCompletionId, itemKey } = dispatchCreateCompletion();
    scrollToEditorItem(itemKey);
    return draftCompletionId;
  }, [dispatchCreateCompletion]);

  return { createLinkedAction, createLinkedCompletion };
}
