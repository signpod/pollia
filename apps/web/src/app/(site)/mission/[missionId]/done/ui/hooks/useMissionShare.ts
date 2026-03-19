"use client";

import { useMissionShare as useBaseMissionShare } from "@/hooks/share/useMissionShare";

interface UseMissionShareOptions {
  missionId: string;
  title?: string;
}

export function useMissionShare({ missionId, title }: UseMissionShareOptions) {
  const { handleKakaoShare, handleLinkShare, handleXShare, isSharing, shareUrl } =
    useBaseMissionShare({
      missionId,
      title,
    });

  return {
    handleKakaoShare,
    handleShare: handleLinkShare,
    handleXShare,
    isSharing,
    shareUrl,
  };
}
