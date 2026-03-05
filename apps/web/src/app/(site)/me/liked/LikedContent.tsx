"use client";

import { MISSION_CATEGORY_LABELS } from "@/constants/mission";
import { ROUTES } from "@/constants/routes";
import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import { MissionCategory } from "@prisma/client";
import PolliaFaceVeryGood from "@public/svgs/face/very-good-face-full.svg";
import { ButtonV2, EmptyState, Tab, Typo } from "@repo/ui/components";
import Link from "next/link";
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

      <div className="flex flex-1 flex-col px-5 py-4">
        {filteredMissions.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {filteredMissions.map(mission => (
              <MeLikedMissionCard key={mission.id} mission={mission} />
            ))}
          </div>
        ) : (
          <div className="flex min-h-[50dvh] items-center justify-center">
            <EmptyState
              icon={<PolliaFaceVeryGood className="size-30 text-zinc-200" />}
              title={`찜한 ${UBIQUITOUS_CONSTANTS.MISSION}가 없어요`}
              description={
                <>
                  아래 버튼을 눌러
                  <br />
                  마음에 드는 {UBIQUITOUS_CONSTANTS.MISSION}를 찜해보세요
                </>
              }
              action={
                <div className="flex justify-center">
                  <Link href={ROUTES.HOME}>
                    <ButtonV2 variant="primary" className="w-auto">
                      <Typo.ButtonText size="large">구경하러 가기</Typo.ButtonText>
                    </ButtonV2>
                  </Link>
                </div>
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
