"use client";

import { Tab, Typo } from "@repo/ui/components";
import { type EditorTabValue, useEditorMissionTab } from "./EditorMissionTabContext";

export function EditorMissionTabs() {
  const { currentTab, setCurrentTab } = useEditorMissionTab();

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab as EditorTabValue);
  };

  return (
    <Tab.Root value={currentTab} onValueChange={handleTabChange} pointColor="secondary">
      <Tab.List>
        <Tab.Item value="editor">
          <Typo.Body size="large">에디터</Typo.Body>
        </Tab.Item>
        <Tab.Item value="stats">
          <Typo.Body size="large">통계</Typo.Body>
        </Tab.Item>
      </Tab.List>
    </Tab.Root>
  );
}
