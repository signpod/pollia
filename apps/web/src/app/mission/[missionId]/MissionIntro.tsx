"use client";

import { useMissionIntroData, useSurveyResume } from "@/hooks/mission";
import { useReadMissionResponseForMission } from "@/hooks/mission-response";
import { useReadMissionParticipantInfo } from "@/hooks/participant/useReadMissionParticipantInfo";
import { useReadReward } from "@/hooks/reward/useReadReward";
import { getActionNavCookie, setActionNavCookie } from "@/lib/cookie";
import { formatDateToLocalString } from "@/lib/date";
import { cn } from "@/lib/utils";
import ClockIcon from "@public/svgs/clock-color-icon.svg";
import GiftIcon from "@public/svgs/gift-color-icon.svg";
import Lock from "@public/svgs/lock.svg";
import {
  ButtonV2,
  CalloutProvider,
  type CalloutToneVariant,
  Typo,
  useCallout,
} from "@repo/ui/components";
import { addHours, isBefore } from "date-fns";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { FixedBottomContent } from "../../../../../../packages/ui/src/components/layout/FixedBottomLayout";
import { MissionImage, MissionLogo, MissionWidget } from "./components";
import { BottomButton } from "./ui";
import { checkParticipantLimitReached } from "./utils/checkParticipantLimit";
const SCROLL_OFFSET = 10;

interface MissionIntroContextValue {
  brandLogoUrl?: string;
  title?: string;
  titleRef?: React.RefObject<HTMLDivElement | null>;
}

const MissionIntroContext = createContext<MissionIntroContextValue>({});

export function useMissionIntroContext() {
  return useContext(MissionIntroContext);
}

function CalloutTrigger({
  calloutData,
  isLoading,
}: {
  calloutData: { variant: CalloutToneVariant; description: string } | null;
  isLoading: boolean;
}) {
  const { show } = useCallout();
  const hasShownRef = useRef(false);

  useEffect(() => {
    if (calloutData && !hasShownRef.current && !isLoading) {
      hasShownRef.current = true;
      show({
        description: calloutData.description,
        variant: calloutData.variant,
        duration: Number.POSITIVE_INFINITY,
      });
    }
  }, [calloutData, show, isLoading]);

  return null;
}

interface MissionIntroProps {
  children: ReactNode;
}

export function MissionIntro({ children }: MissionIntroProps) {
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

  const { showResumeModal, isResuming } = useSurveyResume({
    isEnabledToResume,
    nextActionId,
    firstActionId,
    missionId,
    responseId: missionResponse?.id ?? "",
  });

  const { brandLogoUrl, title, deadline, imageUrl, isActive } = mission ?? {};

  const titleRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 5);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const { data: reward } = useReadReward(mission?.rewardId || "");
  const { data: participantInfo } = useReadMissionParticipantInfo(missionId);
  const { data: missionResponseData } = useReadMissionResponseForMission({ missionId });
  const { currentParticipants, maxParticipants } = participantInfo?.data ?? {};

  const showRewardWidget = !!reward?.data.id;
  const deadlineDate = useMemo(() => (deadline ? new Date(deadline) : null), [deadline]);
  const [showDeadlineWidget, setShowDeadlineWidget] = useState(false);
  const [formattedDeadline, setFormattedDeadline] = useState<string | null>(null);

  useEffect(() => {
    if (deadlineDate) {
      const now = new Date();
      setShowDeadlineWidget(isBefore(deadlineDate, addHours(now, 24)));
      setFormattedDeadline(formatDateToLocalString(deadlineDate).replaceAll("-", "."));
    }
  }, [deadlineDate]);

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

  const contextValue = useMemo<MissionIntroContextValue>(
    () => ({
      brandLogoUrl: brandLogoUrl ?? undefined,
      title,
      titleRef,
    }),
    [brandLogoUrl, title],
  );

  return (
    <CalloutProvider position="top-center">
      <CalloutTrigger calloutData={calloutData} isLoading={isResuming} />
      <MissionIntroContext.Provider value={contextValue}>
        <main className="flex justify-center bg-background">
          <div className="relative w-full max-w-lg">
            {imageUrl && (
              <div className="relative w-full h-svh min-h-svh">
                <MissionImage imageUrl={imageUrl} />
                <div className="bg-linear-to-t from-black via-black/50 via-70% to-transparent absolute bottom-0 left-0 right-0 z-10 flex flex-col gap-6 pb-6 pt-12 px-5">
                  <div ref={titleRef} className="flex flex-col gap-3 justify-center items-center">
                    <MissionLogo logoUrl={brandLogoUrl ?? undefined} />
                    <div className="flex flex-col gap-1 justify-center items-center">
                      <div className="break-keep text-white text-center">
                        <Typo.MainTitle size="large" className="inline text-white">
                          {title}
                        </Typo.MainTitle>
                        {isRequirePassword && (
                          <Lock className="size-5 text-white inline-block ml-1 align-[0.1em]" />
                        )}
                      </div>
                      {formattedDeadline && (
                        <Typo.Body size="medium" className="text-zinc-300">
                          {`${formattedDeadline} 까지`}
                        </Typo.Body>
                      )}
                    </div>
                  </div>
                  {(showRewardWidget || showDeadlineWidget) && (
                    <div className="flex flex-col gap-2">
                      {showRewardWidget && (
                        <MissionWidget
                          icon={<GiftIcon className="size-5" />}
                          descType="text"
                          title="완료 리워드"
                          description={reward?.data.name ?? ""}
                        />
                      )}
                      {showDeadlineWidget && deadlineDate && (
                        <MissionWidget
                          icon={<ClockIcon className="size-5" />}
                          descType="clock"
                          title="종료까지"
                          deadline={deadlineDate}
                        />
                      )}
                    </div>
                  )}

                  <div className="relative z-10">
                    <ButtonV2
                      variant="tertiary"
                      size="large"
                      className="w-full rounded-full h-12 hover:bg-transparent"
                      onClick={() => {
                        window.scrollTo({
                          top: window.innerHeight + SCROLL_OFFSET,
                          behavior: "smooth",
                        });
                      }}
                    >
                      <div className="flex items-center justify-center w-full gap-3">
                        <motion.div
                          animate={{ y: [-2, 2, -2] }}
                          transition={{
                            duration: 1,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "easeInOut",
                          }}
                          className="size-6"
                          style={{
                            background:
                              "linear-gradient(to bottom, rgba(255,255,255,0.3), rgba(255,255,255,1))",
                            WebkitMaskImage: "url('/svgs/chevron-double-down-color.svg')",
                            maskImage: "url('/svgs/chevron-double-down-color.svg')",
                            WebkitMaskSize: "contain",
                            maskSize: "contain",
                            WebkitMaskRepeat: "no-repeat",
                            maskRepeat: "no-repeat",
                            WebkitMaskPosition: "center",
                            maskPosition: "center",
                          }}
                        />

                        <Typo.ButtonText size="large" className="text-white">
                          아래로 내려보세요
                        </Typo.ButtonText>
                      </div>
                    </ButtonV2>
                  </div>
                </div>
              </div>
            )}

            {children}

            <FixedBottomContent
              className={isScrolled ? "bg-transparent" : "bg-transparent pointer-events-none"}
            >
              {/**  블러 배경 (별도 레이어) - opacity 애니메이션 */}
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
              {/**  fixed bottom 버튼 */}
              <div
                className={cn(
                  "sticky bottom-0 z-60 border-zinc-100 transition-all duration-300 ease-out",
                  isScrolled
                    ? "opacity-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 translate-y-full pointer-events-none",
                )}
                style={{
                  paddingBottom: "calc(16px + env(safe-area-inset-bottom))",
                }}
              >
                <BottomButton
                  isActive={isActive ?? false}
                  firstActionId={firstActionId ?? ""}
                  deadline={deadline}
                  showResumeModal={showResumeModal}
                  isCompleted={isCompleted}
                  isRequirePassword={isRequirePassword}
                  hasExistingResponse={!!missionResponse}
                  isResuming={isResuming}
                />
              </div>
            </FixedBottomContent>
          </div>
        </main>
      </MissionIntroContext.Provider>
    </CalloutProvider>
  );
}
