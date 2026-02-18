"use client";

import { SocialShareButtonsWithData } from "@/app/mission/[missionId]/components/SocialShareButtonsWithData";
import { useStickyTabHeader } from "@/app/mission/[missionId]/components/hooks/useStickyTabHeader";
import type { MissionRewardData } from "@/app/mission/[missionId]/types/mission";
import { cn } from "@/lib/utils";
import { MissionType } from "@prisma/client";
import { FixedBottomLayout } from "@repo/ui/components";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { MissionContentTemplate } from "../templates/MissionContentTemplate";
import { MissionIntroTemplate } from "../templates/MissionIntroTemplate";
import type { MissionIntroTemplateProps } from "../templates/MissionIntroTemplate";

const SCROLL_OFFSET = 10;

export interface MissionIntroPageProps extends MissionIntroTemplateProps {
  isRequirePassword: boolean;
  missionId: string;
  missionType: MissionType | null;
  missionTitle: string | null;
  missionImageUrl: string | null;
  description: string | null;
  reward: MissionRewardData | null;
  contextBrandLogoUrl?: string;
  contextTitle?: string;
  bottomButton?: ReactNode;
}

export function MissionIntroPage({
  imageUrl,
  brandLogoUrl,
  title,
  formattedDeadline,
  isRequirePassword,
  showRewardWidget,
  rewardName,
  showDeadlineWidget,
  deadlineDate,
  showOpenWidget,
  openDate,
  titleRef,
  missionId,
  missionType,
  missionTitle,
  missionImageUrl,
  description,
  reward,
  contextBrandLogoUrl,
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

  const handleScrollDown = () => {
    window.scrollTo({
      top: window.innerHeight + SCROLL_OFFSET,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative w-full">
      <MissionIntroTemplate
        imageUrl={imageUrl}
        brandLogoUrl={brandLogoUrl}
        title={title}
        formattedDeadline={formattedDeadline}
        isRequirePassword={isRequirePassword}
        showRewardWidget={showRewardWidget}
        rewardName={rewardName}
        showDeadlineWidget={showDeadlineWidget}
        deadlineDate={deadlineDate}
        showOpenWidget={showOpenWidget}
        openDate={openDate}
        titleRef={titleRef}
        onScrollDown={handleScrollDown}
      >
        <MissionContentTemplate
          brandLogoUrl={contextBrandLogoUrl}
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

      <FixedBottomLayout.Content
        className={isScrolled ? "bg-transparent" : "bg-transparent pointer-events-none"}
      >
        <div
          className="absolute inset-x-0 bottom-0"
          style={{
            height: "100px",
            opacity: isScrolled ? 1 : 0,
            transition: "opacity 0.3s ease-out",
            backdropFilter: "blur(100px)",
            WebkitBackdropFilter: "blur(100px)",
            maskImage: isScrolled
              ? "linear-gradient(to bottom, transparent 0%, black 100%)"
              : "linear-gradient(to bottom, transparent 100%, transparent 100%)",
            WebkitMaskImage: isScrolled
              ? "linear-gradient(to bottom, transparent 0%, black 100%)"
              : "linear-gradient(to bottom, transparent 100%, transparent 100%)",
            background: "rgba(255, 255, 255, 0)",
            pointerEvents: "none",
          }}
        />
        <div
          className={cn(
            "sticky bottom-0 z-60 border-zinc-100 transition-all duration-300 ease-out",
            isScrolled
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 translate-y-full pointer-events-none",
          )}
        >
          {bottomButton}
        </div>
      </FixedBottomLayout.Content>
    </div>
  );
}
