"use client";

import type { AiReportData } from "@/types/dto";
import { Typo } from "@repo/ui/components";
import { ArrowRight } from "lucide-react";

interface InsightsSlideProps {
  data: AiReportData;
}

export function InsightsSlide({ data }: InsightsSlideProps) {
  const { insights, suggestions } = data.ai;

  return (
    <div className="flex h-full flex-col overflow-y-auto px-7 py-7">
      <div className="mb-5 flex items-center gap-2.5">
        <span className="flex size-6 items-center justify-center rounded-md bg-violet-600 text-xs font-bold text-white">
          7
        </span>
        <Typo.SubTitle>인사이트 & 제안</Typo.SubTitle>
      </div>

      {insights.length > 0 && (
        <div className="mb-5">
          <div className="mb-2.5 text-xs font-medium text-zinc-400">주요 인사이트</div>
          <div className="space-y-2">
            {insights.map((insight, i) => (
              <div key={i} className="flex gap-3 rounded-xl bg-zinc-50/80 px-4 py-3.5">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-xs font-bold text-violet-600">
                  {i + 1}
                </div>
                <Typo.Body size="medium" className="leading-relaxed text-zinc-600">
                  {insight}
                </Typo.Body>
              </div>
            ))}
          </div>
        </div>
      )}

      {suggestions.length > 0 && (
        <div>
          <div className="mb-2.5 text-xs font-medium text-zinc-400">개선 제안</div>
          <div className="space-y-1.5">
            {suggestions.map((suggestion, i) => (
              <div key={i} className="flex items-start gap-2 rounded-lg px-1 py-1.5">
                <ArrowRight className="mt-0.5 size-3.5 shrink-0 text-violet-400" />
                <Typo.Body size="medium" className="leading-relaxed text-zinc-600">
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
