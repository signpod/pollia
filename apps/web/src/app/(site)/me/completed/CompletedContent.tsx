"use client";

import { MISSION_CATEGORY_LABELS } from "@/constants/mission";
import { MissionCategory } from "@prisma/client";
import { Tab, Typo } from "@repo/ui/components";
import { useMemo, useState } from "react";
import { MeContentCard } from "../components/MeContentCard";
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

export function CompletedContent() {
  const { data } = useMyResponses();
  const [category, setCategory] = useState<CategoryFilter>("all");

  const completedResponses = useMemo(() => {
    const responses = data?.data ?? [];
    return responses.filter(r => r.completedAt !== null);
  }, [data]);

  const filteredResponses = useMemo(() => {
    if (category === "all") return completedResponses;
    return completedResponses.filter(r => r.mission.category === category);
  }, [completedResponses, category]);

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
          <div className="grid grid-cols-2 gap-x-4 gap-y-10">
            {filteredResponses.map(response => (
              <MeContentCard
                key={response.id}
                response={response}
                variant="completed"
                lineClamp={1}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-20">
            <Typo.Body size="medium" className="text-zinc-400">
              완료한 프로젝트가 없어요
            </Typo.Body>
          </div>
        )}
      </div>
    </div>
  );
}
