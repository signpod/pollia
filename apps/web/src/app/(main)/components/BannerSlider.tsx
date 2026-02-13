"use client";

import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import PlayIcon from "@public/svgs/play-icon.svg";
import PolliaIcon from "@public/svgs/pollia-icon.svg";
import { Typo } from "@repo/ui/components";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

// TODO: 데이터 수정 필요
const FEATURED_MISSIONS = [
  {
    id: "cmkg52ncy000gla04ya80cyo2",
    title: "2026 초미세 습관 형성\n프로젝트 참가 신청 1",
    brandLogoUrl: "",
    imageUrl:
      "https://jjrsknqxiqbzqiraexpc.supabase.co/storage/v1/object/public/mission-images/f54437e4-95c6-4232-b927-f2b995b09a14/1768522947884.jpg",
  },
  {
    id: "cmkg52ncy000gla04ya80cyo2",
    title: "2026 초미세 습관 형성\n프로젝트 참가 신청 2",
    brandLogoUrl: "",
    imageUrl:
      "https://jjrsknqxiqbzqiraexpc.supabase.co/storage/v1/object/public/mission-images/f54437e4-95c6-4232-b927-f2b995b09a14/1768522947884.jpg",
  },
];

export function BannerSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const total = FEATURED_MISSIONS.length;

  const goToNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % total);
  }, [total]);

  const goToPrev = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (total <= 1) return;
    const interval = setInterval(goToNext, 3000);
    return () => clearInterval(interval);
  }, [goToNext, total]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? 0;
    isDragging.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    touchDeltaX.current = (e.touches[0]?.clientX ?? 0) - touchStartX.current;
  };

  const handleTouchEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (touchDeltaX.current < -50) goToNext();
    else if (touchDeltaX.current > 50) goToPrev();
    touchDeltaX.current = 0;
  };

  const mission = FEATURED_MISSIONS[currentIndex];

  return (
    <section className="px-5">
      <div
        ref={containerRef}
        className="relative aspect-square w-full overflow-hidden rounded-2xl shadow-[0_4px_20px_rgba(9,9,11,0.08)]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* 슬라이드 영역 (이미지) */}
        <div
          className="flex h-full transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {FEATURED_MISSIONS.map((m, index) => (
            <Link
              key={m.id + index}
              href={`https://pollia.me/${ROUTES.MISSION(m.id)}`}
              className="relative size-full shrink-0"
            >
              <Image
                src={m.imageUrl}
                alt={m.title}
                fill
                sizes="(max-width: 600px) 100vw, 600px"
                className="object-cover"
                priority
              />
            </Link>
          ))}
        </div>

        {/* 그라데이션 + 로고 + 타이틀 (슬라이드 트랙 밖, fade-up 애니메이션) */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-b from-transparent to-[#27272A] px-10 pb-10 pt-[60px]">
          <div key={currentIndex} className="flex flex-col gap-3 animate-fade-up">
            <div
              className={cn(
                "shrink-0 overflow-hidden rounded-full border-[1.25px] border-zinc-200 bg-white",
                "size-[40px] sm:size-[60px]",
              )}
            >
              {mission?.brandLogoUrl ? (
                <Image
                  src={mission.brandLogoUrl}
                  alt="brand logo"
                  width={60}
                  height={60}
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center">
                  <PolliaIcon className="size-8 text-violet-500" />
                </div>
              )}
            </div>
            <Typo.MainTitle className="whitespace-pre-line break-keep text-white text-[20px] sm:text-[28px]">
              {mission?.title}
            </Typo.MainTitle>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 px-10 pb-10">
          <div className="flex items-end justify-end">
            <div className="pointer-events-auto flex shrink-0 items-center gap-2">
              <button
                type="button"
                className="flex size-[26px] items-center justify-center rounded-full bg-black/40"
                onClick={goToNext}
              >
                <PlayIcon className="size-[18px] fill-white" />
              </button>
              <span className="rounded-md bg-black/40 px-2 py-1">
                <Typo.Body size="small" className="text-white">
                  {currentIndex + 1} / {total}
                </Typo.Body>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
