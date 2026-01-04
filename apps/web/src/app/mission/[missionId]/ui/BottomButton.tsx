"use client";

import { toast } from "@/components/common/Toast";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import { ROUTES } from "@/constants/routes";
import { AuthError, useKakaoLogin } from "@/hooks/login/useKakaoLogin";
import {
  useCreateMissionResponse,
  useReadMissionResponseForMission,
} from "@/hooks/mission-response";
import { useReadMissionParticipantInfo } from "@/hooks/participant";
import { useAuth } from "@/hooks/user/useAuth";
import { Mission } from "@prisma/client";
import KakaoIcon from "@public/svgs/kakao-icon.svg";
import { ButtonV2, Tooltip, Typo } from "@repo/ui/components";
import { useQueryClient } from "@tanstack/react-query";
import { isBefore } from "date-fns";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { checkParticipantLimitReached } from "../utils/checkParticipantLimit";

const TOOLTIP_TEXT = {
  loggedOut: "리워드를 받으려면 로그인이 필요해요 🎁",
  loggedOutWithoutModal: "참여하려면 로그인이 필요해요 🍀",
};

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
  initialError: AuthError | null;
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
  initialError,
  deadline,
  isActive,
  hasReward = false,
  showResumeModal,
  isCompleted,
  isRequirePassword,
  hasExistingResponse,
}: BottomButtonProps) {
  const queryClient = useQueryClient();
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
    initialError,
    redirectPath: ROUTES.MISSION(missionId),
  });
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  const isExpired = Boolean(deadline && isBefore(deadline, new Date())) || !isActive;

  const isDisabled = isExpired || !firstActionId;
  const alreadyCompleted = isCompleted;

  const { startResponse } = useCreateMissionResponse({ missionId });
  const { mutateAsync: handleStartResponse } = startResponse;

  const handleClick = async () => {
    await Promise.all([
      queryClient.refetchQueries({ queryKey: missionQueryKeys.missionParticipant(missionId) }),
      queryClient.refetchQueries({
        queryKey: missionQueryKeys.missionResponseForMission(missionId),
      }),
    ]);

    const latestParticipantInfo = queryClient.getQueryData<typeof missionParticipantInfo>(
      missionQueryKeys.missionParticipant(missionId),
    );
    const latestMissionResponse = queryClient.getQueryData<typeof missionResponseData>(
      missionQueryKeys.missionResponseForMission(missionId),
    );

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
        handleStartResponse({ missionId });
        router.push(ROUTES.ACTION({ missionId, actionId: firstActionId }));
      }
    } else if (firstActionId) {
      handleStartResponse({ missionId });
      router.push(ROUTES.ACTION({ missionId, actionId: firstActionId }));
    }
  };

  if (isParticipantLimitReached) {
    return (
      <div className="py-3 px-4 w-full">
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
      <div className="py-3 px-4 w-full">
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
      <div data-tooltip-id="tooltip-id" className="w-full">
        <Tooltip id="tooltip-id" placement="top">
          <Typo.Body size="medium">
            {hasReward ? TOOLTIP_TEXT.loggedOut : TOOLTIP_TEXT.loggedOutWithoutModal}
          </Typo.Body>
        </Tooltip>
        <div className="py-3 px-4">
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
      </div>
    );
  }

  return (
    <div className="py-3 px-4 w-full">
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
