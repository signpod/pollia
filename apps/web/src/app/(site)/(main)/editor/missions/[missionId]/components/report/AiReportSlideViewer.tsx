"use client";

import type { AiReportData } from "@/types/dto";
import useEmblaCarousel from "embla-carousel-react";
import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
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
  onExportRef?: React.MutableRefObject<(() => Promise<void>) | null>;
  onExportingChange?: (exporting: boolean) => void;
}

const SLIDE_LABELS = ["표지", "요약", "참여", "이탈", "객관식", "주관식", "결과", "인사이트"];

const PDF_WIDTH = 720;
const PDF_HEIGHT = 1024;

export function AiReportSlideViewer({
  data,
  onExportRef,
  onExportingChange,
}: AiReportSlideViewerProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, dragFree: false });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const pdfSlidesRef = useRef<HTMLDivElement>(null);

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

  const handleExportPdf = useCallback(async () => {
    if (!pdfSlidesRef.current || isExporting) return;
    setIsExporting(true);
    onExportingChange?.(true);

    try {
      const slideElements = pdfSlidesRef.current.children;
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [PDF_WIDTH, PDF_HEIGHT],
      });

      for (let i = 0; i < slideElements.length; i++) {
        const el = slideElements[i] as HTMLElement;
        const canvas = await html2canvas(el, {
          width: PDF_WIDTH,
          height: PDF_HEIGHT,
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
        });

        const imgData = canvas.toDataURL("image/png");
        if (i > 0) pdf.addPage([PDF_WIDTH, PDF_HEIGHT], "portrait");
        pdf.addImage(imgData, "PNG", 0, 0, PDF_WIDTH, PDF_HEIGHT);
      }

      const title = data.stats.cover.missionTitle || "AI 리포트";
      pdf.save(`${title}.pdf`);
    } finally {
      setIsExporting(false);
      onExportingChange?.(false);
    }
  }, [data, isExporting, onExportingChange]);

  useEffect(() => {
    if (onExportRef) onExportRef.current = handleExportPdf;
  }, [onExportRef, handleExportPdf]);

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

      {/* 오프스크린 슬라이드 (PDF 캡처용) */}
      <div
        ref={pdfSlidesRef}
        aria-hidden
        className="pointer-events-none fixed left-[-9999px] top-0"
      >
        {slides.map((slide, i) => (
          <div key={i} className="bg-white" style={{ width: PDF_WIDTH, height: PDF_HEIGHT }}>
            {slide}
          </div>
        ))}
      </div>
    </div>
  );
}
