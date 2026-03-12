"use client";

import type { AiReportData } from "@/types/dto";
import { Typo } from "@repo/ui/components";

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
    <div className="flex h-full flex-col items-center justify-center px-6 py-10 text-center">
      <div className="mb-8 rounded-full bg-zinc-100 px-4 py-1.5 text-xs font-medium text-zinc-500">
        AI 통계 리포트
      </div>
      <Typo.MainTitle className="mb-4 text-2xl leading-snug sm:text-3xl">
        {cover.missionTitle}
      </Typo.MainTitle>
      {hasPeriod && (
        <Typo.Body size="medium" className="mb-2 text-zinc-500">
          {formatDate(cover.startDate)} ~ {formatDate(cover.endDate)}
        </Typo.Body>
      )}
      <Typo.Body size="small" className="text-zinc-400">
        리포트 생성일: {generatedDate}
      </Typo.Body>
    </div>
  );
}
