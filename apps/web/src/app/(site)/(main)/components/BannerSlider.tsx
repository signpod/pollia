"use client";

import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import PauseIcon from "@public/svgs/pause-icon.svg";
import PlayIcon from "@public/svgs/play-icon.svg";
import { Typo } from "@repo/ui/components";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

// TODO: 데이터 수정 필요
const FEATURED_MISSIONS = [
  {
    id: "cmmiuqm3h000hkz040g6ywtia",
    imageUrl: "/images/01.jpg",
  },
  {
    id: "cmme8bjkt0003jm04g04tdw8v",
    imageUrl: "/images/02.jpg",
  },
];

export function BannerSlider() {
  const total = FEATURED_MISSIONS.length;
  const [displayIndex, setDisplayIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [swipeKey, setSwipeKey] = useState(0);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchDeltaX = useRef(0);
  const isHorizontalSwipe = useRef(false);
  const isDragging = useRef(false);
  const isSwiped = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const extendedSlides = [
    FEATURED_MISSIONS[total - 1]!,
    ...FEATURED_MISSIONS,
    FEATURED_MISSIONS[0]!,
  ];

  const realIndex = (((displayIndex - 1) % total) + total) % total;

  const goToNext = useCallback(() => {
    setIsTransitioning(true);
    setDisplayIndex(prev => prev + 1);
  }, []);

  const goToPrev = useCallback(() => {
    setIsTransitioning(true);
    setDisplayIndex(prev => prev - 1);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const handleTransitionEnd = () => {
      if (displayIndex >= total + 1) {
        setIsTransitioning(false);
        setDisplayIndex(1);
      } else if (displayIndex <= 0) {
        setIsTransitioning(false);
        setDisplayIndex(total);
      }
    };

    track.addEventListener("transitionend", handleTransitionEnd);
    return () => track.removeEventListener("transitionend", handleTransitionEnd);
  }, [displayIndex, total]);

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

  return (
    <section>
      <div
        ref={containerRef}
        className="relative aspect-[3/2] w-full overflow-hidden"
        style={{ touchAction: "pan-y" }}
      >
        <div
          ref={trackRef}
          className={cn(
            "flex h-full",
            isTransitioning && "transition-transform duration-500 ease-in-out",
          )}
          style={{ transform: `translateX(-${displayIndex * 100}%)` }}
        >
          {extendedSlides.map((m, index) => (
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
                alt={`Banner ${realIndex + 1}`}
                fill
                sizes="(max-width: 600px) 100vw, 600px"
                className="pointer-events-none select-none object-cover"
                draggable={false}
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent from-30% to-[#2f2f2f]" />
            </div>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-7">
          <div className="flex items-end justify-end">
            <div className="pointer-events-auto flex shrink-0 items-center gap-2">
              <button
                type="button"
                className="flex size-[26px] items-center justify-center rounded-full bg-black/20"
                onClick={() => setIsPlaying(prev => !prev)}
              >
                {isPlaying ? (
                  <PauseIcon className="size-[18px] text-white" />
                ) : (
                  <PlayIcon className="size-[18px] fill-white" />
                )}
              </button>
              <span className="rounded-full bg-black/20 px-2 py-1">
                <Typo.Body size="small" className="font-bold text-white">
                  {realIndex + 1} / {total}
                </Typo.Body>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
