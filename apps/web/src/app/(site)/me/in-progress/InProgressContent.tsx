"use client";

import { MISSION_CATEGORY_LABELS } from "@/constants/mission";
import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import { MissionCategory } from "@prisma/client";
import { Tab, Typo } from "@repo/ui/components";
import { useMemo, useState } from "react";
import { InProgressGrid } from "../components/InProgressGrid";
import { useMyResponses } from "../hooks/useMyResponses";

type CategoryFilter = "all" | MissionCategory;

const CATEGORY_TABS: { id: CategoryFilter; label: string }[] = [
  { id: "all", label: "전체" },
  { id: MissionCategory.EVENT, label: MISSION_CATEGORY_LABELS[MissionCategory.EVENT] },
  { id: MissionCategory.CHALLENGE, label: MISSION_CATEGORY_LABELS[MissionCategory.CHALLENGE] },
  { id: MissionCategory.RESEARCH, label: MISSION_CATEGORY_LABELS[MissionCategory.RESEARCH] },
  { id: MissionCategory.TEST, label: MISSION_CATEGORY_LABELS[MissionCategory.TEST] },
  { id: MissionCategory.QUIZ, label: MISSION_CATEGORY_LABELS[MissionCategory.QUIZ] },
];

export function InProgressContent() {
  const { data } = useMyResponses();
  const [category, setCategory] = useState<CategoryFilter>("all");

  const inProgressResponses = useMemo(() => {
    const responses = data?.data ?? [];
    return responses.filter(r => r.completedAt === null);
  }, [data]);

  const filteredResponses = useMemo(() => {
    if (category === "all") return inProgressResponses;
    return inProgressResponses.filter(r => r.mission.category === category);
  }, [inProgressResponses, category]);

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
        {filteredResponses.length > 0 ? (
          <InProgressGrid responses={filteredResponses} />
        ) : (
          <div className="flex items-center justify-center py-20">
            <Typo.Body size="medium" className="text-zinc-400">
              참여 중인 {UBIQUITOUS_CONSTANTS.MISSION}가 없어요
            </Typo.Body>
          </div>
        )}
      </div>
    </div>
  );
}
