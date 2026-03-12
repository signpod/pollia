"use client";

import type { AiReportData } from "@/types/dto";
import { Typo } from "@repo/ui/components";
import { Sparkles } from "lucide-react";

interface CoverSlideProps {
  data: AiReportData;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function CoverSlide({ data }: CoverSlideProps) {
  const { cover } = data.stats;
  const generatedDate = new Date(data.generatedAt).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const hasPeriod = cover.startDate || cover.endDate;

  return (
    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden px-8 py-12 text-center">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-violet-50/50" />
      <div className="relative z-10 flex flex-col items-center">
        <div className="mb-6 flex items-center gap-1.5 rounded-full bg-violet-100 px-3.5 py-1.5 text-xs font-semibold text-violet-600">
          <Sparkles className="size-3" />
          AI 통계 리포트
        </div>
        <Typo.MainTitle className="mb-3 max-w-md text-2xl leading-snug sm:text-3xl">
          {cover.missionTitle}
        </Typo.MainTitle>
        {hasPeriod && (
          <Typo.Body size="medium" className="mb-2 text-zinc-400">
            {formatDate(cover.startDate)} ~ {formatDate(cover.endDate)}
          </Typo.Body>
        )}
        <div className="mt-4 h-px w-12 bg-zinc-200" />
        <Typo.Body size="small" className="mt-4 text-zinc-400">
          {generatedDate} 생성
        </Typo.Body>
      </div>
    </div>
  );
}
