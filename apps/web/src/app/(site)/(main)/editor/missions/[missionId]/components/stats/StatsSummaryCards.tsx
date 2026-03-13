"use client";

import { useReadMissionStats } from "@/hooks/mission-response";
import { formatMillisecondsToKorean } from "@/lib/utils";
import type { DateRangeString } from "@/types/common/dateRange";
import { Typo } from "@repo/ui/components";

interface StatsSummaryCardsProps {
  missionId: string;
  dateRange: DateRangeString | undefined;
}

export function StatsSummaryCards({ missionId, dateRange }: StatsSummaryCardsProps) {
  const { data, isPending, error } = useReadMissionStats(missionId, dateRange);
  const stats = data?.data;

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        통계를 불러오지 못했습니다.
      </div>
    );
  }

  const cards = [
    {
      title: "총 참여 수",
      value: stats ? `${stats.total}명` : "-",
    },
    {
      title: "완주율",
      value: stats ? `${stats.completionRate.toFixed(1)}%` : "-",
    },
    {
      title: "평균 소요 시간",
      value: stats?.averageDurationMs ? formatMillisecondsToKorean(stats.averageDurationMs) : "-",
    },
    {
      title: "공유 수",
      value: stats ? `${stats.shareCount}회` : "-",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map(card => (
        <div key={card.title} className="rounded-xl border border-zinc-200 bg-white p-4">
          <Typo.Body size="small" className="text-zinc-500">
            {card.title}
          </Typo.Body>
          <Typo.SubTitle className="mt-1 text-xl">{isPending ? "..." : card.value}</Typo.SubTitle>
        </div>
      ))}
    </div>
  );
}
