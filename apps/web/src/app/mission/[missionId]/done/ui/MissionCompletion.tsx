"use client";
import { toast } from "@/components/common/Toast";
import { ROUTES } from "@/constants/routes";
import { SHARE_MESSAGES } from "@/constants/shareMessages";
import { useReadMission } from "@/hooks/mission";
import { useReadMissionCompletion } from "@/hooks/mission-completion";
import { useKakaoShare } from "@/hooks/share/useKakaoShare";
import { cleanTiptapHTML, cn } from "@/lib/utils";
import { ButtonV2, TiptapViewer, Tooltip, Typo } from "@repo/ui/components";
import { motion } from "framer-motion";
import gsap from "gsap";
import { Share2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import KakaoIcon from "@public/svgs/kakao-icon.svg";
import StarBigIcon from "@public/svgs/star-big.svg";
import StarYellow from "@public/svgs/star-yellow.svg";
import Image from "next/image";

export function MissionCompletion() {
  const { missionId } = useParams<{ missionId: string }>();
  const { data: mission } = useReadMission(missionId);
  const { data: missionCompletion } = useReadMissionCompletion(missionId);
  const { imageUrl, brandLogoUrl } = mission?.data ?? {};
  const { title, description } = missionCompletion?.data ?? {};

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}${ROUTES.MISSION(missionId)}`;
  }, [missionId]);

  const { handleKakaoShare } = useKakaoShare({
    shareUrl,
    title: mission?.data?.title,
    imageUrl: mission?.data?.imageUrl,
  });

  const [isSharing, setIsSharing] = useState(false);

  const handleShare = useCallback(async () => {
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
        title: mission?.data?.title || SHARE_MESSAGES.kakao.title,
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
  }, [shareUrl, isSharing, mission?.data?.title]);

  const starBoxRef = useRef<HTMLDivElement>(null);
  const gradientRef = useRef<HTMLDivElement>(null);
  const shareBoxRef = useRef<HTMLDivElement>(null);
  const [isReversed, setIsReversed] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [showStarTooltip, setShowStarTooltip] = useState(false);

  useEffect(() => {
    if (!starBoxRef.current) return;

    const timeline = gsap.timeline();

    timeline.delay(0.5);
    timeline.to(starBoxRef.current, {
      scale: 0.5,
      duration: 0.3,
      marginBottom: "-120px",
      ease: "power2.inOut",
    });
    timeline.to(
      gradientRef.current,
      {
        opacity: 0,
        duration: 0.3,
        ease: "power2.out",
      },
      "-=0.2",
    );
    timeline.call(
      () => {
        setIsReversed(true);
        setShowTitle(true);
        setShowStarTooltip(true);
        setShowDescription(true);
      },
      [],
      "-=0.1",
    );
    timeline.to(
      shareBoxRef.current,
      {
        opacity: 1,
        y: 0,
        duration: 0.2,
        ease: "easeOut",
      },
      "+=1",
    );
  }, []);

  return (
    <div
      className={cn(
        "relative w-full flex flex-col items-center gap-6 min-s-svh overflow-hidden",
        "bg-white",
        "transition-all duration-300",
        !showTitle ? "pt-[25%]" : "pt-[20px]",
      )}
    >
      <div
        ref={gradientRef}
        className="absolute inset-0 bg-linear-to-b from-[#FFE672]/0 via-[#FFE672]/10 to-[#FFE672]/0 pointer-events-none"
      />
      <div className="flex flex-col items-center w-full h-full">
        {(isReversed ? ["star", "title"] : ["title", "star"]).map(item =>
          item === "title" ? (
            <div key={item} className="flex flex-col items-center gap-2 p-10">
              {showTitle && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.3, ease: "easeOut" }}
                >
                  <Typo.MainTitle size="small" className="text-center break-keep">
                    {title}
                  </Typo.MainTitle>
                </motion.div>
              )}
              {showDescription && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.3, ease: "easeOut" }}
                >
                  {description && (
                    <TiptapViewer
                      content={cleanTiptapHTML(description)}
                      className="break-keep text-center"
                    />
                  )}
                </motion.div>
              )}
            </div>
          ) : (
            <motion.div
              key="star"
              layoutId="mission-star"
              transition={{
                layout: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
              }}
              className="flex flex-col items-center"
            >
              <Tooltip
                id="star-tooltip"
                className={cn(
                  "opacity-0 translate-y-[10px] transition-all duration-300",
                  showStarTooltip ? "opacity-100 translate-y-0" : "",
                )}
              >
                참여해주셔서 감사합니다 ⭐️
              </Tooltip>
              <div
                className="relative pt-[100px] px-[70px] flex items-center justify-center origin-center"
                ref={starBoxRef}
                data-tooltip-id="star-tooltip"
              >
                {[...Array(5)].map((_, i) => {
                  const angle = -90 + (i - 2) * 30;
                  const radian = (angle * Math.PI) / 180;
                  const radius = 120;
                  const x = Math.cos(radian) * radius;
                  const y = Math.sin(radian) * radius;
                  return (
                    <div
                      key={`star-${i}`}
                      className={cn("absolute left-1/2 top-1/2")}
                      style={{
                        transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                      }}
                    >
                      <StarYellow className={i % 2 === 0 ? "size-10" : "size-8"} />
                    </div>
                  );
                })}
                <StarBigIcon className="translate-y-[-40px] size-50" />
              </div>
            </motion.div>
          ),
        )}
        <div
          ref={shareBoxRef}
          className="w-full bg-zinc-50 flex flex-col items-center gap-4 p-10 flex-1 opacity-0 translate-y-[10px]"
        >
          <Typo.MainTitle size="small" className="text-center">
            가족, 친구에게
            <br />
            공유해보세요 👀
          </Typo.MainTitle>
          <div className="flex flex-col items-center gap-6 bg-white rounded-md p-6 w-full">
            <div className="flex items-center gap-4 w-full">
              <div className="flex flex-col gap-2 flex-1">
                {brandLogoUrl && (
                  <Image
                    src={brandLogoUrl}
                    alt="Brand Logo"
                    width={40}
                    height={40}
                    className="object-contain size-10 "
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
            <div className="flex items-center gap-4 w-full">
              <ButtonV2
                className={cn(
                  "flex-1 bg-[#FEE500] text-default",
                  "hover:bg-[#FEE500] active:bg-[#FEE500]",
                )}
                onClick={handleKakaoShare}
              >
                <div className="flex items-center justify-center w-full gap-2">
                  <KakaoIcon className="size-4" />
                  <Typo.ButtonText size="medium">카카오톡 공유</Typo.ButtonText>
                </div>
              </ButtonV2>
              <ButtonV2
                className="flex-1"
                variant="secondary"
                onClick={handleShare}
                disabled={isSharing}
              >
                <div className="flex items-center justify-center w-full gap-2">
                  <Share2 className="size-4" />
                  <Typo.ButtonText size="medium">링크 공유</Typo.ButtonText>
                </div>
              </ButtonV2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
