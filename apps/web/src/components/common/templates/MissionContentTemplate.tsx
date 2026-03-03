"use client";

import { MissionDescription } from "@/app/(site)/mission/[missionId]/components/MissionDescription";
import { MissionFooter } from "@/app/(site)/mission/[missionId]/components/MissionFooter";
import { MissionRewardSection } from "@/app/(site)/mission/[missionId]/components/MissionRewardSection";
import { MissionShareSection } from "@/app/(site)/mission/[missionId]/components/MissionShareSection";
import { SECTION_IDS } from "@/app/(site)/mission/[missionId]/constants/sectionIds";
import { useGoBack } from "@/hooks/common/useGoBack";
import { cleanTiptapHTML, cn } from "@/lib/utils";
import { MissionType } from "@prisma/client";
import { Typo } from "@repo/ui/components";
import { ChevronLeft } from "lucide-react";
import type { RefObject } from "react";
import type { ReactNode } from "react";

export interface MissionContentTemplateReward {
  imageUrl?: string | null;
  name?: string | null;
  scheduledDate?: Date | null;
}

export interface MissionContentTemplateProps {
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
  const goBack = useGoBack();

  return (
    <div className="bg-zinc-50 relative">
      <div ref={sentinelRef} className="h-0" />
      <header className="sticky top-0 z-50 bg-white">
        <div
          className={cn(
            "overflow-hidden transition-all duration-300 flex items-center gap-2 h-12",
            isSticky ? "max-h-12 opacity-100" : "max-h-0 opacity-0",
          )}
        >
          <button
            type="button"
            onClick={goBack}
            className="shrink-0 size-12 flex items-center justify-center"
          >
            <ChevronLeft className="size-6" />
          </button>
          <Typo.SubTitle size="large" className="truncate">
            {title}
          </Typo.SubTitle>
        </div>
      </header>
      <div className="flex w-full flex-col px-5 pt-5 pb-10 gap-5">
        <div id={SECTION_IDS.MISSION_GUIDE}>
          {hasDescription && (
            <div className="bg-white rounded-2xl p-5 flex flex-col gap-4 w-full">
              <Typo.MainTitle size="small">상세 안내</Typo.MainTitle>
              <MissionDescription content={cleanTiptapHTML(description)} />
            </div>
          )}
        </div>

        {reward && (
          <div id={SECTION_IDS.REWARD}>
            <MissionRewardSection
              rewardImageUrl={reward.imageUrl ?? undefined}
              rewardName={reward.name ?? undefined}
              rewardScheduledDate={reward.scheduledDate ?? undefined}
            />
          </div>
        )}

        {missionType !== MissionType.EXPERIENCE_GROUP && shareButtons && (
          <MissionShareSection shareButtons={shareButtons} />
        )}
      </div>

      <MissionFooter />
    </div>
  );
}
