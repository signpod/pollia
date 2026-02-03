"use client";

import { useMissionStart } from "@/hooks/mission/useMissionStart";
import { Mission } from "@prisma/client";
import KakaoIcon from "@public/svgs/kakao-icon.svg";
import { ButtonV2, Typo } from "@repo/ui/components";
import { isBefore } from "date-fns";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const BUTTON_TEXT = {
  loggedIn: "지금 바로 참여하기",
  resume: "이어서 진행하기",
  loggedOut: "카카오로 로그인하기",
  expired: "마감된 미션이에요",
  notActive: "현재 참여할 수 없는 미션이에요",
  alreadyCompleted: "이미 완료한 미션이에요",
  participantLimitReached: "마감된 미션이에요",
};

const BOUNCE_ANIMATION = { x: [0, 10, 0] };
const BOUNCE_TRANSITION = {
  duration: 1,
  repeat: Number.POSITIVE_INFINITY,
  ease: "easeInOut" as const,
};

function DisabledButton({ text }: { text: string }) {
  return (
    <div className="relative py-3 px-4 w-full">
      <ButtonV2 variant="primary" size="large" className="w-full" disabled>
        <Typo.ButtonText size="large" className="flex w-full items-center justify-center gap-3">
          {text}
        </Typo.ButtonText>
      </ButtonV2>
    </div>
  );
}

interface BottomButtonProps {
  firstActionId?: string;
  deadline?: Mission["deadline"];
  showResumeModal?: () => boolean;
  isCompleted: boolean;
  isActive: boolean;
  isRequirePassword: boolean;
  hasExistingResponse: boolean;
  isResuming?: boolean;
}

export function BottomButton({
  firstActionId,
  deadline,
  isActive,
  showResumeModal,
  isCompleted,
  isRequirePassword,
  hasExistingResponse,
  isResuming = false,
}: BottomButtonProps) {
  const { missionId } = useParams<{ missionId: string }>();

  const {
    handleClick,
    isStarting,
    isLoggedIn,
    hasMissionResponse,
    isParticipantLimitReached,
  } = useMissionStart({
    missionId,
    firstActionId,
    isRequirePassword,
    hasExistingResponse,
    showResumeModal,
    isResuming,
  });

  const [isDeadlinePassed, setIsDeadlinePassed] = useState(false);

  useEffect(() => {
    if (deadline) {
      setIsDeadlinePassed(isBefore(deadline, new Date()));
    }
  }, [deadline]);

  if (isParticipantLimitReached) {
    return <DisabledButton text={BUTTON_TEXT.participantLimitReached} />;
  }

  if (!isActive) {
    return <DisabledButton text={BUTTON_TEXT.notActive} />;
  }

  if (isDeadlinePassed) {
    return <DisabledButton text={BUTTON_TEXT.expired} />;
  }

  if (isCompleted) {
    return <DisabledButton text={BUTTON_TEXT.alreadyCompleted} />;
  }

  if (!isLoggedIn) {
    return (
      <div className="relative py-3 px-4 w-full">
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
    <div className="relative py-3 px-4 w-full">
      <ButtonV2
        variant="primary"
        size="large"
        className="w-full"
        onClick={handleClick}
        disabled={isDeadlinePassed || !firstActionId}
        loading={isStarting || isResuming}
      >
        <Typo.ButtonText size="large" className="relative m-auto flex justify-center items-center">
          {hasMissionResponse ? BUTTON_TEXT.resume : BUTTON_TEXT.loggedIn}
          <motion.div
            className="absolute right-[-32px] top-0"
            animate={BOUNCE_ANIMATION}
            transition={BOUNCE_TRANSITION}
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
