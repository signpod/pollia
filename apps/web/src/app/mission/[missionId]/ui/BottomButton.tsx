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
import { Mission } from "@prisma/client";
import KakaoIcon from "@public/svgs/kakao-icon.svg";
import { ButtonV2, Typo } from "@repo/ui/components";
import { isBefore } from "date-fns";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { checkParticipantLimitReached } from "../utils/checkParticipantLimit";

const BUTTON_TEXT = {
  loggedIn: "지금 바로 참여하기",
  resume: "이어서 진행하기",
  loggedOut: "카카오로 로그인하기",
  expired: "마감된 미션이에요",
  alreadyCompleted: "이미 완료한 미션이에요",
  participantLimitReached: "마감된 미션이에요",
};

interface BottomButtonProps {
  firstActionId?: string;
  deadline?: Mission["deadline"];
  showResumeModal?: () => boolean;
  isCompleted: boolean;
  isActive: boolean;
  hasReward: boolean;
  isRequirePassword: boolean;
  hasExistingResponse: boolean;
}

export function BottomButton({
  firstActionId,
  deadline,
  isActive,
  showResumeModal,
  isCompleted,
  isRequirePassword,
  hasExistingResponse,
}: BottomButtonProps) {
  const { missionId } = useParams<{ missionId: string }>();
  const { data: missionParticipantInfo } = useReadMissionParticipantInfo(missionId);
  const { data: missionResponseData } = useReadMissionResponseForMission({ missionId });

  const hasMissionResponse = Boolean(missionResponseData?.data?.id);

  const { currentParticipants, maxParticipants } = missionParticipantInfo?.data ?? {};

  const isParticipantLimitReached = checkParticipantLimitReached({
    maxParticipants,
    currentParticipants,
    hasExistingResponse: hasMissionResponse,
  });

  const { handleKakaoLogin } = useKakaoLogin({
    redirectPath: ROUTES.MISSION(missionId),
  });
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  const [isExpired, setIsExpired] = useState(!isActive);

  useEffect(() => {
    const isDeadlinePassed = Boolean(deadline && isBefore(deadline, new Date()));
    setIsExpired(isDeadlinePassed || !isActive);
  }, [deadline, isActive]);

  const isDisabled = isExpired || !firstActionId;
  const alreadyCompleted = isCompleted;

  const { startResponse } = useCreateMissionResponse({ missionId });
  const { mutateAsync: handleStartResponse } = startResponse;

  const handleClick = async () => {
    // 서버에서 직접 최신 데이터를 가져옴 (캐시 업데이트 없이 체크만)
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
      toast.warning("참여 정원이 마감되었어요.", { id: "participant-limit-error" });
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
      if (!modalShown && firstActionId) {
        try {
          setActionNavCookie(missionId, "initial");
          await handleStartResponse({ missionId });
          router.push(ROUTES.ACTION({ missionId, actionId: firstActionId }));
        } catch {
          toast.warning("미션 시작에 실패했어요. 다시 시도해주세요.", {
            id: "start-mission-error",
          });
        }
      }
    } else if (firstActionId) {
      try {
        setActionNavCookie(missionId, "initial");
        await handleStartResponse({ missionId });
        router.push(ROUTES.ACTION({ missionId, actionId: firstActionId }));
      } catch {
        toast.warning("미션 시작에 실패했어요. 다시 시도해주세요.", { id: "start-mission-error" });
      }
    }
  };

  if (isParticipantLimitReached) {
    return (
      <div className="relative py-3 px-4 w-full">
        <ButtonV2 variant="primary" size="large" className="w-full" disabled>
          <Typo.ButtonText size="large" className="flex w-full items-center justify-center gap-3">
            {BUTTON_TEXT.participantLimitReached}
          </Typo.ButtonText>
        </ButtonV2>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="py-3 px-4 w-full">
        <ButtonV2 variant="primary" size="large" className="w-full" disabled>
          <Typo.ButtonText size="large" className="flex w-full items-center justify-center gap-3">
            {BUTTON_TEXT.expired}
          </Typo.ButtonText>
        </ButtonV2>
      </div>
    );
  }

  if (alreadyCompleted) {
    return (
      <div className="relative py-3 px-4 w-full">
        <ButtonV2 variant="primary" size="large" className="w-full" disabled>
          <Typo.ButtonText size="large" className="flex w-full items-center justify-center gap-3">
            {BUTTON_TEXT.alreadyCompleted}
          </Typo.ButtonText>
        </ButtonV2>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="relative py-3 px-4 w-full" suppressHydrationWarning>
        <ButtonV2
          variant="primary"
          size="large"
          className="w-full bg-kakao hover:bg-kakao active:bg-kakao focus:bg-kakao"
          onClick={handleClick}
        >
          <Typo.ButtonText
            size="large"
            className="flex w-full items-center justify-center gap-3 text-default"
          >
            <KakaoIcon className="size-6" />
            {BUTTON_TEXT.loggedOut}
          </Typo.ButtonText>
        </ButtonV2>
      </div>
    );
  }

  return (
    <div className="relative py-3 px-4 w-full" suppressHydrationWarning>
      <ButtonV2
        variant="primary"
        size="large"
        className="w-full"
        onClick={handleClick}
        disabled={isDisabled}
      >
        <Typo.ButtonText size="large" className="relative m-auto flex justify-center items-center">
          {hasMissionResponse ? BUTTON_TEXT.resume : BUTTON_TEXT.loggedIn}
          <motion.div
            className="absolute right-[-32px] top-0"
            animate={{ x: [0, 10, 0] }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          >
            <Typo.ButtonText size="large" className="w-full">
              👉
            </Typo.ButtonText>
          </motion.div>
        </Typo.ButtonText>
      </ButtonV2>
    </div>
  );
}
