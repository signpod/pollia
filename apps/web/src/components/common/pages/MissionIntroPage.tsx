"use client";

import { LoginDrawer } from "@/app/(site)/(main)/components/LoginDrawer";
import { MissionLikeButton } from "@/app/(site)/(main)/components/MissionLikeButton";
import { SocialShareButtonsWithData } from "@/app/(site)/mission/[missionId]/components/SocialShareButtonsWithData";
import type { MissionRewardData } from "@/app/(site)/mission/[missionId]/types/mission";
import { ProfileHeader } from "@/components/common/ProfileHeader";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { MissionType } from "@prisma/client";
import { ButtonV2, FixedBottomLayout, Typo, useDrawer } from "@repo/ui/components";
import { ChevronLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";
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

function LoginDrawerTrigger() {
  const { open } = useDrawer();

  return (
    <ButtonV2
      variant="tertiary"
      size="medium"
      onClick={open}
      className="text-sub border border-default"
    >
      <Typo.ButtonText size="medium">로그인/가입</Typo.ButtonText>
    </ButtonV2>
  );
}

function MissionLoginDrawer() {
  return (
    <LoginDrawer>
      <LoginDrawerTrigger />
    </LoginDrawer>
  );
}

export function MissionIntroPage({
  imageUrl,
  title,
  subtitle,
  authorName,
  authorImageUrl,
  isRequirePassword,
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
  const router = useRouter();

  useEffect(() => {
    const el = localTitleRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        const isAboveViewport = !entry.isIntersecting && entry.boundingClientRect.bottom < 0;
        setIsTitleHidden(isAboveViewport);
      },
      { threshold: 0 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative w-full">
      <div className="sticky top-0 z-50 h-14">
        <div
          className={cn(
            "absolute inset-x-0 top-0 flex h-14 items-center bg-white pl-1 pr-5 transition-opacity duration-300",
            isTitleHidden ? "opacity-100" : "opacity-0 pointer-events-none",
          )}
        >
          <button
            type="button"
            onClick={() => router.replace(ROUTES.HOME)}
            className="flex items-center justify-center p-3"
          >
            <ChevronLeftIcon className="size-6" />
          </button>
          <Typo.SubTitle size="large" className="min-w-0 flex-1 truncate">
            {title}
          </Typo.SubTitle>
        </div>
        <div
          className={cn(
            "absolute inset-x-0 top-0 transition-opacity duration-300",
            isTitleHidden ? "opacity-0 pointer-events-none" : "opacity-100",
          )}
        >
          <ProfileHeader fallbackRight={<MissionLoginDrawer />} />
        </div>
      </div>

      <MissionIntroTemplate
        imageUrl={imageUrl}
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
