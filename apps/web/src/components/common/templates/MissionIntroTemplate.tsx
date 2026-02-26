"use client";

import { MissionImage } from "@/app/(site)/mission/[missionId]/components/MissionImage";
import { MissionLogo } from "@/app/(site)/mission/[missionId]/components/MissionLogo";
import { MissionWidget } from "@/app/(site)/mission/[missionId]/components/MissionWidget";
import ClockIcon from "@public/svgs/clock-color-icon.svg";
import GiftIcon from "@public/svgs/gift-color-icon.svg";
import Lock from "@public/svgs/lock.svg";
import { ButtonV2, Typo } from "@repo/ui/components";
import { motion } from "framer-motion";
import type { ReactNode, RefObject } from "react";

export interface MissionIntroTemplateProps {
  header?: ReactNode;
  imageUrl?: string | null;
  brandLogoUrl?: string;
  title?: string | null;
  formattedDeadline?: string | null;
  isRequirePassword?: boolean;
  showRewardWidget?: boolean;
  rewardName?: string;
  showDeadlineWidget?: boolean;
  deadlineDate?: Date | null;
  showOpenWidget?: boolean;
  openDate?: Date | null;
  titleRef?: RefObject<HTMLDivElement | null>;
  onScrollDown?: () => void;
  children?: ReactNode;
}

export function MissionIntroTemplate({
  header,
  imageUrl,
  brandLogoUrl,
  title,
  formattedDeadline,
  isRequirePassword,
  showRewardWidget,
  rewardName = "",
  showDeadlineWidget,
  deadlineDate,
  showOpenWidget,
  openDate,
  titleRef,
  onScrollDown,
  children,
}: MissionIntroTemplateProps) {
  const effectiveImageUrl = imageUrl || "/images/intro-fallback.png";

  return (
    <>
      <div className="flex h-svh min-h-svh flex-col">
        {header}
        <div className="relative w-full flex-1">
          <MissionImage imageUrl={effectiveImageUrl} className="absolute inset-0" />
          <div className="bg-linear-to-t from-[#27272A] via-[#27272A]/50 via-70% to-transparent absolute bottom-0 left-0 right-0 z-10 flex flex-col gap-6 pb-6 pt-12 px-5">
            <div ref={titleRef} className="flex flex-col gap-3 justify-center items-center">
              <MissionLogo logoUrl={brandLogoUrl} />
              <div className="flex flex-col gap-1 justify-center items-center">
                <div className="break-keep text-white text-center">
                  <Typo.MainTitle size="large" className="inline text-white">
                    {title}
                  </Typo.MainTitle>
                  {isRequirePassword && (
                    <Lock className="size-5 text-white inline-block ml-1 align-[0.1em]" />
                  )}
                </div>
                {formattedDeadline && (
                  <Typo.Body size="medium" className="text-zinc-300">
                    {`${formattedDeadline}까지`}
                  </Typo.Body>
                )}
              </div>
            </div>
            {(showRewardWidget || showDeadlineWidget || showOpenWidget) && (
              <div className="flex flex-col gap-2">
                {showRewardWidget && (
                  <MissionWidget
                    icon={<GiftIcon className="size-5" />}
                    descType="text"
                    title="리워드"
                    description={rewardName}
                  />
                )}
                {showOpenWidget && openDate && (
                  <MissionWidget
                    icon={<ClockIcon className="size-5" />}
                    descType="clock"
                    title="오픈까지"
                    deadline={openDate}
                  />
                )}
                {showDeadlineWidget && deadlineDate && (
                  <MissionWidget
                    icon={<ClockIcon className="size-5" />}
                    descType="clock"
                    title="종료까지"
                    deadline={deadlineDate}
                  />
                )}
              </div>
            )}

            <div className="relative z-10">
              <ButtonV2
                variant="tertiary"
                size="large"
                className="w-full rounded-full h-12 hover:bg-transparent"
                onClick={onScrollDown}
              >
                <div className="flex items-center justify-center w-full gap-3">
                  <motion.div
                    animate={{ y: [-2, 2, -2] }}
                    transition={{
                      duration: 1,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                    className="size-6"
                    style={{
                      background:
                        "linear-gradient(to bottom, rgba(255,255,255,0.3), rgba(255,255,255,1))",
                      WebkitMaskImage: "url('/svgs/chevron-double-down-color.svg')",
                      maskImage: "url('/svgs/chevron-double-down-color.svg')",
                      WebkitMaskSize: "contain",
                      maskSize: "contain",
                      WebkitMaskRepeat: "no-repeat",
                      maskRepeat: "no-repeat",
                      WebkitMaskPosition: "center",
                      maskPosition: "center",
                    }}
                  />

                  <Typo.ButtonText size="large" className="text-white">
                    아래로 내려보세요
                  </Typo.ButtonText>
                </div>
              </ButtonV2>
            </div>
          </div>
        </div>
      </div>

      {children}
    </>
  );
}
