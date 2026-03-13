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

const SLIDE_LABELS = ["표지", "요약", "참여", "이탈", "객관식", "주관식", "결과", "인사이트"];

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
      if (e.key === "ArrowLeft") scrollPrev();
      else if (e.key === "ArrowRight") scrollNext();
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
    <div className="flex flex-col gap-3">
      <div
        className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm"
        ref={emblaRef}
      >
        <div className="flex">
          {slides.map((slide, i) => (
            <div key={i} className="min-h-[480px] w-full shrink-0">
              {slide}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={scrollPrev}
          disabled={!canScrollPrev}
          className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 disabled:cursor-not-allowed disabled:opacity-0"
        >
          <ChevronLeft className="size-4" />
        </button>

        <div className="flex items-center gap-1">
          {SLIDE_LABELS.map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => scrollTo(i)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                i === selectedIndex
                  ? "bg-violet-600 text-white shadow-sm"
                  : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={scrollNext}
          disabled={!canScrollNext}
          className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 disabled:cursor-not-allowed disabled:opacity-0"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
