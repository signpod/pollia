"use client";

import { BottomNavBar } from "@/app/(site)/(main)/components/BottomNavBar";
import { SocialShareButtonsWithData } from "@/app/(site)/mission/[missionId]/components/SocialShareButtonsWithData";
import { useStickyTabHeader } from "@/app/(site)/mission/[missionId]/components/hooks/useStickyTabHeader";
import type { MissionRewardData } from "@/app/(site)/mission/[missionId]/types/mission";
import { ProfileHeader } from "@/components/common/ProfileHeader";
import { cn } from "@/lib/utils";
import { MissionType } from "@prisma/client";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
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
}: MissionIntroPageProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { activeTab, isSticky, handleChangeTab } = useStickyTabHeader({
    sentinelRef,
    hasReward: !!reward,
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 5);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

      <div className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-w-[600px] flex-col">
        <div
          className={cn(
            "transition-all duration-300 ease-out",
            isScrolled
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 translate-y-full pointer-events-none",
          )}
        >
          {bottomButton}
        </div>
        <div className="relative z-10">
          <BottomNavBar />
        </div>
      </div>
    </div>
  );
}
