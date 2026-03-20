"use client";

import { useMissionShare } from "@/hooks/share/useMissionShare";
import { SocialShareButtons } from "./SocialShareButtons";

interface SocialShareButtonsWithDataProps {
  missionId: string;
  title?: string;
  className?: string;
}

export function SocialShareButtonsWithData({
  missionId,
  title,
  className,
}: SocialShareButtonsWithDataProps) {
  const { handleKakaoShare, handleLinkShare, handleXShare } = useMissionShare({
    missionId,
    title,
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
