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
    <div className={cn("flex gap-4 w-full justify-center", className)}>
      {onXShare && (
        <button
          type="button"
          className="flex justify-center items-center bg-black rounded-sm p-2"
          onClick={onXShare}
        >
          <XLogo className="size-6 text-white" />
        </button>
      )}
      <button
        type="button"
        className="flex justify-center items-center bg-kakao rounded-sm p-2"
        onClick={onKakaoShare}
      >
        <KakaoIcon className="size-6" />
      </button>
      <button
        type="button"
        className="flex justify-center items-center bg-white border border-default rounded-sm p-2"
        onClick={onLinkShare}
      >
        <Share2 className="size-6" />
      </button>
    </div>
  );
}
