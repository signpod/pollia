"use client";

import { toast } from "@/components/common/Toast";
import { useKakaoSdk } from "@/hooks/kakao/useKakaoSdk";
import {
  type AuthError,
  clearAuthErrorCookie,
  getAuthErrorFromCookie,
  setAuthRedirect,
} from "@/lib/cookie";
import { useModal } from "@repo/ui/components";
import { useCallback, useEffect } from "react";

export type { AuthError };

interface UseKakaoLoginOptions {
  redirectPath?: string;
}

export function useKakaoLogin(options: UseKakaoLoginOptions = {}) {
  const { redirectPath } = options;
  const { showModal } = useModal();
  const { isKakaoSdkLoaded } = useKakaoSdk();

  useEffect(() => {
    const authError = getAuthErrorFromCookie();
    if (authError) {
      const shownErrorKey = `auth_error_shown_${authError.timestamp}`;
      const alreadyShown = sessionStorage.getItem(shownErrorKey);

      if (!alreadyShown) {
        showModal({
          title: "로그인 도중 오류가 발생했어요",
          description: "다시 시도해주세요.",
          confirmText: "확인",
        });
        sessionStorage.setItem(shownErrorKey, "true");
        clearAuthErrorCookie();
      }
    }
  }, [showModal]);

  const handleKakaoLogin = useCallback(() => {
    try {
      if (!isKakaoSdkLoaded || !window.Kakao) {
        toast.warning("카카오 로그인을 준비 중입니다. 잠시 후 다시 시도해주세요", {
          duration: 3000,
        });
        return;
      }

      if (redirectPath?.startsWith("/")) {
        setAuthRedirect(redirectPath);
      }

      window.Kakao.Auth.authorize({
        redirectUri: `${window.location.origin}/auth/callback`,
        prompts: "select_account",
      });
    } catch (error) {
      console.error("카카오 로그인 에러:", error);
      toast.warning("로그인 중 문제가 발생했습니다", {
        duration: 3000,
      });
    }
  }, [isKakaoSdkLoaded, redirectPath]);

  return {
    handleKakaoLogin,
    isKakaoSdkLoaded,
  };
}
