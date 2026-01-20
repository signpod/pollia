"use client";

import { ROUTES } from "@/constants/routes";
import { useKakaoLogin } from "@/hooks/login/useKakaoLogin";
import { ButtonV2, Typo } from "@repo/ui/components";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

export function LoginClient() {
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("next") ?? ROUTES.HOME;
  const { handleKakaoLogin, isKakaoSdkLoaded } = useKakaoLogin({ redirectPath });
  const hasTriggeredLogin = useRef(false);

  useEffect(() => {
    if (isKakaoSdkLoaded && !hasTriggeredLogin.current) {
      hasTriggeredLogin.current = true;
      handleKakaoLogin();
    }
  }, [isKakaoSdkLoaded, handleKakaoLogin]);

  return (
    <div className="flex flex-col items-center justify-center gap-1 my-auto">
      <Typo.MainTitle size="small">카카오 로그인 화면으로 이동합니다</Typo.MainTitle>
      <Typo.Body size="medium">
        화면이 자동으로 이동하지 않으면 아래 버튼을 눌러 다시 시도해주세요
      </Typo.Body>
      <ButtonV2 variant="primary" onClick={handleKakaoLogin}>
        <Typo.ButtonText size="large">재시도</Typo.ButtonText>
      </ButtonV2>
    </div>
  );
}
