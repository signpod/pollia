"use client";

import type { AiReportData } from "@/types/dto";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { CoverSlide } from "./slides/CoverSlide";
import { DropOffSlide } from "./slides/DropOffSlide";
import { InsightsSlide } from "./slides/InsightsSlide";
import { MultipleChoiceSlide } from "./slides/MultipleChoiceSlide";
import { ParticipationSlide } from "./slides/ParticipationSlide";
import { ResultDistributionSlide } from "./slides/ResultDistributionSlide";
import { SubjectiveSlide } from "./slides/SubjectiveSlide";
import { SummarySlide } from "./slides/SummarySlide";

interface AiReportSlideViewerProps {
  data: AiReportData;
}

const TOTAL_SLIDES = 8;

export function AiReportSlideViewer({ data }: AiReportSlideViewerProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, dragFree: false });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") {
        scrollPrev();
      } else if (e.key === "ArrowRight") {
        scrollNext();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [scrollPrev, scrollNext]);

  const slides = [
    <CoverSlide key="cover" data={data} />,
    <SummarySlide key="summary" data={data} />,
    <ParticipationSlide key="participation" data={data} />,
    <DropOffSlide key="dropoff" data={data} />,
    <MultipleChoiceSlide key="mc" data={data} />,
    <SubjectiveSlide key="subjective" data={data} />,
    <ResultDistributionSlide key="result" data={data} />,
    <InsightsSlide key="insights" data={data} />,
  ];

  return (
    <div className="flex flex-col">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className="rounded-md border border-zinc-200 p-1.5 text-zinc-600 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="min-w-[48px] text-center text-sm text-zinc-500">
            {selectedIndex + 1} / {TOTAL_SLIDES}
          </span>
          <button
            type="button"
            onClick={scrollNext}
            disabled={!canScrollNext}
            className="rounded-md border border-zinc-200 p-1.5 text-zinc-600 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide, i) => (
            <div key={i} className="min-h-[480px] w-full shrink-0">
              {slide}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-center gap-1.5">
        {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => scrollTo(i)}
            className={`size-2 rounded-full transition-colors ${
              i === selectedIndex ? "bg-zinc-900" : "bg-zinc-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
