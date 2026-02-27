"use client";

import { useReadMissions } from "@/hooks/mission/useReadMissions";
import { Typo } from "@repo/ui/components";
import { MyContentList } from "../components/MyContentList";

export function MyContentFullList() {
  const { data } = useReadMissions();
  const missions = data?.pages.flatMap(page => page.data) ?? [];

  if (missions.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Typo.Body size="medium" className="text-zinc-400">
          만든 콘텐츠가 없어요
        </Typo.Body>
      </div>
    );
  }

  return (
    <div className="px-5 py-4">
      <MyContentList missions={missions} />
    </div>
  );
}
