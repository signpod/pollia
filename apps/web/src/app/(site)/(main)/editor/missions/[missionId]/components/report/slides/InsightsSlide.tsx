"use client";

import type { AiReportData } from "@/types/dto";
import { Typo } from "@repo/ui/components";

interface InsightsSlideProps {
  data: AiReportData;
}

export function InsightsSlide({ data }: InsightsSlideProps) {
  const { insights, suggestions } = data.ai;

  return (
    <div className="flex h-full flex-col overflow-y-auto px-6 py-6">
      <Typo.SubTitle className="mb-4">인사이트 & 제안</Typo.SubTitle>

      {insights.length > 0 && (
        <div className="mb-6">
          <Typo.Body size="small" className="mb-3 font-medium text-zinc-500">
            주요 인사이트
          </Typo.Body>
          <div className="space-y-3">
            {insights.map((insight, i) => (
              <div key={i} className="flex gap-3 rounded-lg bg-zinc-50 p-4">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-white">
                  {i + 1}
                </div>
                <Typo.Body size="medium" className="leading-relaxed text-zinc-700">
                  {insight}
                </Typo.Body>
              </div>
            ))}
          </div>
        </div>
      )}

      {suggestions.length > 0 && (
        <div>
          <Typo.Body size="small" className="mb-3 font-medium text-zinc-500">
            개선 제안
          </Typo.Body>
          <div className="space-y-2">
            {suggestions.map((suggestion, i) => (
              <div key={i} className="flex items-start gap-2 pl-1">
                <span className="mt-0.5 text-zinc-400">-</span>
                <Typo.Body size="medium" className="leading-relaxed text-zinc-700">
                  {suggestion}
                </Typo.Body>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
