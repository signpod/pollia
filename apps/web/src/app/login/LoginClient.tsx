"use client";

import { toast } from "@/components/common/Toast";
import { FixedBottomLayout, KakaoLoginButton, Tooltip, Typo, useModal } from "@repo/ui/components";
import { useCallback, useEffect, useState } from "react";
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
  const [isKakaoSdkLoaded, setIsKakaoSdkLoaded] = useState(false);

  useEffect(() => {
    const kakaoJsKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;

    if (!kakaoJsKey) {
      console.warn("NEXT_PUBLIC_KAKAO_JS_KEY가 설정되지 않았습니다.");
      return;
    }

    if (window.Kakao) {
      if (!window.Kakao.isInitialized()) {
        window.Kakao.init(kakaoJsKey);
      }
      setIsKakaoSdkLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://developers.kakao.com/sdk/js/kakao.js";
    script.async = true;
    script.onload = () => {
      if (window.Kakao && !window.Kakao.isInitialized()) {
        window.Kakao.init(kakaoJsKey);
        setIsKakaoSdkLoaded(true);
      }
    };
    script.onerror = () => {
      console.error("카카오 SDK 로드 실패");
    };
    document.head.appendChild(script);
  }, []);

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

  const handleKakaoLogin = useCallback(() => {
    try {
      if (!isKakaoSdkLoaded || !window.Kakao) {
        toast.warning("카카오 로그인을 준비 중입니다. 잠시 후 다시 시도해주세요.", {
          duration: 3000,
        });
        return;
      }

      window.Kakao.Auth.authorize({
        redirectUri: `${window.location.origin}/auth/callback`,
        prompts: "select_account",
      });
    } catch (error) {
      console.error("카카오 로그인 에러:", error);
      toast.warning("로그인 중 문제가 발생했습니다.", {
        duration: 3000,
      });
    }
  }, [isKakaoSdkLoaded]);

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
