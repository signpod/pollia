"use client";

import { useCallback } from "react";
import {
  FixedBottomLayout,
  KakaoLoginButton,
  Tooltip,
  Typo,
} from "@repo/ui/components";
import { OnboardingCarousel } from "./OnboardingCarousel";
import { createClient as createSupabaseClient } from "@/database/utils/supabase/client";

export default function LoginPage() {
  const handleKakaoLogin = useCallback(async () => {
    const supabase = createSupabaseClient();

    document.cookie = `auth_redirect=/login/done; path=/; max-age=300; SameSite=Lax`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error("카카오 로그인 에러:", error);
    }
  }, []);

  return (
    <>
      <OnboardingCarousel />

      {/*TODO: 디자인 가이드 확인 후 삭제. 임시로 바텀 GAP 설정했습니다. 25.09.10 - 정우*/}
      <div className="h-[166px]"></div>

      <FixedBottomLayout.Content className="w-full flex justify-center bg-white">
        <div className="flex flex-col justify-center w-full max-w-lg px-5 mb-10">
          <div className="h-[82px] w-full" />
          <Tooltip id="kakao-login-tooltip" className="animate-bounce">
            <Typo.Body size="medium">⚡️ 3초만에 시작하기</Typo.Body>
          </Tooltip>
          <KakaoLoginButton
            data-tooltip-id="kakao-login-tooltip"
            onClick={handleKakaoLogin}
          />
        </div>
      </FixedBottomLayout.Content>
    </>
  );
}
