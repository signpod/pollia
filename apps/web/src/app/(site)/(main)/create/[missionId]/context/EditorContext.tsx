"use client";

import type { Action, ActionOption, Mission, MissionCompletion } from "@prisma/client";
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type EditorSection = "info" | "actions" | "completions";

export type PreviewMission = Pick<
  Mission,
  "id" | "title" | "description" | "imageUrl" | "category" | "isActive" | "entryActionId"
>;

export type PreviewAction = Pick<
  Action,
  | "id"
  | "title"
  | "description"
  | "type"
  | "order"
  | "isRequired"
  | "nextActionId"
  | "nextCompletionId"
> & {
  options: Pick<ActionOption, "id" | "title" | "order" | "nextActionId" | "nextCompletionId">[];
};

export type PreviewCompletion = Pick<
  MissionCompletion,
  "id" | "title" | "description" | "imageUrl"
> & {
  links: { id: string; url: string; ogTitle: string | null; ogImage: string | null }[];
};

interface EditorState {
  missionId: string;
  activeSection: EditorSection;
  activeActionIndex: number;
  activeCompletionIndex: number;
  previewMission: PreviewMission | null;
  previewActions: PreviewAction[];
  previewCompletions: PreviewCompletion[];
  pendingIsActive: boolean;
  hasUnsavedChanges: boolean;
  requestedActionId: string | null;
  requestedCompletionId: string | null;
}

interface EditorContextValue extends EditorState {
  setActiveSection: (section: EditorSection) => void;
  setActiveActionIndex: (index: number) => void;
  setActiveCompletionIndex: (index: number) => void;
  setPreviewMission: (mission: PreviewMission | null) => void;
  setPreviewActions: React.Dispatch<React.SetStateAction<PreviewAction[]>>;
  setPreviewCompletions: React.Dispatch<React.SetStateAction<PreviewCompletion[]>>;
  setPendingIsActive: (value: boolean) => void;
  setHasUnsavedChanges: (value: boolean) => void;
  requestOpenAction: (actionId: string | null) => void;
  requestOpenCompletion: (completionId: string | null) => void;
  clearRequestedIds: () => void;
}

const initialState: EditorState = {
  missionId: "",
  activeSection: "info",
  activeActionIndex: 0,
  activeCompletionIndex: 0,
  previewMission: null,
  previewActions: [],
  previewCompletions: [],
  pendingIsActive: true,
  hasUnsavedChanges: false,
  requestedActionId: null,
  requestedCompletionId: null,
};

const EditorContext = createContext<EditorContextValue | null>(null);

export function useEditor() {
  const ctx = useContext(EditorContext);
  if (!ctx) {
    throw new Error("useEditor must be used within EditorProvider");
  }
  return ctx;
}

interface EditorProviderProps {
  missionId: string;
  initialMission: PreviewMission;
  initialActions: PreviewAction[];
  initialCompletions: PreviewCompletion[];
  initialIsActive: boolean;
  children: ReactNode;
}

export function EditorProvider({
  missionId,
  initialMission,
  initialActions,
  initialCompletions,
  initialIsActive,
  children,
}: EditorProviderProps) {
  const [activeSection, setActiveSection] = useState<EditorSection>("info");
  const [activeActionIndex, setActiveActionIndex] = useState(0);
  const [activeCompletionIndex, setActiveCompletionIndex] = useState(0);
  const [previewMission, setPreviewMission] = useState<PreviewMission | null>(initialMission);
  const [previewActions, setPreviewActions] = useState<PreviewAction[]>(initialActions);
  const [previewCompletions, setPreviewCompletions] =
    useState<PreviewCompletion[]>(initialCompletions);
  const [pendingIsActive, setPendingIsActive] = useState(initialIsActive);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [requestedActionId, setRequestedActionId] = useState<string | null>(null);
  const [requestedCompletionId, setRequestedCompletionId] = useState<string | null>(null);

  const requestOpenAction = useCallback((actionId: string | null) => {
    setRequestedActionId(actionId);
  }, []);

  const requestOpenCompletion = useCallback((completionId: string | null) => {
    setRequestedCompletionId(completionId);
  }, []);

  const clearRequestedIds = useCallback(() => {
    setRequestedActionId(null);
    setRequestedCompletionId(null);
  }, []);

  const value = useMemo<EditorContextValue>(
    () => ({
      missionId,
      activeSection,
      activeActionIndex,
      activeCompletionIndex,
      previewMission,
      previewActions,
      previewCompletions,
      pendingIsActive,
      hasUnsavedChanges,
      requestedActionId,
      requestedCompletionId,
      setActiveSection,
      setActiveActionIndex,
      setActiveCompletionIndex,
      setPreviewMission,
      setPreviewActions,
      setPreviewCompletions,
      setPendingIsActive,
      setHasUnsavedChanges,
      requestOpenAction,
      requestOpenCompletion,
      clearRequestedIds,
    }),
    [
      missionId,
      activeSection,
      activeActionIndex,
      activeCompletionIndex,
      previewMission,
      previewActions,
      previewCompletions,
      pendingIsActive,
      hasUnsavedChanges,
      requestedActionId,
      requestedCompletionId,
      requestOpenAction,
      requestOpenCompletion,
      clearRequestedIds,
    ],
  );

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}
