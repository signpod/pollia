"use client";

import { toast } from "@/components/common/Toast";
import { SHARE_IMAGE_PATH, SHARE_MESSAGES } from "@/constants/shareMessages";
import { useKakaoSdk } from "@/hooks/kakao/useKakaoSdk";
import { useCallback } from "react";

interface UseKakaoShareOptions {
  shareUrl: string;
  title?: string;
  imageUrl?: string | null;
}

export function useKakaoShare({ shareUrl, title, imageUrl }: UseKakaoShareOptions) {
  const { isKakaoSdkLoaded } = useKakaoSdk();

  const handleKakaoShare = useCallback(async () => {
    try {
      if (!isKakaoSdkLoaded || !window.Kakao) {
        toast.warning(SHARE_MESSAGES.kakao.preparing, {
          duration: 3000,
        });
        return;
      }

      if (!window.Kakao.Share) {
        toast.warning(SHARE_MESSAGES.kakao.unavailable, {
          duration: 3000,
        });
        return;
      }

      const kakaoJsKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
      if (!kakaoJsKey) {
        toast.warning(SHARE_MESSAGES.kakao.error, {
          duration: 3000,
        });
        return;
      }

      if (typeof window !== "undefined" && window.sessionStorage) {
        try {
          const keys = Object.keys(window.sessionStorage);
          keys.forEach(key => {
            if (
              key.toLowerCase().includes("kakao") ||
              key.toLowerCase().includes("access_token") ||
              key.startsWith("kakao_")
            ) {
              window.sessionStorage.removeItem(key);
            }
          });
        } catch (error) {
          console.warn("카카오 토큰 제거 중 오류:", error);
        }
      }

      try {
        if (window.Kakao.Auth) {
          const currentAccessToken = window.Kakao.Auth.getAccessToken();
          if (currentAccessToken) {
            window.Kakao.Auth.setAccessToken("", false);
          }
          window.Kakao.Auth.cleanup();
        }
      } catch (error) {
        console.warn("카카오 인증 정리 중 오류:", error);
      }

      try {
        window.Kakao.cleanup();
        window.Kakao.init(kakaoJsKey);
      } catch (error) {
        console.warn("카카오 SDK 재초기화 중 오류:", error);
        if (!window.Kakao.isInitialized()) {
          window.Kakao.init(kakaoJsKey);
        }
      }

      const shareImageUrl = imageUrl
        ? imageUrl.startsWith("http")
          ? imageUrl
          : `${typeof window !== "undefined" ? window.location.origin : ""}${imageUrl}`
        : typeof window !== "undefined"
          ? `${window.location.origin}${SHARE_IMAGE_PATH}`
          : "";

      const shareTitle = title || SHARE_MESSAGES.kakao.title;
      const shareDescription = SHARE_MESSAGES.kakao.description;

      try {
        window.Kakao.Share.sendDefault({
          objectType: "feed",
          content: {
            title: shareTitle,
            description: shareDescription,
            imageUrl: shareImageUrl,
            link: {
              mobileWebUrl: shareUrl,
              webUrl: shareUrl,
            },
          },
        });
      } catch (shareError) {
        const errorMessage = shareError instanceof Error ? shareError.message : String(shareError);
        if (errorMessage.includes("scheme") || errorMessage.includes("handler")) {
          try {
            await navigator.clipboard.writeText(shareUrl);
            toast.success("링크가 클립보드에 복사되었어요! 카카오톡에 붙여넣어 공유해주세요.", {
              duration: 4000,
            });
          } catch {
            toast.warning("카카오톡 앱이 설치되어 있지 않거나 열 수 없습니다.", {
              duration: 3000,
            });
          }
        } else {
          throw shareError;
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (!errorMessage.includes("scheme") && !errorMessage.includes("handler")) {
        console.error("카카오톡 공유 에러:", error);
        toast.warning(SHARE_MESSAGES.kakao.error, {
          duration: 3000,
        });
      }
    }
  }, [isKakaoSdkLoaded, shareUrl, title, imageUrl]);

  return { handleKakaoShare };
}
