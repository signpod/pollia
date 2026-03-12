"use client";

import type { AiReportData } from "@/types/dto";
import { Typo } from "@repo/ui/components";

interface SubjectiveSlideProps {
  data: AiReportData;
}

const WORD_STYLES = [
  "text-2xl font-bold opacity-100",
  "text-xl font-semibold opacity-90",
  "text-lg font-medium opacity-80",
  "text-base font-medium opacity-70",
  "text-sm opacity-60",
];

const ROTATIONS = ["-rotate-6", "rotate-3", "-rotate-2", "rotate-6", "rotate-0"];

export function SubjectiveSlide({ data }: SubjectiveSlideProps) {
  const { subjective } = data.ai;
  const { topKeywords, sentiment } = subjective;

  const total = sentiment.positive + sentiment.neutral + sentiment.negative;
  const positivePercent = total > 0 ? Math.round((sentiment.positive / total) * 100) : 33;
  const neutralPercent = total > 0 ? Math.round((sentiment.neutral / total) * 100) : 34;
  const negativePercent = total > 0 ? 100 - positivePercent - neutralPercent : 33;

  return (
    <div className="flex h-full flex-col overflow-y-auto px-6 py-6">
      <Typo.SubTitle className="mb-4">주관식 분석</Typo.SubTitle>

      {topKeywords.length > 0 && (
        <div className="mb-5">
          <Typo.Body size="small" className="mb-3 text-zinc-500">
            키워드 TOP {topKeywords.length}
          </Typo.Body>
          <div className="flex flex-wrap items-center justify-center gap-3 rounded-lg bg-zinc-50 px-4 py-5">
            {topKeywords.map((kw, i) => (
              <span
                key={kw.keyword}
                className={`inline-block text-zinc-700 ${WORD_STYLES[i] ?? WORD_STYLES[WORD_STYLES.length - 1]} ${ROTATIONS[i] ?? ""}`}
              >
                {kw.keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mb-5">
        <Typo.Body size="small" className="mb-2 text-zinc-500">
          감성 분석
        </Typo.Body>
        <div className="flex h-5 w-full overflow-hidden rounded-full">
          {positivePercent > 0 && (
            <div
              className="flex items-center justify-center bg-emerald-400 text-[10px] font-medium text-white"
              style={{ width: `${positivePercent}%` }}
            >
              {positivePercent}%
            </div>
          )}
          {neutralPercent > 0 && (
            <div
              className="flex items-center justify-center bg-zinc-300 text-[10px] font-medium text-zinc-600"
              style={{ width: `${neutralPercent}%` }}
            >
              {neutralPercent}%
            </div>
          )}
          {negativePercent > 0 && (
            <div
              className="flex items-center justify-center bg-rose-400 text-[10px] font-medium text-white"
              style={{ width: `${negativePercent}%` }}
            >
              {negativePercent}%
            </div>
          )}
        </div>
        <div className="mt-1.5 flex justify-between text-xs text-zinc-500">
          <span>긍정 {positivePercent}%</span>
          <span>중립 {neutralPercent}%</span>
          <span>부정 {negativePercent}%</span>
        </div>
      </div>

      {subjective.summary && (
        <div className="rounded-lg bg-zinc-50 p-4">
          <Typo.Body size="small" className="mb-1 font-medium text-zinc-600">
            AI 요약
          </Typo.Body>
          <Typo.Body size="medium" className="whitespace-pre-line leading-relaxed text-zinc-700">
            {subjective.summary}
          </Typo.Body>
        </div>
      )}
    </div>
  );
}
