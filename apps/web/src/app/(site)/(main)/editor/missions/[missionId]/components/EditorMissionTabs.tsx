"use client";

import { ROUTES } from "@/constants/routes";
import { Tab, Typo } from "@repo/ui/components";
import { useRouter, useSelectedLayoutSegment } from "next/navigation";

interface EditorMissionTabsProps {
  missionId: string;
}

type EditorTabValue = "editor" | "stats" | "preview";

function resolveCurrentTab(segment: string | null): EditorTabValue {
  if (segment === "stats") return "stats";
  if (segment === "preview") return "preview";
  return "editor";
}

export function EditorMissionTabs({ missionId }: EditorMissionTabsProps) {
  const router = useRouter();
  const segment = useSelectedLayoutSegment();
  const currentTab = resolveCurrentTab(segment);

  const handleTabChange = (tab: string) => {
    const nextTab = tab as EditorTabValue;

    if (nextTab === "editor") {
      router.push(ROUTES.EDITOR_MISSION(missionId));
      return;
    }

    if (nextTab === "stats") {
      router.push(ROUTES.EDITOR_MISSION_STATS(missionId));
      return;
    }

    router.push(ROUTES.EDITOR_MISSION_PREVIEW(missionId));
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
        <Tab.Item value="preview">
          <Typo.Body size="large">미리보기</Typo.Body>
        </Tab.Item>
      </Tab.List>
    </Tab.Root>
  );
}
