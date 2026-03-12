"use client";

import type { AiReportData } from "@/types/dto";
import { Typo } from "@repo/ui/components";

interface SubjectiveSlideProps {
  data: AiReportData;
}

const KEYWORD_COLORS = [
  "text-violet-700",
  "text-violet-600",
  "text-violet-500",
  "text-violet-500/80",
  "text-violet-400",
];

const KEYWORD_SIZES = [
  "text-2xl font-bold",
  "text-xl font-semibold",
  "text-lg font-medium",
  "text-base font-medium",
  "text-sm font-medium",
];

export function SubjectiveSlide({ data }: SubjectiveSlideProps) {
  const { subjective } = data.ai;
  const { topKeywords, sentiment } = subjective;

  const total = sentiment.positive + sentiment.neutral + sentiment.negative;
  const positivePercent = total > 0 ? Math.round((sentiment.positive / total) * 100) : 33;
  const neutralPercent = total > 0 ? Math.round((sentiment.neutral / total) * 100) : 34;
  const negativePercent = total > 0 ? 100 - positivePercent - neutralPercent : 33;

  return (
    <div className="flex h-full flex-col overflow-y-auto px-7 py-7">
      <div className="mb-5 flex items-center gap-2.5">
        <span className="flex size-6 items-center justify-center rounded-md bg-violet-600 text-xs font-bold text-white">
          5
        </span>
        <Typo.SubTitle>주관식 분석</Typo.SubTitle>
      </div>

      {topKeywords.length > 0 && (
        <div className="mb-5">
          <div className="mb-2 text-xs font-medium text-zinc-400">
            키워드 TOP {topKeywords.length}
          </div>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2 rounded-xl bg-zinc-50/80 px-5 py-4">
            {topKeywords.map((kw, i) => (
              <span
                key={kw.keyword}
                className={`inline-block ${KEYWORD_COLORS[i] ?? KEYWORD_COLORS[KEYWORD_COLORS.length - 1]} ${KEYWORD_SIZES[i] ?? KEYWORD_SIZES[KEYWORD_SIZES.length - 1]}`}
              >
                {kw.keyword}
                <span className="ml-0.5 text-xs font-normal opacity-50">{kw.count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mb-5">
        <div className="mb-2 text-xs font-medium text-zinc-400">감성 분석</div>
        <div className="flex h-6 w-full overflow-hidden rounded-lg">
          {positivePercent > 0 && (
            <div
              className="flex items-center justify-center bg-emerald-400 text-[10px] font-semibold text-white"
              style={{ width: `${positivePercent}%` }}
            >
              {positivePercent > 10 && `${positivePercent}%`}
            </div>
          )}
          {neutralPercent > 0 && (
            <div
              className="flex items-center justify-center bg-zinc-300 text-[10px] font-semibold text-zinc-600"
              style={{ width: `${neutralPercent}%` }}
            >
              {neutralPercent > 10 && `${neutralPercent}%`}
            </div>
          )}
          {negativePercent > 0 && (
            <div
              className="flex items-center justify-center bg-rose-400 text-[10px] font-semibold text-white"
              style={{ width: `${negativePercent}%` }}
            >
              {negativePercent > 10 && `${negativePercent}%`}
            </div>
          )}
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-zinc-400">
          <div className="flex items-center gap-1">
            <span className="inline-block size-2 rounded-full bg-emerald-400" />
            긍정 {positivePercent}%
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block size-2 rounded-full bg-zinc-300" />
            중립 {neutralPercent}%
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block size-2 rounded-full bg-rose-400" />
            부정 {negativePercent}%
          </div>
        </div>
      </div>

      {subjective.summary && (
        <div className="rounded-xl border-l-2 border-violet-400 bg-zinc-50/80 py-3 pl-4 pr-4">
          <div className="mb-1 text-xs font-semibold text-violet-600">AI 요약</div>
          <Typo.Body size="medium" className="whitespace-pre-line leading-relaxed text-zinc-600">
            {subjective.summary}
          </Typo.Body>
        </div>
      )}
    </div>
  );
}
