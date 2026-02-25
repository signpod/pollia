"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

const BANNERS = [
  { id: "banner1", title: "배너 1", imageUrl: "/banners/banner1.png" },
  { id: "banner2", title: "배너 2", imageUrl: "/banners/banner2.png" },
  { id: "banner3", title: "배너 3", imageUrl: "/banners/banner3.png" },
];

export function BannerSlider() {
  const total = BANNERS.length;
  const [displayIndex, setDisplayIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchDeltaX = useRef(0);
  const isHorizontalSwipe = useRef(false);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const extendedSlides = [BANNERS[total - 1]!, ...BANNERS, BANNERS[0]!];

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
    if (total <= 1) return;
    const interval = setInterval(goToNext, 3000);
    return () => clearInterval(interval);
  }, [goToNext, total]);

  const finishDrag = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (touchDeltaX.current < -50) {
      goToNext();
    } else if (touchDeltaX.current > 50) {
      goToPrev();
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

  return (
    <section className="px-5">
      <div
        ref={containerRef}
        className="relative aspect-[5/2] w-full overflow-hidden rounded-2xl shadow-[0_4px_20px_rgba(9,9,11,0.08)]"
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
          {extendedSlides.map((banner, index) => (
            <div
              key={banner.id + index}
              className="relative size-full shrink-0 cursor-grab select-none active:cursor-grabbing"
            >
              <Image
                src={banner.imageUrl}
                alt={banner.title}
                fill
                sizes="(max-width: 600px) 100vw, 600px"
                className="pointer-events-none select-none object-cover"
                draggable={false}
                priority
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
