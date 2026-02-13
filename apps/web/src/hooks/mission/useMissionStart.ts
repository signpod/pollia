"use client";

import { getMissionParticipantInfo } from "@/actions/mission";
import { getMyResponseForMission } from "@/actions/mission-response";
import { toast } from "@/components/common/Toast";
import { ROUTES } from "@/constants/routes";
import { useKakaoLogin } from "@/hooks/login/useKakaoLogin";
import {
  useCreateMissionResponse,
  useReadMissionResponseForMission,
} from "@/hooks/mission-response";
import { useReadMissionParticipantInfo } from "@/hooks/participant";
import { useAuth } from "@/hooks/user/useAuth";
import { setActionNavCookie } from "@/lib/cookie";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { checkParticipantLimitReached } from "../../app/mission/[missionId]/utils/checkParticipantLimit";

interface UseMissionStartParams {
  missionId: string;
  firstActionId?: string;
  isRequirePassword: boolean;
  hasExistingResponse: boolean;
  showResumeModal?: () => boolean;
  isResuming: boolean;
}

export function useMissionStart({
  missionId,
  firstActionId,
  isRequirePassword,
  hasExistingResponse,
  showResumeModal,
  isResuming,
}: UseMissionStartParams) {
  const { isLoggedIn } = useAuth();
  const { handleKakaoLogin } = useKakaoLogin({
    redirectPath: ROUTES.MISSION(missionId),
  });
  const router = useRouter();

  const { data: missionParticipantInfo } = useReadMissionParticipantInfo(missionId);
  const { data: missionResponseData } = useReadMissionResponseForMission({ missionId });
  const { startResponse } = useCreateMissionResponse({ missionId });
  const { mutateAsync: handleStartResponse } = startResponse;

  const hasMissionResponse = Boolean(missionResponseData?.data?.id);

  const { currentParticipants, maxParticipants } = missionParticipantInfo?.data ?? {};
  const isParticipantLimitReached = checkParticipantLimitReached({
    maxParticipants,
    currentParticipants,
    hasExistingResponse: hasMissionResponse,
  });

  const [isStarting, setIsStarting] = useState(false);
  const isActionInitiatedRef = useRef(false);

  const startMissionAndNavigate = useCallback(
    async (actionId: string) => {
      try {
        setIsStarting(true);
        setActionNavCookie(missionId, "initial");
        await handleStartResponse({ missionId });
        router.push(ROUTES.ACTION({ missionId, actionId }));
      } catch {
        isActionInitiatedRef.current = false;
        setIsStarting(false);
        toast.warning("미션 시작에 실패했어요. 다시 시도해주세요", {
          id: "start-mission-error",
        });
      }
    },
    [missionId, handleStartResponse, router],
  );

  const handleClick = useCallback(async () => {
    if (isStarting || isResuming || isActionInitiatedRef.current) return;
    isActionInitiatedRef.current = true;

    const [latestParticipantInfo, latestMissionResponse] = await Promise.all([
      getMissionParticipantInfo(missionId),
      isLoggedIn ? getMyResponseForMission(missionId) : Promise.resolve({ data: null }),
    ]);

    const hasLatestMissionResponse = Boolean(latestMissionResponse?.data?.id);
    const { currentParticipants: latestCurrent, maxParticipants: latestMax } =
      latestParticipantInfo?.data ?? {};

    const isLimitReached = checkParticipantLimitReached({
      maxParticipants: latestMax,
      currentParticipants: latestCurrent,
      hasExistingResponse: hasLatestMissionResponse,
    });

    if (isLimitReached) {
      isActionInitiatedRef.current = false;
      toast.warning("참여 정원이 마감되었어요", { id: "participant-limit-error" });
      return;
    }

    if (!isLoggedIn) {
      handleKakaoLogin();
      return;
    }

    if (isRequirePassword && !hasExistingResponse) {
      router.push(ROUTES.MISSION_PASSWORD(missionId));
      return;
    }

    if (showResumeModal) {
      const modalShown = showResumeModal();
      if (modalShown) {
        isActionInitiatedRef.current = false;
        return;
      }
    }

    if (firstActionId) {
      await startMissionAndNavigate(firstActionId);
    } else {
      isActionInitiatedRef.current = false;
    }
  }, [
    isStarting,
    isResuming,
    missionId,
    isLoggedIn,
    handleKakaoLogin,
    isRequirePassword,
    hasExistingResponse,
    showResumeModal,
    firstActionId,
    startMissionAndNavigate,
    router,
  ]);

  return {
    handleClick,
    isStarting,
    isLoggedIn,
    hasMissionResponse,
    isParticipantLimitReached,
  };
}

export type UseMissionStartReturn = ReturnType<typeof useMissionStart>;
