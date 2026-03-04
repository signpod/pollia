"use client";

import { MissionLikeButton } from "@/app/(site)/(main)/components/MissionLikeButton";
import { SocialShareButtonsWithData } from "@/app/(site)/mission/[missionId]/components/SocialShareButtonsWithData";
import { useStickyTabHeader } from "@/app/(site)/mission/[missionId]/components/hooks/useStickyTabHeader";
import type { MissionRewardData } from "@/app/(site)/mission/[missionId]/types/mission";
import { ProfileHeader } from "@/components/common/ProfileHeader";
import { MissionType } from "@prisma/client";
import { FixedBottomLayout } from "@repo/ui/components";
import type { ReactNode } from "react";
import { useRef } from "react";
import { MissionContentTemplate } from "../templates/MissionContentTemplate";
import { MissionIntroTemplate } from "../templates/MissionIntroTemplate";
import type { MissionIntroTemplateProps } from "../templates/MissionIntroTemplate";

export interface MissionIntroPageProps extends MissionIntroTemplateProps {
  isRequirePassword: boolean;
  missionId: string;
  missionType: MissionType | null;
  missionTitle: string | null;
  missionImageUrl: string | null;
  description: string | null;
  reward: MissionRewardData | null;
  contextTitle?: string;
  bottomButton?: ReactNode;
  viewCount?: number;
  likesCount?: number;
}

export function MissionIntroPage({
  imageUrl,
  title,
  subtitle,
  authorName,
  authorImageUrl,
  isRequirePassword,
  titleRef,
  missionId,
  missionType,
  missionTitle,
  missionImageUrl,
  description,
  reward,
  contextTitle,
  bottomButton,
  viewCount,
  likesCount,
}: MissionIntroPageProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { activeTab, isSticky, handleChangeTab } = useStickyTabHeader({
    sentinelRef,
    hasReward: !!reward,
  });

  return (
    <div className="relative w-full">
      <MissionIntroTemplate
        header={<ProfileHeader />}
        imageUrl={imageUrl}
        missionId={missionId}
        title={title}
        subtitle={subtitle}
        authorName={authorName}
        authorImageUrl={authorImageUrl}
        isRequirePassword={isRequirePassword}
        viewCount={viewCount}
        likesCount={likesCount}
        titleRef={titleRef}
      >
        <MissionContentTemplate
          title={contextTitle}
          isSticky={isSticky}
          activeTab={activeTab}
          onChangeTab={handleChangeTab}
          sentinelRef={sentinelRef}
          description={description}
          reward={reward}
          missionType={missionType}
          shareButtons={
            <SocialShareButtonsWithData
              missionId={missionId}
              title={missionTitle ?? undefined}
              imageUrl={missionImageUrl ?? undefined}
            />
          }
        />
      </MissionIntroTemplate>

      <FixedBottomLayout.Content>
        <div className="flex items-center gap-2 px-5 py-3">
          <MissionLikeButton
            missionId={missionId}
            className="flex size-12 shrink-0 items-center justify-center rounded-sm border border-zinc-200 bg-white"
          />
          <div className="flex-1 [&>div]:p-0">{bottomButton}</div>
        </div>
      </FixedBottomLayout.Content>
    </div>
  );
}
