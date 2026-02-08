"use client";

import {
  MissionDescription,
  MissionFooter,
  MissionLogo,
  MissionRewardSection,
  SectionHeader,
} from "@/app/mission/[missionId]/components";
import { SECTION_IDS } from "@/app/mission/[missionId]/constants/sectionIds";
import { cleanTiptapHTML, cn } from "@/lib/utils";
import { MissionType } from "@prisma/client";
import { Tab, Typo } from "@repo/ui/components";
import type { RefObject } from "react";
import type { ReactNode } from "react";

export interface MissionContentTemplateReward {
  imageUrl?: string | null;
  name?: string | null;
  scheduledDate?: Date | null;
}

export interface MissionContentTemplateProps {
  brandLogoUrl?: string;
  title?: string | null;
  isSticky?: boolean;
  activeTab?: string;
  onChangeTab?: (value: string) => void;
  sentinelRef?: RefObject<HTMLDivElement | null>;
  description: string | null;
  reward: MissionContentTemplateReward | null;
  missionType: MissionType | null;
  shareButtons?: ReactNode;
}

export function MissionContentTemplate({
  brandLogoUrl,
  title,
  isSticky = false,
  activeTab = SECTION_IDS.MISSION_GUIDE,
  onChangeTab,
  sentinelRef,
  description,
  reward,
  missionType,
  shareButtons,
}: MissionContentTemplateProps) {
  const sections = reward
    ? [SECTION_IDS.MISSION_GUIDE, SECTION_IDS.REWARD]
    : [SECTION_IDS.MISSION_GUIDE];
  const hasDescription = !!description && !!cleanTiptapHTML(description);

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
        <Tab.Root
          value={activeTab}
          pointColor="secondary"
          onValueChange={onChangeTab ?? (() => {})}
        >
          <Tab.List className="px-5">
            <Tab.Item
              value={SECTION_IDS.MISSION_GUIDE}
              className={cn(sections.length === 1 ? "mx-auto max-w-[110px]" : "")}
              onClick={() => onChangeTab?.(SECTION_IDS.MISSION_GUIDE)}
            >
              <Typo.SubTitle size="large">상세 안내</Typo.SubTitle>
            </Tab.Item>
            {reward && (
              <Tab.Item
                value={SECTION_IDS.REWARD}
                onClick={() => onChangeTab?.(SECTION_IDS.REWARD)}
              >
                <Typo.SubTitle size="large">참여 혜택</Typo.SubTitle>
              </Tab.Item>
            )}
          </Tab.List>
        </Tab.Root>
      </header>
      <div className="flex w-full flex-col py-20 px-5 items-center gap-20">
        <div id={SECTION_IDS.MISSION_GUIDE}>
          {hasDescription && (
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
            {shareButtons}
          </div>
        )}
      </div>

      <MissionFooter />
    </div>
  );
}
