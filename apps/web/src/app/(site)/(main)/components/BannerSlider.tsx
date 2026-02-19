"use client";

import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import PauseIcon from "@public/svgs/pause-icon.svg";
import PlayIcon from "@public/svgs/play-icon.svg";
import PolliaIcon from "@public/svgs/pollia-icon.svg";
import { Typo } from "@repo/ui/components";
import Image from "next/image";
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
  const [isPlaying, setIsPlaying] = useState(true);
  const [swipeKey, setSwipeKey] = useState(0);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchDeltaX = useRef(0);
  const isHorizontalSwipe = useRef(false);
  const isDragging = useRef(false);
  const isSwiped = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const total = FEATURED_MISSIONS.length;

  const goToNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % total);
  }, [total]);

  const goToPrev = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (total <= 1 || !isPlaying) return;
    const interval = setInterval(goToNext, 3000);
    return () => clearInterval(interval);
  }, [goToNext, total, isPlaying, swipeKey]);

  const finishDrag = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (touchDeltaX.current < -50) {
      isSwiped.current = true;
      goToNext();
      setSwipeKey(k => k + 1);
    } else if (touchDeltaX.current > 50) {
      isSwiped.current = true;
      goToPrev();
      setSwipeKey(k => k + 1);
    }
    touchDeltaX.current = 0;
    isHorizontalSwipe.current = false;
  }, [goToNext, goToPrev]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const startDrag = (x: number, y: number) => {
      touchStartX.current = x;
      touchStartY.current = y;
      touchDeltaX.current = 0;
      isDragging.current = true;
      isSwiped.current = false;
      isHorizontalSwipe.current = false;
    };

    const moveDrag = (x: number, y: number, preventDefault: () => void) => {
      if (!isDragging.current) return;
      const dx = x - touchStartX.current;
      const dy = y - touchStartY.current;
      touchDeltaX.current = dx;

      if (!isHorizontalSwipe.current && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 5) {
        isHorizontalSwipe.current = true;
      }

      if (isHorizontalSwipe.current) {
        preventDefault();
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      startDrag(e.touches[0]?.clientX ?? 0, e.touches[0]?.clientY ?? 0);
    };

    const onTouchMove = (e: TouchEvent) => {
      moveDrag(e.touches[0]?.clientX ?? 0, e.touches[0]?.clientY ?? 0, () => e.preventDefault());
    };

    const onMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      startDrag(e.clientX, e.clientY);
    };

    const onMouseMove = (e: MouseEvent) => {
      moveDrag(e.clientX, e.clientY, () => e.preventDefault());
    };

    const onDragEnd = () => finishDrag();

    container.addEventListener("touchstart", onTouchStart, { passive: false });
    container.addEventListener("touchmove", onTouchMove, { passive: false });
    container.addEventListener("touchend", onDragEnd);
    container.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onDragEnd);

    return () => {
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchmove", onTouchMove);
      container.removeEventListener("touchend", onDragEnd);
      container.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onDragEnd);
    };
  }, [finishDrag]);

  const handleSlideClick = (missionId: string) => {
    if (isSwiped.current) {
      isSwiped.current = false;
      return;
    }
    window.location.href = `https://pollia.me/${ROUTES.MISSION(missionId)}`;
  };

  const mission = FEATURED_MISSIONS[currentIndex];

  return (
    <section className="px-5">
      <div
        ref={containerRef}
        className="relative aspect-square w-full overflow-hidden rounded-2xl shadow-[0_4px_20px_rgba(9,9,11,0.08)]"
        style={{ touchAction: "pan-y" }}
      >
        {/* 슬라이드 영역 (이미지) */}
        <div
          className="flex h-full transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {FEATURED_MISSIONS.map((m, index) => (
            <div
              key={m.id + index}
              className="relative size-full shrink-0 cursor-grab select-none active:cursor-grabbing"
              role="button"
              tabIndex={0}
              onClick={() => handleSlideClick(m.id)}
              onKeyDown={e => {
                if (e.key === "Enter") handleSlideClick(m.id);
              }}
            >
              <Image
                src={m.imageUrl}
                alt={m.title}
                fill
                sizes="(max-width: 600px) 100vw, 600px"
                className="pointer-events-none select-none object-cover"
                draggable={false}
                priority
              />
            </div>
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
                onClick={() => setIsPlaying(prev => !prev)}
              >
                {isPlaying ? (
                  <PauseIcon className="size-[18px] text-white" />
                ) : (
                  <PlayIcon className="size-[18px] fill-white" />
                )}
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
