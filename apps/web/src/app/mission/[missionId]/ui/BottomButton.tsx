import { ROUTES } from "@/constants/routes";
import { AuthError, useKakaoLogin } from "@/hooks/login/useKakaoLogin";
import { useAuth } from "@/hooks/user/useAuth";
import { Mission } from "@prisma/client";
import KakaoIcon from "@public/svgs/kakao-icon.svg";
import { ButtonV2, Tooltip, Typo } from "@repo/ui/components";
import { isBefore } from "date-fns";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";

const TOOLTIP_TEXT = {
  loggedOut: "리워드를 받으려면 로그인이 필요해요 🎁",
  loggedOutWithoutModal: "참여하려면 로그인이 필요해요 🍀",
};

const BUTTON_TEXT = {
  loggedIn: "지금 바로 참여하기",
  loggedOut: "카카오로 로그인하기",
  expired: "응답 기간이 마감되었어요",
  alreadyCompleted: "이미 완료한 미션이에요",
};

interface BottomButtonProps {
  firstActionId?: string;
  initialError: AuthError | null;
  deadline?: Mission["deadline"];
  showResumeModal?: () => boolean;
  isCompleted: boolean;
  hasReward: boolean;
}

export function BottomButton({
  firstActionId,
  initialError,
  deadline,
  hasReward = false,
  showResumeModal,
  isCompleted,
}: BottomButtonProps) {
  const { missionId } = useParams<{ missionId: string }>();
  const { handleKakaoLogin } = useKakaoLogin({
    initialError,
    redirectPath: ROUTES.MISSION(missionId),
  });
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  const isExpired = Boolean(deadline && isBefore(deadline, new Date()));

  const isDisabled = isExpired || !firstActionId;
  const alreadyCompleted = isCompleted;

  const handleClick = () => {
    if (!isLoggedIn) {
      handleKakaoLogin();
    } else if (showResumeModal) {
      const modalShown = showResumeModal();
      if (!modalShown && firstActionId) {
        router.push(ROUTES.ACTION({ missionId, actionId: firstActionId }));
      }
    } else if (firstActionId) {
      router.push(ROUTES.ACTION({ missionId, actionId: firstActionId }));
    }
  };

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
          {BUTTON_TEXT.loggedIn}
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
