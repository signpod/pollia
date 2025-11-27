import { ROUTES } from "@/constants/routes";
import { AuthError, useKakaoLogin } from "@/hooks/login/useKakaoLogin";
import { useAuth } from "@/hooks/user/useAuth";
import { Survey } from "@prisma/client";
import KakaoIcon from "@public/svgs/kakao-icon.svg";
import { ButtonV2, Tooltip, Typo } from "@repo/ui/components";
import { isBefore } from "date-fns";
import { useRouter } from "next/navigation";

const LOGIN_BUTTON_TEXT = {
  loggedOutTooltip: "로그인 후 리워드를 받아보세요 🎁",
  loggedIn: "참여하고 리워드 받기",
  loggedOut: "카카오 로그인 후 참여하기",
};

interface BottomButtonProps {
  params: { id: string };
  firstQuestionId?: string;
  initialError: AuthError | null;
  deadline?: Survey["deadline"];
}

export function BottomButton({
  params,
  firstQuestionId,
  initialError,
  deadline,
}: BottomButtonProps) {
  const { handleKakaoLogin } = useKakaoLogin({
    initialError,
    redirectPath: ROUTES.SURVEY(params.id),
  });
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  const isExpired = Boolean(deadline && isBefore(deadline, new Date()));
  const isDisabled = isExpired || !firstQuestionId;

  const handleClick = () => {
    if (!isLoggedIn) {
      handleKakaoLogin();
    } else if (firstQuestionId) {
      router.push(ROUTES.SURVEY_QUESTION(firstQuestionId));
    }
  };

  if (isExpired) {
    return (
      <div className="py-3 px-4 w-full">
        <ButtonV2 variant="primary" size="large" className="w-full" disabled>
          <Typo.ButtonText size="large" className="flex w-full items-center justify-center gap-3">
            응답 기간이 마감되었어요
          </Typo.ButtonText>
        </ButtonV2>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div data-tooltip-id="tooltip-id" className="w-full">
        <Tooltip id="tooltip-id" placement="top">
          <Typo.Body size="medium">{LOGIN_BUTTON_TEXT.loggedOutTooltip}</Typo.Body>
        </Tooltip>
        <div className="py-3 px-4">
          <ButtonV2 variant="primary" size="large" className="w-full" onClick={handleClick}>
            <Typo.ButtonText size="large" className="flex w-full items-center justify-center gap-3">
              <KakaoIcon className="size-6" />
              {LOGIN_BUTTON_TEXT.loggedOut}
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
          {LOGIN_BUTTON_TEXT.loggedIn}
        </Typo.ButtonText>
      </ButtonV2>
    </div>
  );
}
