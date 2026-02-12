"use client";

import { MISSION_CATEGORY_LABELS } from "@/constants/mission";
import { MissionCategory } from "@prisma/client";
import { Tab, Typo } from "@repo/ui/components";
import { useMemo, useState } from "react";
import { MeLikedMissionCard } from "../components/MeLikedMissionCard";
import { useLikedMissions } from "../hooks/useLikedMissions";

type CategoryFilter = "all" | MissionCategory;

const CATEGORY_TABS: { id: CategoryFilter; label: string }[] = [
  { id: "all", label: "전체" },
  { id: MissionCategory.EVENT, label: MISSION_CATEGORY_LABELS[MissionCategory.EVENT] },
  { id: MissionCategory.CHALLENGE, label: MISSION_CATEGORY_LABELS[MissionCategory.CHALLENGE] },
  { id: MissionCategory.RESEARCH, label: MISSION_CATEGORY_LABELS[MissionCategory.RESEARCH] },
  { id: MissionCategory.TEST, label: MISSION_CATEGORY_LABELS[MissionCategory.TEST] },
  { id: MissionCategory.QUIZ, label: MISSION_CATEGORY_LABELS[MissionCategory.QUIZ] },
];

export function LikedContent() {
  const { data: likedMissions } = useLikedMissions();
  const [category, setCategory] = useState<CategoryFilter>("all");

  const missions = likedMissions ?? [];

  const filteredMissions = useMemo(() => {
    if (category === "all") return missions;
    return missions.filter(m => m.category === category);
  }, [missions, category]);

  return (
    <div className="flex flex-col">
      <Tab.Root
        value={category}
        onValueChange={v => setCategory(v as CategoryFilter)}
        pointColor="secondary"
        scrollable
      >
        <Tab.List>
          {CATEGORY_TABS.map(tab => (
            <Tab.Item key={tab.id} value={tab.id}>
              <span className="text-sm font-semibold">{tab.label}</span>
            </Tab.Item>
          ))}
        </Tab.List>
      </Tab.Root>

      <div className="px-5 py-4">
        {filteredMissions.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {filteredMissions.map(mission => (
              <MeLikedMissionCard key={mission.id} mission={mission} />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-20">
            <Typo.Body size="medium" className="text-zinc-400">
              찜한 프로젝트가 없어요
            </Typo.Body>
          </div>
        )}
      </div>
    </div>
  );
}
