"use client";

import { toast } from "@/components/common/Toast";
import { SHARE_IMAGE_PATH, SHARE_MESSAGES } from "@/constants/shareMessages";
import { useKakaoSdk } from "@/hooks/kakao/useKakaoSdk";
import { useCallback } from "react";

interface UseKakaoShareOptions {
  shareUrl: string;
}

export function useKakaoShare({ shareUrl }: UseKakaoShareOptions) {
  const { isKakaoSdkLoaded } = useKakaoSdk();

  const handleKakaoShare = useCallback(() => {
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

      const imageUrl =
        typeof window !== "undefined" ? `${window.location.origin}${SHARE_IMAGE_PATH}` : "";

      window.Kakao.Share.sendDefault({
        objectType: "feed",
        content: {
          title: SHARE_MESSAGES.kakao.title,
          description: SHARE_MESSAGES.kakao.description,
          imageUrl,
          link: {
            mobileWebUrl: shareUrl,
            webUrl: shareUrl,
          },
        },
      });
    } catch (error) {
      console.error("카카오톡 공유 에러:", error);
      toast.warning(SHARE_MESSAGES.kakao.error, {
        duration: 3000,
      });
    }
  }, [isKakaoSdkLoaded, shareUrl]);

  return { handleKakaoShare };
}

