import { AuthError, useKakaoLogin } from "@/hooks/login/useKakaoLogin";
import { useAuth } from "@/hooks/user/useAuth";
import KakaoIcon from "@public/svgs/kakao-icon.svg";
import { ButtonV2, Tooltip, Typo } from "@repo/ui/components";
import { useRouter } from "next/navigation";

const LOGIN_BUTTON_TEXT = {
  loggedOutTooltip: "로그인 후 리워드를 받아보세요 🎁",
  loggedIn: "참여하고 리워드 받기",
  loggedOut: "카카오 로그인 후 참여하기",
};

export function BottomButton({
  params,
  initialError,
}: { params: { id: string }; initialError: AuthError | null }) {
  const { handleKakaoLogin } = useKakaoLogin(initialError);
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  const handleClick = () => {
    if (!isLoggedIn) {
      handleKakaoLogin();
    } else {
      router.push(`/survey/${params.id}/question`);
    }
  };

  return (
    <div data-tooltip-id="tooltip-id" className="w-full">
      {!isLoggedIn && (
        <Tooltip id="tooltip-id" placement="top">
          <Typo.Body size="medium">{LOGIN_BUTTON_TEXT.loggedOutTooltip}</Typo.Body>
        </Tooltip>
      )}
      <div className="py-3 px-4">
        <ButtonV2 variant="primary" size="large" className="w-full" onClick={handleClick}>
          <Typo.ButtonText size="large" className="flex w-full items-center justify-center gap-3">
            {!isLoggedIn && <KakaoIcon className="size-6" />}
            {isLoggedIn ? LOGIN_BUTTON_TEXT.loggedIn : LOGIN_BUTTON_TEXT.loggedOut}
          </Typo.ButtonText>
        </ButtonV2>
      </div>
    </div>
  );
}
