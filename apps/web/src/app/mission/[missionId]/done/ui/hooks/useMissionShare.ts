"use client";

import { useMissionShare as useBaseMissionShare } from "@/hooks/share/useMissionShare";

interface UseMissionShareOptions {
  missionId: string;
  title?: string;
  imageUrl?: string | null;
}

export function useMissionShare({ missionId, title, imageUrl }: UseMissionShareOptions) {
  const { handleKakaoShare, handleLinkShare, handleXShare, isSharing, shareUrl } =
    useBaseMissionShare({
      missionId,
      title,
      imageUrl,
    });

  return {
    handleKakaoShare,
    handleShare: handleLinkShare,
    handleXShare,
    isSharing,
    shareUrl,
  };
}
