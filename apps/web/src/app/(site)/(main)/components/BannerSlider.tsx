"use client";

import { cn } from "@/lib/utils";
import PauseIcon from "@public/svgs/pause-icon.svg";
import PlayIcon from "@public/svgs/play-icon.svg";
import { Typo } from "@repo/ui/components";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

interface BannerSlide {
  id: string;
  imageUrl: string;
  title: string;
  /** 화면에 노출되지 않으며, 웹 접근성을 위한 이미지 alt 값으로 사용 */
  subtitle: string | null;
  linkUrl: string | null;
}

interface BannerSliderProps {
  slides: BannerSlide[];
}

export function BannerSlider({ slides }: BannerSliderProps) {
  const total = slides.length;
  const [displayIndex, setDisplayIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const swipeKeyRef = useRef(0);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchDeltaX = useRef(0);
  const isHorizontalSwipe = useRef(false);
  const isDragging = useRef(false);
  const isSwiped = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const realIndex = total > 0 ? (((displayIndex - 1) % total) + total) % total : 0;

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
  }, [goToNext, total, isPlaying]);

  const finishDrag = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (touchDeltaX.current < -50) {
      isSwiped.current = true;
      goToNext();
      swipeKeyRef.current += 1;
    } else if (touchDeltaX.current > 50) {
      isSwiped.current = true;
      goToPrev();
      swipeKeyRef.current += 1;
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

  if (total === 0) return null;

  const lastSlide = slides[total - 1] as BannerSlide;
  const firstSlide = slides[0] as BannerSlide;
  const extendedSlides = [lastSlide, ...slides, firstSlide];

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
              key={`${m.id}-${index}`}
              role={m.linkUrl ? "link" : undefined}
              tabIndex={m.linkUrl ? 0 : undefined}
              className={cn(
                "relative size-full shrink-0 select-none",
                m.linkUrl && "cursor-pointer",
              )}
              onClick={() => {
                if (isSwiped.current || !m.linkUrl) return;
                window.open(m.linkUrl, "_blank", "noopener,noreferrer");
              }}
              onKeyDown={e => {
                if (e.key === "Enter" && m.linkUrl) {
                  window.open(m.linkUrl, "_blank", "noopener,noreferrer");
                }
              }}
            >
              <Image
                src={m.imageUrl}
                alt={m.subtitle || m.title}
                fill
                sizes="(max-width: 600px) 100vw, 600px"
                className="pointer-events-none select-none object-cover"
                draggable={false}
                priority
              />
              {m.title && (
                <div className="absolute inset-0 bg-gradient-to-b from-transparent from-50% to-[#2F2F2F]" />
              )}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between p-7 gap-3">
                {m.title ? (
                  <Typo.MainTitle
                    size="medium"
                    className="min-w-0 flex-1 break-keep-all text-white"
                  >
                    {m.title}
                  </Typo.MainTitle>
                ) : (
                  <div />
                )}
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
          ))}
        </div>
      </div>
    </section>
  );
}
