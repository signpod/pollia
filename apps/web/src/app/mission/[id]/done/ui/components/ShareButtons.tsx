import { toast } from "@/components/common/Toast";
import { ROUTES } from "@/constants/routes";
import KakaoIcon from "@public/svgs/kakao-icon.svg";
import { Typo } from "@repo/ui/components";
import { Share2 } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";

export const ShareButtons = React.forwardRef<HTMLDivElement>((_props, ref) => {
  const params = useParams<{ id: string }>();
  const [isKakaoSdkLoaded, setIsKakaoSdkLoaded] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setShareUrl(`${window.location.origin}${ROUTES.MISSION(params.id)}`);
    }
  }, [params.id]);

  useEffect(() => {
    const kakaoJsKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;

    if (!kakaoJsKey) {
      return;
    }

    if (window.Kakao) {
      if (!window.Kakao.isInitialized()) {
        window.Kakao.init(kakaoJsKey);
      }
      setIsKakaoSdkLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://developers.kakao.com/sdk/js/kakao.js";
    script.async = true;
    script.onload = () => {
      if (window.Kakao && !window.Kakao.isInitialized()) {
        window.Kakao.init(kakaoJsKey);
        setIsKakaoSdkLoaded(true);
      }
    };
    script.onerror = () => {
      console.error("카카오 SDK 로드 실패");
    };
    document.head.appendChild(script);
  }, []);

  const handleKakaoShare = useCallback(() => {
    try {
      if (!isKakaoSdkLoaded || !window.Kakao) {
        toast.warning("카카오톡 공유를 준비 중입니다. 잠시 후 다시 시도해주세요.", {
          duration: 3000,
        });
        return;
      }

      if (!window.Kakao.Share) {
        toast.warning("카카오톡 공유 기능을 사용할 수 없습니다.", {
          duration: 3000,
        });
        return;
      }

      const imageUrl =
        typeof window !== "undefined" ? `${window.location.origin}/images/pollia-logo.png` : "";

      window.Kakao.Share.sendDefault({
        objectType: "feed",
        content: {
          title: "설문에 참여해주세요",
          description: "설문에 참여하고 의견을 공유해보세요!",
          imageUrl,
          link: {
            mobileWebUrl: shareUrl,
            webUrl: shareUrl,
          },
        },
      });
    } catch (error) {
      console.error("카카오톡 공유 에러:", error);
      toast.warning("카카오톡 공유 중 문제가 발생했습니다.", {
        duration: 3000,
      });
    }
  }, [isKakaoSdkLoaded, shareUrl]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("링크가 클립보드에 복사되었어요!");
    } catch (error) {
      console.error("클립보드 복사 에러:", error);
      toast.warning("링크 복사 중 문제가 발생했습니다.", {
        duration: 3000,
      });
    }
  }, [shareUrl]);

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

      <button type="button" className="flex flex-col gap-2" onClick={handleCopyLink}>
        <div className="bg-white border border-default size-12 p-3 rounded-sm">
          <Share2 />
        </div>
        <Typo.Body className="text-sub">공유하기</Typo.Body>
      </button>
    </div>
  );
});

ShareButtons.displayName = "ShareButtons";
