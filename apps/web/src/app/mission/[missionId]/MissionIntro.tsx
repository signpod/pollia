"use client";

import { AuthError } from "@/hooks/login/useKakaoLogin";
import { useMissionIntroData, useSurveyResume } from "@/hooks/mission";
import { useReadMissionResponseForMission } from "@/hooks/mission-response";
import { useReadMissionParticipantInfo } from "@/hooks/participant/useReadMissionParticipantInfo";
import { useReadReward } from "@/hooks/reward/useReadReward";
import { getActionNavCookie, setActionNavCookie } from "@/lib/cookie";
import { cn } from "@/lib/utils";
import Gift from "@public/svgs/gift.svg";
import Lock from "@public/svgs/lock.svg";
import {
  CalloutProvider,
  type CalloutToneVariant,
  Tab,
  Typo,
  useCallout,
} from "@repo/ui/components";
import { useParams } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { MissionBadge, MissionImage, MissionLogo } from "./components";
import { BottomButton } from "./ui";
import { checkParticipantLimitReached } from "./utils/checkParticipantLimit";

const SECTION_IDS = {
  MISSION_GUIDE: "mission-guide",
  REWARD: "reward",
} as const;

const SCROLL_OFFSET = (sectionId: string) => {
  if (sectionId === SECTION_IDS.MISSION_GUIDE) {
    return 60;
  }
  return 30;
};

function CalloutTrigger({
  calloutData,
}: {
  calloutData: { variant: CalloutToneVariant; description: string } | null;
}) {
  const { show } = useCallout();
  const hasShownRef = useRef(false);

  useEffect(() => {
    if (calloutData && !hasShownRef.current) {
      hasShownRef.current = true;
      show({
        description: calloutData.description,
        variant: calloutData.variant,
        duration: Number.POSITIVE_INFINITY,
      });
    }
  }, [calloutData, show]);

  return null;
}

interface MissionIntroProps {
  initialError: AuthError | null;
  children: ReactNode;
}

export function MissionIntro({ initialError, children }: MissionIntroProps) {
  const { missionId } = useParams<{ missionId: string }>();

  useEffect(() => {
    const existingValue = getActionNavCookie(missionId);
    if (!existingValue) {
      setActionNavCookie(missionId, "initial");
    }
  }, [missionId]);

  const {
    mission,
    firstActionId,
    isEnabledToResume,
    nextActionId,
    isCompleted,
    missionResponse,
    isRequirePassword,
  } = useMissionIntroData(missionId);

  const { showResumeModal } = useSurveyResume({
    isEnabledToResume,
    nextActionId,
    firstActionId,
    missionId,
    responseId: missionResponse?.id ?? "",
  });

  const { brandLogoUrl, title, deadline, imageUrl, isActive } = mission ?? {};

  const [activeTab, setActiveTab] = useState<
    (typeof SECTION_IDS)[keyof typeof SECTION_IDS] | undefined
  >(undefined);
  const [isTitleVisible, setIsTitleVisible] = useState(true);
  const titleRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isUserScrollingRef = useRef(false);

  useEffect(() => {
    const titleElement = titleRef.current;
    if (!titleElement) return;

    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (entry) {
          setIsTitleVisible(entry.isIntersecting);
        }
      },
      { threshold: 0 },
    );

    observer.observe(titleElement);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isTitleVisible) {
      setActiveTab(undefined);
    }
  }, [isTitleVisible]);

  useEffect(() => {
    const missionGuideEl = document.getElementById(SECTION_IDS.MISSION_GUIDE);
    const rewardEl = document.getElementById(SECTION_IDS.REWARD);

    const visibilityMap = new Map<string, boolean>();

    const observer = new IntersectionObserver(
      entries => {
        if (isUserScrollingRef.current) return;

        for (const entry of entries) {
          visibilityMap.set(entry.target.id, entry.isIntersecting);
        }

        const visibleSections = Array.from(visibilityMap.entries())
          .filter(([, isVisible]) => isVisible)
          .map(([id]) => id);

        if (visibleSections.length === 0) {
          setActiveTab(undefined);
        } else if (!isTitleVisible) {
          setActiveTab(visibleSections[0] as (typeof SECTION_IDS)[keyof typeof SECTION_IDS]);
        }
      },
      {
        rootMargin: "-80px 0px -85% 0px",
        threshold: 0,
      },
    );

    if (missionGuideEl) observer.observe(missionGuideEl);
    if (rewardEl) observer.observe(rewardEl);

    return () => observer.disconnect();
  }, [isTitleVisible]);

  const handleChangeTab = (value: string) => {
    if (value !== SECTION_IDS.MISSION_GUIDE && value !== SECTION_IDS.REWARD) {
      return;
    }

    isUserScrollingRef.current = true;
    setActiveTab(value);

    const container = scrollContainerRef.current;
    const element = document.getElementById(value);
    if (container && element) {
      const offset = SCROLL_OFFSET(value);
      container.scrollTo({
        top: element.offsetTop - offset,
        behavior: "smooth",
      });
    }

    setTimeout(() => {
      isUserScrollingRef.current = false;
    }, 500);
  };

  const { data: reward } = useReadReward(mission?.rewardId || "");
  const { data: participantInfo } = useReadMissionParticipantInfo(missionId);
  const { data: missionResponseData } = useReadMissionResponseForMission({ missionId });
  const { currentParticipants, maxParticipants } = participantInfo?.data ?? {};

  const sections = reward
    ? [SECTION_IDS.MISSION_GUIDE, SECTION_IDS.REWARD]
    : [SECTION_IDS.MISSION_GUIDE];

  const hasReward = !!reward?.data.id;

  const isProcessing = Boolean(missionResponseData?.data?.id);

  const calloutData = useMemo<{ variant: CalloutToneVariant; description: string } | null>(() => {
    const isLimitReached = checkParticipantLimitReached({
      maxParticipants,
      currentParticipants,
      hasExistingResponse: isProcessing,
    });

    if (isLimitReached) {
      return {
        variant: "notice",
        description: "정원이 마감되어, 이미 참여한 분들만 진행 가능해요.",
      };
    }
    if (
      currentParticipants &&
      maxParticipants &&
      currentParticipants / maxParticipants >= 0.9 &&
      !isProcessing
    ) {
      return {
        variant: "high-urgency",
        description: reward?.data.id
          ? `🚨 남은 리워드 단 ${maxParticipants - currentParticipants}개! 사라지기 전에 받아보세요`
          : `🚨 남은 인원 단 ${maxParticipants - currentParticipants}명! 빠르게 참여해보세요`,
      };
    }
    if (
      currentParticipants &&
      maxParticipants &&
      currentParticipants / maxParticipants >= 0.5 &&
      !isProcessing
    ) {
      return {
        variant: "early-urgency",
        description: reward?.data.id
          ? "리워드가 빠르게 줄고 있어요! 바로 참여해보세요"
          : "참여자가 많은 인기 미션이에요! 바로 참여해보세요",
      };
    }
    return null;
  }, [currentParticipants, maxParticipants, reward?.data.id, isProcessing]);

  return (
    <CalloutProvider position="top-center">
      <CalloutTrigger calloutData={calloutData} />
      <header className="sticky top-0 z-50 bg-white">
        <div
          className={cn(
            "overflow-hidden transition-all duration-300 px-5 flex items-center gap-2",
            isTitleVisible ? "max-h-0 opacity-0" : "max-h-12 opacity-100 pt-3",
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
      <main className="flex justify-center bg-white">
        <div
          ref={scrollContainerRef}
          className="relative w-full max-w-lg h-[calc(100svh-48px)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {imageUrl && (
            <div className="relative w-full min-h-[calc(100svh-120px)] aspect-9/16">
              <MissionImage imageUrl={imageUrl} />
              <div className="bg-linear-to-t from-black via-black/50 via-70% to-transparent absolute bottom-0 left-0 right-0 flex flex-col gap-6 pb-6 pt-12 px-5">
                <div ref={titleRef} className="flex flex-col gap-2">
                  <MissionLogo logoUrl={brandLogoUrl ?? undefined} />
                  <Typo.MainTitle size="large" className="break-keep text-white">
                    {title}
                  </Typo.MainTitle>
                </div>

                <div className="flex gap-3 items-center">
                  {isRequirePassword && <MissionBadge icon={<Lock />} label="비밀" />}
                  {hasReward && <MissionBadge icon={<Gift />} label="리워드" />}
                </div>
              </div>
            </div>
          )}

          {children}

          <div
            className="sticky bottom-0 z-60  border-zinc-100 pb-[calc(16px+env(safe-area-inset-bottom))]"
            style={{
              backgroundImage:
                "linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 40%, rgba(255, 255, 255, 1) 100%)",
              paddingBottom: "env(safe-area-inset-bottom)",
            }}
          >
            <BottomButton
              isActive={isActive ?? false}
              firstActionId={firstActionId ?? ""}
              initialError={initialError}
              deadline={deadline}
              showResumeModal={showResumeModal}
              isCompleted={isCompleted}
              hasReward={!!reward}
              isRequirePassword={isRequirePassword}
              hasExistingResponse={!!missionResponse}
            />
          </div>
        </div>
      </main>
    </CalloutProvider>
  );
}
