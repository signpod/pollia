"use client";

import { createContext, useCallback, useContext, useMemo, useRef } from "react";

export interface EditorBootstrapDraft {
  formData: Record<string, unknown>;
  missionId: string;
}

interface EditorMissionBootstrapContextValue {
  setDraft: (draft: EditorBootstrapDraft) => void;
  consumeDraft: (missionId: string) => EditorBootstrapDraft | null;
  peekDraft: (missionId: string) => EditorBootstrapDraft | null;
  clearDraft: (missionId: string) => void;
}

const EditorMissionBootstrapContext = createContext<EditorMissionBootstrapContextValue | null>(
  null,
);

export function EditorMissionBootstrapProvider({ children }: { children: React.ReactNode }) {
  const draftRef = useRef<EditorBootstrapDraft | null>(null);

  const setDraft = useCallback((draft: EditorBootstrapDraft) => {
    draftRef.current = draft;
  }, []);

  const consumeDraft = useCallback((missionId: string): EditorBootstrapDraft | null => {
    const draft = draftRef.current;
    if (!draft || draft.missionId !== missionId) return null;
    draftRef.current = null;
    return draft;
  }, []);

  const peekDraft = useCallback((missionId: string): EditorBootstrapDraft | null => {
    const draft = draftRef.current;
    if (!draft || draft.missionId !== missionId) return null;
    return draft;
  }, []);

  const clearDraft = useCallback((missionId: string): void => {
    if (draftRef.current?.missionId === missionId) {
      draftRef.current = null;
    }
  }, []);

  const value = useMemo(
    () => ({ setDraft, consumeDraft, peekDraft, clearDraft }),
    [setDraft, consumeDraft, peekDraft, clearDraft],
  );

  return (
    <EditorMissionBootstrapContext.Provider value={value}>
      {children}
    </EditorMissionBootstrapContext.Provider>
  );
}

export function useEditorMissionBootstrap() {
  const context = useContext(EditorMissionBootstrapContext);
  if (!context) {
    throw new Error("useEditorMissionBootstrap must be used within EditorMissionBootstrapProvider");
  }
  return context;
}
