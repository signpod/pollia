"use client";

import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  type PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from "react";
import {
  addCompletionDraftAtom,
  clearCompletionDraftsAtom,
  completionDraftsAtom,
  completionOpenItemKeyAtom,
  removeCompletionDraftAtom,
  removeCompletionDraftByIdAtom,
  setCompletionDraftTitleAtom,
} from "../atoms/editorCompletionAtoms";

const DRAFT_COMPLETION_ID_PREFIX = "draft:completion:";

export interface CompletionDraftSubmissionValues {
  title: string;
  description: string;
  imageUrl?: string | null;
  imageFileUploadId?: string | null;
}

export interface CompletionDraftFormHandle {
  validateAndGetValues: (options?: {
    showErrors?: boolean;
  }) => CompletionDraftSubmissionValues | null;
  isUploading: () => boolean;
  deleteMarkedInitial: () => void;
}

export interface DraftCompletionRef {
  id: string;
  key: string;
  title: string;
  isDraft: true;
}

interface EditorMissionDraftContextValue {
  registerCompletionDraftForm: (draftKey: string, form: CompletionDraftFormHandle | null) => void;
  getCompletionDraftFormById: (draftId: string) => CompletionDraftFormHandle | null;
}

const EditorMissionDraftContext = createContext<EditorMissionDraftContextValue | null>(null);

export function makeDraftCompletionId(draftKey: string) {
  return `${DRAFT_COMPLETION_ID_PREFIX}${draftKey}`;
}

export function isDraftCompletionId(value: string | null | undefined): value is string {
  return Boolean(value?.startsWith(DRAFT_COMPLETION_ID_PREFIX));
}

export function getDraftCompletionKeyFromId(draftId: string): string | null {
  if (!isDraftCompletionId(draftId)) {
    return null;
  }

  return draftId.slice(DRAFT_COMPLETION_ID_PREFIX.length) || null;
}

export function getCompletionDraftItemKey(draftKey: string) {
  return `draft:${draftKey}`;
}

export function EditorMissionDraftProvider({ children }: PropsWithChildren) {
  const completionFormRefs = useRef<Record<string, CompletionDraftFormHandle | null>>({});

  const registerCompletionDraftForm = useCallback(
    (draftKey: string, form: CompletionDraftFormHandle | null) => {
      if (!form) {
        delete completionFormRefs.current[draftKey];
        return;
      }

      completionFormRefs.current[draftKey] = form;
    },
    [],
  );

  const getCompletionDraftFormById = useCallback((draftId: string) => {
    const draftKey = getDraftCompletionKeyFromId(draftId);
    if (!draftKey) {
      return null;
    }

    return completionFormRefs.current[draftKey] ?? null;
  }, []);

  const value = useMemo<EditorMissionDraftContextValue>(
    () => ({
      registerCompletionDraftForm,
      getCompletionDraftFormById,
    }),
    [registerCompletionDraftForm, getCompletionDraftFormById],
  );

  return (
    <EditorMissionDraftContext.Provider value={value}>
      {children}
    </EditorMissionDraftContext.Provider>
  );
}

export function useEditorMissionDraft() {
  const context = useContext(EditorMissionDraftContext);

  if (!context) {
    throw new Error("useEditorMissionDraft must be used within EditorMissionDraftProvider");
  }

  const completionDrafts = useAtomValue(completionDraftsAtom);
  const dispatchAddDraft = useSetAtom(addCompletionDraftAtom);
  const dispatchRemoveDraft = useSetAtom(removeCompletionDraftAtom);
  const dispatchRemoveDraftById = useSetAtom(removeCompletionDraftByIdAtom);
  const dispatchSetTitle = useSetAtom(setCompletionDraftTitleAtom);
  const dispatchClear = useSetAtom(clearCompletionDraftsAtom);
  const [, setOpenItemKey] = useAtom(completionOpenItemKeyAtom);

  const addCompletionDraft = useCallback(
    (draftKey: string, title?: string) => {
      dispatchAddDraft({ draftKey, title });
    },
    [dispatchAddDraft],
  );

  const removeCompletionDraft = useCallback(
    (draftKey: string) => {
      dispatchRemoveDraft(draftKey);
      context.registerCompletionDraftForm(draftKey, null);
    },
    [dispatchRemoveDraft, context],
  );

  const removeCompletionDraftById = useCallback(
    (draftId: string) => {
      const draftKey = getDraftCompletionKeyFromId(draftId);
      if (!draftKey) return;
      dispatchRemoveDraftById(draftId);
      context.registerCompletionDraftForm(draftKey, null);
    },
    [dispatchRemoveDraftById, context],
  );

  const setCompletionDraftTitle = useCallback(
    (draftKey: string, title: string) => {
      dispatchSetTitle({ draftKey, title });
    },
    [dispatchSetTitle],
  );

  const clearCompletionDrafts = useCallback(() => {
    dispatchClear();
  }, [dispatchClear]);

  const openCompletionDraftById = useCallback(
    (draftId: string) => {
      const draftKey = getDraftCompletionKeyFromId(draftId);
      if (!draftKey) return;
      setOpenItemKey(getCompletionDraftItemKey(draftKey));
    },
    [setOpenItemKey],
  );

  const setCompletionOpenHandler = useCallback((_handler: ((itemKey: string) => void) | null) => {
    // no-op: openItemKey is now managed by completionOpenItemKeyAtom
  }, []);

  return {
    completionDrafts,
    addCompletionDraft,
    removeCompletionDraft,
    removeCompletionDraftById,
    setCompletionDraftTitle,
    clearCompletionDrafts,
    registerCompletionDraftForm: context.registerCompletionDraftForm,
    getCompletionDraftFormById: context.getCompletionDraftFormById,
    setCompletionOpenHandler,
    openCompletionDraftById,
  };
}
