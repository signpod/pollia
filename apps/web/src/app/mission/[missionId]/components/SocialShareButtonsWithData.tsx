"use client";

import { useMissionShare } from "@/hooks/share/useMissionShare";
import { SocialShareButtons } from "./SocialShareButtons";

interface SocialShareButtonsWithDataProps {
  missionId: string;
  title?: string;
  imageUrl?: string;
  className?: string;
}

export function SocialShareButtonsWithData({
  missionId,
  title,
  imageUrl,
  className,
}: SocialShareButtonsWithDataProps) {
  const { handleKakaoShare, handleLinkShare, handleXShare } = useMissionShare({
    missionId,
    title,
    imageUrl,
  });

  return (
    <SocialShareButtons
      onXShare={handleXShare}
      onKakaoShare={handleKakaoShare}
      onLinkShare={handleLinkShare}
      className={className}
    />
  );
}
