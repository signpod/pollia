"use client";

import { createContext, useContext, useMemo, useState } from "react";

export type EditorTabValue = "editor" | "stats" | "preview";

interface EditorMissionTabContextValue {
  currentTab: EditorTabValue;
  setCurrentTab: (tab: EditorTabValue) => void;
}

const EditorMissionTabContext = createContext<EditorMissionTabContextValue | null>(null);

export function EditorMissionTabProvider({ children }: { children: React.ReactNode }) {
  const [currentTab, setCurrentTab] = useState<EditorTabValue>("editor");

  const value = useMemo(
    () => ({
      currentTab,
      setCurrentTab,
    }),
    [currentTab],
  );

  return (
    <EditorMissionTabContext.Provider value={value}>{children}</EditorMissionTabContext.Provider>
  );
}

export function useEditorMissionTab() {
  const context = useContext(EditorMissionTabContext);

  if (!context) {
    throw new Error("useEditorMissionTab must be used within EditorMissionTabProvider");
  }

  return context;
}
