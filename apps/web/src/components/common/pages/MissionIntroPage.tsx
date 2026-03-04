"use client";

import { MissionLikeButton } from "@/app/(site)/(main)/components/MissionLikeButton";
import { SocialShareButtonsWithData } from "@/app/(site)/mission/[missionId]/components/SocialShareButtonsWithData";
import type { MissionRewardData } from "@/app/(site)/mission/[missionId]/types/mission";
import { useGoBack } from "@/hooks/common/useGoBack";
import { cn } from "@/lib/utils";
import { MissionType } from "@prisma/client";
import { FixedBottomLayout, Typo } from "@repo/ui/components";
import { ChevronLeft } from "lucide-react";
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
  const localTitleRef = useRef<HTMLDivElement>(null);
  const [isTitleHidden, setIsTitleHidden] = useState(false);
  const goBack = useGoBack();

  useEffect(() => {
    const el = localTitleRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) setIsTitleHidden(!entry.isIntersecting);
      },
      { threshold: 0 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative w-full">
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 mx-auto flex h-14 max-w-[600px] items-center px-1 transition-colors duration-300",
          isTitleHidden ? "bg-white" : "bg-gradient-to-b from-black/40 to-transparent",
        )}
      >
        <button type="button" onClick={goBack} className="flex items-center justify-center p-3">
          <ChevronLeft className={cn("size-6", isTitleHidden ? "text-zinc-900" : "text-white")} />
        </button>
        <Typo.SubTitle
          size="large"
          className={cn(
            "truncate transition-opacity duration-300",
            isTitleHidden ? "opacity-100" : "opacity-0",
          )}
        >
          {title}
        </Typo.SubTitle>
      </header>

      <MissionIntroTemplate
        imageUrl={imageUrl}
        missionId={missionId}
        title={title}
        subtitle={subtitle}
        authorName={authorName}
        authorImageUrl={authorImageUrl}
        isRequirePassword={isRequirePassword}
        viewCount={viewCount}
        likesCount={likesCount}
        titleRef={localTitleRef}
      >
        <MissionContentTemplate
          title={contextTitle}
          isSticky={false}
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
