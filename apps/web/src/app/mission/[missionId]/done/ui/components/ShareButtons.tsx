"use client";

import { toast } from "@/components/common/Toast";
import { ROUTES } from "@/constants/routes";
import { SHARE_MESSAGES } from "@/constants/shareMessages";
import { useKakaoShare } from "@/hooks/share/useKakaoShare";
import KakaoIcon from "@public/svgs/kakao-icon.svg";
import { Typo } from "@repo/ui/components";
import { Share2 } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useCallback, useMemo, useState } from "react";

export const ShareButtons = React.forwardRef<HTMLDivElement>((_props, ref) => {
  const params = useParams<{ id: string }>();

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}${ROUTES.MISSION(params.id)}`;
  }, [params.id]);

  const { handleKakaoShare } = useKakaoShare({ shareUrl });
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = useCallback(async () => {
    if (isSharing) {
      return;
    }

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
        title: SHARE_MESSAGES.kakao.title,
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
  }, [shareUrl, isSharing]);

  return (
    <div
      ref={ref}
      className="flex gap-8 w-full justify-center"
      style={{ opacity: 0, transform: "translateY(10px)" }}
    >
      <button type="button" className="flex flex-col gap-2" onClick={handleKakaoShare}>
        <div className="bg-[#FEE500] size-12 p-3 rounded-sm">
          <KakaoIcon />
        </div>
        <Typo.Body className="text-sub">카카오톡</Typo.Body>
      </button>

      <button type="button" className="flex flex-col gap-2" onClick={handleShare}>
        <div className="bg-white border border-default size-12 p-3 rounded-sm flex items-center justify-center">
          <Share2 />
        </div>
        <Typo.Body className="text-sub">공유하기</Typo.Body>
      </button>
    </div>
  );
});

ShareButtons.displayName = "ShareButtons";
