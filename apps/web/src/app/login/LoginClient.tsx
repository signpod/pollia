"use client";

import { useCallback, useEffect } from "react";
import {
  FixedBottomLayout,
  KakaoLoginButton,
  toast,
  Tooltip,
  Typo,
  useModal,
} from "@repo/ui/components";
import { createClient as createSupabaseClient } from "@/database/utils/supabase/client";
import { OnboardingCarousel } from "./OnboardingCarousel";

interface AuthError {
  type: string;
  message: string;
  detail?: string;
  timestamp: number;
}

interface LoginClientProps {
  initialError: AuthError | null;
}

export function LoginClient({ initialError }: LoginClientProps) {
  const { showModal } = useModal();

  useEffect(() => {
    if (initialError) {
      const shownErrorKey = `auth_error_shown_${initialError.timestamp}`;
      const alreadyShown = sessionStorage.getItem(shownErrorKey);

      if (!alreadyShown) {
        showModal({
          title: "로그인 도중 오류가 발생했어요",
          description: "다시 시도해주세요.",
          confirmText: "확인",
        });
        sessionStorage.setItem(shownErrorKey, "true");
      }
    }
  }, [initialError, showModal]);

  const handleKakaoLogin = useCallback(async () => {
    const supabase = createSupabaseClient();

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "kakao",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error("카카오 로그인 설정 에러:", error);
        toast.error("로그인 시작 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.", {
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("예상치 못한 에러:", error);
      toast.error("로그인 중 문제가 발생했습니다.", {
        duration: 3000,
      });
    }
  }, []);

  return (
    <>
      <OnboardingCarousel />

      {/*TODO: 디자인 가이드 확인 후 삭제. 임시로 바텀 GAP 설정했습니다. 25.09.10 - 정우*/}
      <div className="h-[166px]"></div>

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
