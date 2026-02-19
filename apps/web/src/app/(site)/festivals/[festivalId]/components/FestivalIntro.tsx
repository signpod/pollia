"use client";

import type { FestivalData } from "@/types/dto/festival";
import PolliaIcon from "@public/svgs/pollia-icon.svg";
import { ButtonV2, Typo } from "@repo/ui/components";
import { motion } from "framer-motion";
import { Calendar, MapPin } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import { useState } from "react";

interface FestivalIntroProps {
  festival: FestivalData;
  children: ReactNode;
}

const SCROLL_OFFSET = 10;

export function FestivalIntro({ festival, children }: FestivalIntroProps) {
  const [imageError, setImageError] = useState(false);
  const showFallback = imageError || !festival.imageUrl;

  return (
    <main className="flex justify-center bg-background relative w-full max-w-[600px] flex-col">
      <div className="relative h-svh min-h-svh w-full">
        <div className="absolute inset-0">
          {showFallback ? (
            <div className="flex h-full w-full items-center justify-center bg-violet-50">
              <PolliaIcon className="size-32 text-violet-300" />
            </div>
          ) : (
            <Image
              src={festival.imageUrl}
              alt={festival.title}
              fill
              className="object-cover object-top"
              priority
              unoptimized={festival.imageUrl.includes("visitkorea")}
              onError={() => setImageError(true)}
            />
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 z-10 flex flex-col gap-6 bg-gradient-to-t from-black via-black/50 via-70% to-transparent px-5 pb-6 pt-12">
          <div className="flex flex-col items-center justify-center gap-3">
            <span className="rounded-full bg-violet-500 px-3 py-1 text-xs font-semibold text-white">
              축제
            </span>
            <div className="flex flex-col items-center justify-center gap-2">
              <Typo.MainTitle size="large" className="break-keep text-center text-white">
                {festival.title}
              </Typo.MainTitle>
              <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-zinc-300">
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-4" />
                  {festival.month} {festival.dateRange}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-4" />
                  {festival.location}
                </span>
              </div>
            </div>
          </div>

          <div className="relative z-10">
            <ButtonV2
              variant="tertiary"
              size="large"
              className="h-12 w-full rounded-full hover:bg-transparent"
              onClick={() => {
                window.scrollTo({
                  top: window.innerHeight + SCROLL_OFFSET,
                  behavior: "smooth",
                });
              }}
            >
              <div className="flex w-full items-center justify-center gap-3">
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

      {children}
    </main>
  );
}
