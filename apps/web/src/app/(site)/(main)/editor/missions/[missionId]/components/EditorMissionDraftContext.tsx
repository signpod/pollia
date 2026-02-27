"use client";

import {
  type PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

const DRAFT_COMPLETION_ID_PREFIX = "draft:completion:";

export interface CompletionDraftSubmissionValues {
  title: string;
  description: string;
  imageUrl?: string | null;
  imageFileUploadId?: string | null;
}

export interface CompletionDraftFormHandle {
  validateAndGetValues: () => CompletionDraftSubmissionValues | null;
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
  completionDrafts: DraftCompletionRef[];
  addCompletionDraft: (draftKey: string, title?: string) => void;
  removeCompletionDraft: (draftKey: string) => void;
  removeCompletionDraftById: (draftId: string) => void;
  setCompletionDraftTitle: (draftKey: string, title: string) => void;
  clearCompletionDrafts: () => void;
  registerCompletionDraftForm: (draftKey: string, form: CompletionDraftFormHandle | null) => void;
  getCompletionDraftFormById: (draftId: string) => CompletionDraftFormHandle | null;
  setCompletionOpenHandler: (handler: ((itemKey: string) => void) | null) => void;
  openCompletionDraftById: (draftId: string) => void;
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
  const [completionDrafts, setCompletionDrafts] = useState<DraftCompletionRef[]>([]);
  const completionFormRefs = useRef<Record<string, CompletionDraftFormHandle | null>>({});
  const completionOpenHandlerRef = useRef<((itemKey: string) => void) | null>(null);

  const addCompletionDraft = useCallback((draftKey: string, title = "새 결과 화면") => {
    setCompletionDrafts(prev => {
      const nextId = makeDraftCompletionId(draftKey);
      const existing = prev.find(item => item.id === nextId);
      if (existing) {
        return prev.map(item => (item.id === nextId ? { ...item, title } : item));
      }

      return [...prev, { id: nextId, key: draftKey, title, isDraft: true }];
    });
  }, []);

  const removeCompletionDraft = useCallback((draftKey: string) => {
    const draftId = makeDraftCompletionId(draftKey);
    setCompletionDrafts(prev => prev.filter(item => item.id !== draftId));
    delete completionFormRefs.current[draftKey];
  }, []);

  const removeCompletionDraftById = useCallback((draftId: string) => {
    const draftKey = getDraftCompletionKeyFromId(draftId);
    if (!draftKey) {
      return;
    }

    setCompletionDrafts(prev => prev.filter(item => item.id !== draftId));
    delete completionFormRefs.current[draftKey];
  }, []);

  const setCompletionDraftTitle = useCallback((draftKey: string, title: string) => {
    const nextTitle = title.trim() || "새 결과 화면";
    setCompletionDrafts(prev =>
      prev.map(item => (item.key === draftKey ? { ...item, title: nextTitle } : item)),
    );
  }, []);

  const clearCompletionDrafts = useCallback(() => {
    setCompletionDrafts([]);
    completionFormRefs.current = {};
  }, []);

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

  const setCompletionOpenHandler = useCallback((handler: ((itemKey: string) => void) | null) => {
    completionOpenHandlerRef.current = handler;
  }, []);

  const openCompletionDraftById = useCallback((draftId: string) => {
    const draftKey = getDraftCompletionKeyFromId(draftId);
    if (!draftKey) {
      return;
    }

    completionOpenHandlerRef.current?.(getCompletionDraftItemKey(draftKey));
  }, []);

  const value = useMemo<EditorMissionDraftContextValue>(
    () => ({
      completionDrafts,
      addCompletionDraft,
      removeCompletionDraft,
      removeCompletionDraftById,
      setCompletionDraftTitle,
      clearCompletionDrafts,
      registerCompletionDraftForm,
      getCompletionDraftFormById,
      setCompletionOpenHandler,
      openCompletionDraftById,
    }),
    [
      completionDrafts,
      addCompletionDraft,
      removeCompletionDraft,
      removeCompletionDraftById,
      setCompletionDraftTitle,
      clearCompletionDrafts,
      registerCompletionDraftForm,
      getCompletionDraftFormById,
      setCompletionOpenHandler,
      openCompletionDraftById,
    ],
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

  return context;
}
