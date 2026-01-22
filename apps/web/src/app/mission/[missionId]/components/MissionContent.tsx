"use client";

import { cleanTiptapHTML, cn } from "@/lib/utils";
import { MissionType } from "@prisma/client";
import { Tab, Typo } from "@repo/ui/components";
import { useRef } from "react";
import { useMissionIntroContext } from "../MissionIntro";
import { SECTION_IDS } from "../constants/sectionIds";
import type { MissionRewardData } from "../types/mission";
import { MissionDescription } from "./MissionDescription";
import { MissionFooter } from "./MissionFooter";
import { MissionLogo } from "./MissionLogo";
import { MissionRewardSection } from "./MissionRewardSection";
import { SectionHeader } from "./SectionHeader";
import { SocialShareButtonsWithData } from "./SocialShareButtonsWithData";
import { useStickyTabHeader } from "./hooks/useStickyTabHeader";

export interface MissionContentProps {
  missionId: string;
  missionType: MissionType | null;
  missionTitle: string | null;
  missionImageUrl: string | null;
  description: string | null;
  reward: MissionRewardData | null;
}

export function MissionContent({
  missionId,
  missionType,
  missionTitle,
  missionImageUrl,
  description,
  reward,
}: MissionContentProps) {
  const { brandLogoUrl, title } = useMissionIntroContext();

  const sections = reward
    ? [SECTION_IDS.MISSION_GUIDE, SECTION_IDS.REWARD]
    : [SECTION_IDS.MISSION_GUIDE];

  const sentinelRef = useRef<HTMLDivElement>(null);
  const { activeTab, isSticky, handleChangeTab } = useStickyTabHeader({
    sentinelRef,
    hasReward: !!reward,
  });

  return (
    <div className="bg-white relative">
      <div ref={sentinelRef} className="h-0" />
      <header className="sticky top-0 z-50 bg-white">
        <div
          className={cn(
            "overflow-hidden transition-all duration-300 px-5 flex items-center gap-2",
            isSticky ? "max-h-12 opacity-100 pt-3" : "max-h-0 opacity-0",
          )}
        >
          <MissionLogo logoUrl={brandLogoUrl ?? undefined} size="small" />
          <Typo.SubTitle size="large" className="truncate">
            {title}
          </Typo.SubTitle>
        </div>
        <Tab.Root value={activeTab} pointColor="secondary" onValueChange={handleChangeTab}>
          <Tab.List className="px-5">
            <Tab.Item
              value={SECTION_IDS.MISSION_GUIDE}
              className={cn(sections.length === 1 ? "mx-auto max-w-[110px]" : "")}
              onClick={() => handleChangeTab(SECTION_IDS.MISSION_GUIDE)}
            >
              <Typo.SubTitle size="large">상세 안내</Typo.SubTitle>
            </Tab.Item>
            {reward && (
              <Tab.Item
                value={SECTION_IDS.REWARD}
                onClick={() => handleChangeTab(SECTION_IDS.REWARD)}
              >
                <Typo.SubTitle size="large">참여 혜택</Typo.SubTitle>
              </Tab.Item>
            )}
          </Tab.List>
        </Tab.Root>
      </header>
      <div className="flex w-full flex-col pt-20 px-5 items-center gap-20">
        <div id={SECTION_IDS.MISSION_GUIDE}>
          {!!description && !!cleanTiptapHTML(description) && (
            <div className="flex flex-col gap-6 px-5 items-center w-full">
              <SectionHeader badgeText="상세 안내" title={""} />
              <MissionDescription content={cleanTiptapHTML(description)} className="text-center" />
            </div>
          )}
        </div>

        {reward && (
          <div id={SECTION_IDS.REWARD} className="px-5 w-full">
            <MissionRewardSection
              rewardImageUrl={reward.imageUrl ?? undefined}
              rewardName={reward.name ?? undefined}
              rewardScheduledDate={reward.scheduledDate ?? undefined}
            />
          </div>
        )}

        {missionType !== MissionType.EXPERIENCE_GROUP && (
          <div className="flex flex-col gap-4 items-center px-5">
            <Typo.MainTitle size="small" className="text-center">
              가족, 친구에게
              <br />
              공유해주세요 👀
            </Typo.MainTitle>
            <SocialShareButtonsWithData
              missionId={missionId}
              title={missionTitle ?? undefined}
              imageUrl={missionImageUrl ?? undefined}
            />
          </div>
        )}
      </div>

      <MissionFooter />
    </div>
  );
}
