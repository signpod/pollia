"use client";

import { cn } from "@/lib/utils";
import KakaoIcon from "@public/svgs/kakao-icon.svg";
import { ButtonV2, Typo } from "@repo/ui/components";
import { Share2 } from "lucide-react";
import Image from "next/image";
import { forwardRef } from "react";

interface ShareSectionProps {
  title?: string;
  brandLogoUrl?: string | null;
  imageUrl?: string | null;
  onKakaoShare: () => void;
  onLinkShare: () => void;
  isSharing: boolean;
}

export const ShareSection = forwardRef<HTMLDivElement, ShareSectionProps>(
  ({ title, brandLogoUrl, imageUrl, onKakaoShare, onLinkShare, isSharing }, ref) => {
    return (
      <div
        ref={ref}
        className="w-full bg-zinc-50 flex flex-col items-center gap-4 p-10 flex-1 opacity-0 translate-y-[10px]"
      >
        <Typo.MainTitle size="small" className="text-center">
          가족, 친구에게
          <br />
          공유해보세요 👀
        </Typo.MainTitle>
        <div className="flex flex-col items-center gap-6 bg-white rounded-md p-6 w-full">
          <SharePreviewCard title={title} brandLogoUrl={brandLogoUrl} imageUrl={imageUrl} />
          <ShareButtons
            onKakaoShare={onKakaoShare}
            onLinkShare={onLinkShare}
            isSharing={isSharing}
          />
        </div>
      </div>
    );
  },
);

ShareSection.displayName = "ShareSection";

interface SharePreviewCardProps {
  title?: string;
  brandLogoUrl?: string | null;
  imageUrl?: string | null;
}

function SharePreviewCard({ title, brandLogoUrl, imageUrl }: SharePreviewCardProps) {
  return (
    <div className="flex items-center gap-4 w-full">
      <div className="flex flex-col gap-2 flex-1">
        {brandLogoUrl && (
          <Image
            src={brandLogoUrl}
            alt="Brand Logo"
            width={40}
            height={40}
            className="object-contain size-10"
          />
        )}
        <Typo.SubTitle size="large" className="break-keep">
          {title}
        </Typo.SubTitle>
      </div>
      {imageUrl && (
        <div className="flex items-center justify-center h-full">
          <Image
            src={imageUrl}
            alt="Mission Image"
            width={72}
            height={140}
            className="object-cover w-20 rounded-md h-full"
          />
        </div>
      )}
    </div>
  );
}

interface ShareButtonsProps {
  onKakaoShare: () => void;
  onLinkShare: () => void;
  isSharing: boolean;
}

function ShareButtons({ onKakaoShare, onLinkShare, isSharing }: ShareButtonsProps) {
  return (
    <div className="flex items-center gap-4 w-full">
      <ButtonV2
        className={cn("flex-1 bg-[#FEE500] text-default", "hover:bg-[#FEE500] active:bg-[#FEE500]")}
        onClick={onKakaoShare}
      >
        <div className="flex items-center justify-center w-full gap-2">
          <KakaoIcon className="size-4" />
          <Typo.ButtonText size="medium">카카오톡 공유</Typo.ButtonText>
        </div>
      </ButtonV2>
      <ButtonV2 className="flex-1" variant="secondary" onClick={onLinkShare} disabled={isSharing}>
        <div className="flex items-center justify-center w-full gap-2">
          <Share2 className="size-4" />
          <Typo.ButtonText size="medium">링크 공유</Typo.ButtonText>
        </div>
      </ButtonV2>
    </div>
  );
}
