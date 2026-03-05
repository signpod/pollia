"use client";

import { cn } from "@/lib/utils";
import KakaoIcon from "@public/svgs/kakao-icon.svg";
import XLogo from "@public/svgs/x-logo.svg";
import { Share2 } from "lucide-react";

interface SocialShareButtonsProps {
  onXShare?: () => void;
  onKakaoShare: () => void;
  onLinkShare: () => void;
  className?: string;
}

export function SocialShareButtons({
  onXShare,
  onKakaoShare,
  onLinkShare,
  className,
}: SocialShareButtonsProps) {
  return (
    <div className={cn("flex gap-4 justify-center", className)}>
      <button
        type="button"
        aria-label="카카오톡으로 공유"
        className="flex justify-center items-center bg-kakao rounded-sm p-2"
        onClick={onKakaoShare}
      >
        <KakaoIcon className="size-6" />
      </button>
      {onXShare && (
        <button
          type="button"
          aria-label="X(트위터)로 공유"
          className="flex justify-center items-center bg-black rounded-sm p-2"
          onClick={onXShare}
        >
          <XLogo className="size-6 text-white" />
        </button>
      )}
      <button
        type="button"
        aria-label="링크 복사"
        className="flex justify-center items-center bg-white border border-default rounded-sm p-2"
        onClick={onLinkShare}
      >
        <Share2 className="size-6" />
      </button>
    </div>
  );
}
