"use client";

import { useReadDailyParticipationTrend, useReadMissionStats } from "@/hooks/mission-response";
import { formatMillisecondsToKorean } from "@/lib/utils";
import type { DateRangeString } from "@/types/common/dateRange";
import { Typo } from "@repo/ui/components";
import { useMemo } from "react";

interface StatsSummaryCardsProps {
  missionId: string;
  dateRange: DateRangeString | undefined;
}

export function StatsSummaryCards({ missionId, dateRange }: StatsSummaryCardsProps) {
  const {
    data: statsData,
    isPending: statsPending,
    error: statsError,
  } = useReadMissionStats(missionId, dateRange);
  const { data: trendData, isPending: trendPending } = useReadDailyParticipationTrend(
    missionId,
    dateRange,
  );
  const stats = statsData?.data;
  const trend = trendData?.data;

  const periodTotal = useMemo(() => {
    if (!trend) return 0;
    return trend.reduce((sum, item) => sum + item.count, 0);
  }, [trend]);

  const periodCompletionRate = useMemo(() => {
    if (!stats || periodTotal === 0) return 0;
    return (stats.completed / periodTotal) * 100;
  }, [stats, periodTotal]);

  const isPending = statsPending || trendPending;

  if (statsError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        통계를 불러오지 못했습니다.
      </div>
    );
  }

  const cards = [
    {
      title: "참여 수",
      value: trend ? `${periodTotal}명` : "-",
    },
    {
      title: "완주율",
      value: stats && trend ? `${periodCompletionRate.toFixed(1)}%` : "-",
    },
    {
      title: "평균 소요 시간",
      value: stats?.averageDurationMs ? formatMillisecondsToKorean(stats.averageDurationMs) : "-",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
