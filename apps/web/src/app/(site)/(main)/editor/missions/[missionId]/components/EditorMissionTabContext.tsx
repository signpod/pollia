"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createContext, useCallback, useContext, useMemo } from "react";

export type EditorTabValue = "editor" | "stats" | "preview";

const VALID_TABS: ReadonlySet<string> = new Set<EditorTabValue>(["editor", "stats", "preview"]);
const DEFAULT_TAB: EditorTabValue = "editor";
const TAB_PARAM = "tab";

function parseTab(value: string | null): EditorTabValue {
  if (value && VALID_TABS.has(value)) {
    return value as EditorTabValue;
  }
  return DEFAULT_TAB;
}

interface EditorMissionTabContextValue {
  currentTab: EditorTabValue;
  setCurrentTab: (tab: EditorTabValue) => void;
}

const EditorMissionTabContext = createContext<EditorMissionTabContextValue | null>(null);

export function EditorMissionTabProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentTab = parseTab(searchParams.get(TAB_PARAM));

  const setCurrentTab = useCallback(
    (tab: EditorTabValue) => {
      const params = new URLSearchParams(searchParams.toString());
      if (tab === DEFAULT_TAB) {
        params.delete(TAB_PARAM);
      } else {
        params.set(TAB_PARAM, tab);
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [searchParams, router, pathname],
  );

  const value = useMemo(
    () => ({
      currentTab,
      setCurrentTab,
    }),
    [currentTab, setCurrentTab],
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
