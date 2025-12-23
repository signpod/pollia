"use client";

import { toast } from "@/components/common/Toast";
import { ROUTES } from "@/constants/routes";
import { SHARE_MESSAGES } from "@/constants/shareMessages";
import { useKakaoShare } from "@/hooks/share/useKakaoShare";
import { useCallback, useMemo, useState } from "react";

interface UseMissionShareOptions {
  missionId: string;
  title?: string;
  imageUrl?: string | null;
}

export function useMissionShare({ missionId, title, imageUrl }: UseMissionShareOptions) {
  const [isSharing, setIsSharing] = useState(false);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}${ROUTES.MISSION(missionId)}`;
  }, [missionId]);

  const { handleKakaoShare } = useKakaoShare({
    shareUrl,
    title,
    imageUrl,
  });

  const handleLinkShare = useCallback(async () => {
    if (isSharing) return;

    if (!navigator.share) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success(SHARE_MESSAGES.clipboard.success);
      } catch (error) {
        console.error("클립보드 복사 에러:", error);
        toast.warning(SHARE_MESSAGES.clipboard.error, {
          duration: 3000,
        });
      }
      return;
    }

    setIsSharing(true);
    try {
      await navigator.share({
        title: title || SHARE_MESSAGES.kakao.title,
        text: SHARE_MESSAGES.kakao.description,
        url: shareUrl,
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }
      console.error("공유 에러:", error);
    } finally {
      setIsSharing(false);
    }
  }, [shareUrl, isSharing, title]);

  const handleXShare = useCallback(() => {
    const shareText = title || SHARE_MESSAGES.kakao.title;
    const xShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(xShareUrl, "_blank", "noopener,noreferrer,width=550,height=420");
  }, [shareUrl, title]);

  return {
    handleKakaoShare,
    handleLinkShare,
    handleXShare,
    isSharing,
    shareUrl,
  };
}
