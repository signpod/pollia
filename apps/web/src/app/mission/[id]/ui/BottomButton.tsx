import { ROUTES } from "@/constants/routes";
import { AuthError, useKakaoLogin } from "@/hooks/login/useKakaoLogin";
import { useAuth } from "@/hooks/user/useAuth";
import { Mission } from "@prisma/client";
import KakaoIcon from "@public/svgs/kakao-icon.svg";
import { ButtonV2, Tooltip, Typo } from "@repo/ui/components";
import { isBefore } from "date-fns";
import { useRouter } from "next/navigation";

const TOOLTIP_TEXT = {
  loggedOut: "로그인 후 리워드를 받아보세요 🎁",
};

const BUTTON_TEXT = {
  loggedIn: "참여하고 리워드 받기",
  loggedOut: "카카오 로그인 후 참여하기",
  expired: "응답 기간이 마감되었어요",
  alreadyCompleted: "이미 응답한 설문이에요",
};

interface BottomButtonProps {
  params: { id: string };
  firstActionId?: string;
  initialError: AuthError | null;
  deadline?: Mission["deadline"];
  showResumeModal?: () => boolean;
  isCompleted: boolean;
}

export function BottomButton({
  params,
  firstActionId,
  initialError,
  deadline,
  showResumeModal,
  isCompleted,
}: BottomButtonProps) {
  const { handleKakaoLogin } = useKakaoLogin({
    initialError,
    redirectPath: ROUTES.MISSION(params.id),
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
        router.push(ROUTES.ACTION(firstActionId));
      }
    } else if (firstActionId) {
      router.push(ROUTES.ACTION(firstActionId));
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
          <Typo.Body size="medium">{TOOLTIP_TEXT.loggedOut}</Typo.Body>
        </Tooltip>
        <div className="py-3 px-4">
          <ButtonV2 variant="primary" size="large" className="w-full" onClick={handleClick}>
            <Typo.ButtonText size="large" className="flex w-full items-center justify-center gap-3">
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
        <Typo.ButtonText size="large" className="flex w-full items-center justify-center gap-3">
          {BUTTON_TEXT.loggedIn}
        </Typo.ButtonText>
      </ButtonV2>
    </div>
  );
}
