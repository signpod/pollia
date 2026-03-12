"use client";

import type { AiReportData } from "@/types/dto";
import { Typo } from "@repo/ui/components";

interface SummarySlideProps {
  data: AiReportData;
}

function formatDuration(seconds: number | null): string {
  if (seconds === null) return "-";
  if (seconds < 60) return `${Math.round(seconds)}초`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return secs > 0 ? `${mins}분 ${secs}초` : `${mins}분`;
}

export function SummarySlide({ data }: SummarySlideProps) {
  const { kpis } = data.stats;

  const kpiCards = [
    { label: "총 참여자", value: `${kpis.totalParticipants}명` },
    { label: "완주율", value: `${kpis.completionRate.toFixed(1)}%` },
    { label: "평균 소요 시간", value: formatDuration(kpis.avgDurationSeconds) },
    {
      label: "공유 수",
      value: kpis.shareCount !== null ? `${kpis.shareCount}회` : "-",
      // TODO: 백엔드 연결 필요
    },
  ];

  return (
    <div className="flex h-full flex-col px-6 py-6">
      <Typo.SubTitle className="mb-4">핵심 요약</Typo.SubTitle>
      <div className="mb-6 rounded-lg bg-zinc-50 p-4">
        <Typo.Body size="medium" className="whitespace-pre-line leading-relaxed text-zinc-700">
          {data.ai.summary}
        </Typo.Body>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {kpiCards.map(card => (
          <div key={card.label} className="rounded-xl border border-zinc-200 bg-white p-4">
            <Typo.Body size="small" className="text-zinc-500">
              {card.label}
            </Typo.Body>
            <Typo.SubTitle className="mt-1 text-xl">{card.value}</Typo.SubTitle>
          </div>
        ))}
      </div>
    </div>
  );
}
