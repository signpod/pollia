"use client";

import { MissionIntroPage } from "@/components/common/pages/MissionIntroPage";
import { useMissionIntroData, useSurveyResume } from "@/hooks/mission";
import { useReadMissionResponseForMission } from "@/hooks/mission-response";
import { useReadMissionParticipantInfo } from "@/hooks/participant/useReadMissionParticipantInfo";
import { useReadReward } from "@/hooks/reward/useReadReward";
import { getActionNavCookie, setActionNavCookie } from "@/lib/cookie";
import { formatDateToLocalString } from "@/lib/date";
import { MissionType } from "@prisma/client";
import { CalloutProvider, type CalloutToneVariant, useCallout } from "@repo/ui/components";
import { addHours, isBefore } from "date-fns";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { MissionRewardData } from "./types/mission";
import { checkParticipantLimitReached } from "./utils/checkParticipantLimit";

interface MissionIntroContextValue {
  brandLogoUrl?: string;
  title?: string;
  titleRef?: React.RefObject<HTMLDivElement | null>;
}

export const MissionIntroContext = createContext<MissionIntroContextValue>({});

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

interface MissionPageWrapperProps {
  missionId: string;
  missionType: MissionType | null;
  missionTitle: string | null;
  missionImageUrl: string | null;
  description: string | null;
  reward: MissionRewardData | null;
}

export function MissionPageWrapper({
  missionId,
  missionType,
  missionTitle,
  missionImageUrl,
  description,
  reward,
}: MissionPageWrapperProps) {
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

  const { data: rewardQuery } = useReadReward(mission?.rewardId || "");
  const { data: participantInfo } = useReadMissionParticipantInfo(missionId);
  const { data: missionResponseData } = useReadMissionResponseForMission({ missionId });
  const { currentParticipants, maxParticipants } = participantInfo?.data ?? {};

  const showRewardWidget = !!rewardQuery?.data?.id;
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
        description: rewardQuery?.data?.id
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
        description: rewardQuery?.data?.id
          ? "리워드가 빠르게 줄고 있어요! 바로 참여해보세요"
          : "참여자가 많은 인기 미션이에요! 바로 참여해보세요",
      };
    }
    return null;
  }, [currentParticipants, maxParticipants, rewardQuery?.data?.id, isProcessing]);

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
          <MissionIntroPage
            imageUrl={imageUrl}
            brandLogoUrl={brandLogoUrl ?? undefined}
            title={title}
            formattedDeadline={formattedDeadline}
            isRequirePassword={isRequirePassword}
            showRewardWidget={showRewardWidget}
            rewardName={reward?.name ?? rewardQuery?.data?.name ?? ""}
            showDeadlineWidget={showDeadlineWidget}
            deadlineDate={deadlineDate}
            titleRef={titleRef}
            isActive={isActive ?? false}
            firstActionId={firstActionId ?? ""}
            deadline={deadline}
            showResumeModal={showResumeModal}
            isCompleted={isCompleted}
            hasExistingResponse={!!missionResponse}
            isResuming={isResuming}
            missionId={missionId}
            missionType={missionType}
            missionTitle={missionTitle}
            missionImageUrl={missionImageUrl}
            description={description}
            reward={reward}
          />
        </main>
      </MissionIntroContext.Provider>
    </CalloutProvider>
  );
}
