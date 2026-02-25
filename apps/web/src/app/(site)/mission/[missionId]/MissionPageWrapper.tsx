"use client";

import { MissionIntroPage } from "@/components/common/pages/MissionIntroPage";
import { ROUTES } from "@/constants/routes";
import { useMissionIntroData, useSurveyResume } from "@/hooks/mission";
import { useReadMissionResponseForMission } from "@/hooks/mission-response";
import { useReadMissionParticipantInfo } from "@/hooks/participant/useReadMissionParticipantInfo";
import { useReadReward } from "@/hooks/reward/useReadReward";
import { useCurrentUser } from "@/hooks/user/useCurrentUser";
import { getActionNavCookie, setActionNavCookie } from "@/lib/cookie";
import { formatDateToLocalString } from "@/lib/date";
import { MissionType } from "@prisma/client";
import { CalloutProvider, type CalloutToneVariant, Typo, useCallout } from "@repo/ui/components";
import { addHours, isBefore } from "date-fns";
import { Settings } from "lucide-react";
import Link from "next/link";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { MissionRewardData } from "./types/mission";
import { BottomButton } from "./ui";
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

  const { data: currentUser } = useCurrentUser();
  const isCreator = currentUser?.id != null && currentUser.id === mission?.creatorId;

  const { brandLogoUrl, title, deadline, startDate, imageUrl, isActive } = mission ?? {};

  const titleRef = useRef<HTMLDivElement>(null);

  const { data: rewardQuery } = useReadReward(mission?.rewardId || "");
  const { data: participantInfo } = useReadMissionParticipantInfo(missionId);
  const { data: missionResponseData } = useReadMissionResponseForMission({ missionId });
  const { currentParticipants, maxParticipants } = participantInfo?.data ?? {};

  const showRewardWidget = !!rewardQuery?.data?.id;
  const deadlineDate = useMemo(() => (deadline ? new Date(deadline) : null), [deadline]);
  const startDateObj = useMemo(() => (startDate ? new Date(startDate) : null), [startDate]);
  const [showDeadlineWidget, setShowDeadlineWidget] = useState(false);
  const [showOpenWidget, setShowOpenWidget] = useState(false);
  const [formattedDeadline, setFormattedDeadline] = useState<string | null>(null);

  useEffect(() => {
    const now = new Date();

    if (deadlineDate) {
      const isExpired = isBefore(deadlineDate, now);
      const isWithin24h = isBefore(deadlineDate, addHours(now, 24));
      setShowDeadlineWidget(!isExpired && isWithin24h);
      setFormattedDeadline(formatDateToLocalString(deadlineDate).replaceAll("-", "."));
    }

    if (startDateObj) {
      const isNotOpenYet = isBefore(now, startDateObj);
      const isWithin24h = isBefore(startDateObj, addHours(now, 24));
      setShowOpenWidget(isNotOpenYet && isWithin24h);
    }
  }, [deadlineDate, startDateObj]);

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
        description: "정원이 마감되어, 이미 참여한 분들만 진행 가능해요",
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
        {isCreator && (
          <Link
            href={ROUTES.MISSION_MANAGE_ACTIONS(missionId)}
            className="flex items-center justify-center gap-2 border-b border-violet-100 bg-violet-50 px-4 py-2.5"
          >
            <Settings className="size-4 text-violet-600" />
            <Typo.Body size="small" className="font-medium text-violet-700">
              액션 설정하기
            </Typo.Body>
          </Link>
        )}
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
            showOpenWidget={showOpenWidget}
            openDate={startDateObj}
            titleRef={titleRef}
            contextBrandLogoUrl={brandLogoUrl ?? undefined}
            contextTitle={title}
            missionId={missionId}
            missionType={missionType}
            missionTitle={missionTitle}
            missionImageUrl={missionImageUrl}
            description={description}
            reward={reward}
            bottomButton={
              <BottomButton
                isActive={isActive ?? false}
                firstActionId={firstActionId ?? ""}
                deadline={deadline ?? undefined}
                showResumeModal={showResumeModal}
                isCompleted={isCompleted}
                isRequirePassword={isRequirePassword}
                hasExistingResponse={!!missionResponse}
                isResuming={isResuming}
              />
            }
          />
        </main>
      </MissionIntroContext.Provider>
    </CalloutProvider>
  );
}
