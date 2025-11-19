"use client";
import { AuthError, useKakaoLogin } from "@/hooks/login/useKakaoLogin";
import { FixedBottomLayout, KakaoLoginButton, Tooltip, Typo } from "@repo/ui/components";
import { useSearchParams } from "next/navigation";
import { OnboardingCarousel } from "./OnboardingCarousel";

interface LoginClientProps {
  initialError: AuthError | null;
}

export function LoginClient({ initialError }: LoginClientProps) {
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("next") ?? "/";
  const { handleKakaoLogin } = useKakaoLogin({ initialError, redirectPath });

  return (
    <>
      <OnboardingCarousel />
      <div className="h-[166px]" />

      <FixedBottomLayout.Content className="flex w-full justify-center bg-white">
        <div className="flex w-full max-w-lg flex-col justify-center p-5">
          <div className="h-[82px] w-full" />
          <Tooltip id="kakao-login-tooltip" className="animate-bounce">
            <Typo.Body size="medium">⚡️ 3초만에 시작하기</Typo.Body>
          </Tooltip>
          <KakaoLoginButton data-tooltip-id="kakao-login-tooltip" onClick={handleKakaoLogin} />
        </div>
      </FixedBottomLayout.Content>
    </>
  );
}
