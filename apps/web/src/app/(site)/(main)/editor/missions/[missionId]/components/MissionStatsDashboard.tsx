"use client";

import { Separator } from "@/components/ui/separator";
import { useReadMissionStats } from "@/hooks/mission-response";
import { formatMillisecondsToKorean } from "@/lib/utils";
import { Typo } from "@repo/ui/components";
import { EditorSectionCard } from "../../../components/view/EditorSectionCard";
import { ActionStatsSection } from "./action-stats/ActionStatsSection";
import { AiReportSection } from "./report/AiReportSection";
import { ResponseResultsAccordion } from "./stats/ResponseResultsAccordion";
import { ResultDistributionAccordion } from "./stats/ResultDistributionAccordion";
import { StatsDetailAccordion } from "./stats/StatsDetailAccordion";

interface MissionStatsDashboardProps {
  missionId: string;
}

export function MissionStatsDashboard({ missionId }: MissionStatsDashboardProps) {
  const statsQuery = useReadMissionStats(missionId);
  const stats = statsQuery.data?.data;

  return (
    <>
      <div className="border border-zinc-200 bg-white">
        <section className="grid grid-cols-2 gap-3 px-5 py-4 sm:grid-cols-4">
          <StatCard
            title="총 참여수"
            value={stats ? `${stats.total}명` : "-"}
            isLoading={statsQuery.isPending}
          />
          <StatCard
            title="완주율"
            value={stats ? `${stats.completionRate.toFixed(1)}%` : "-"}
            isLoading={statsQuery.isPending}
          />
          <StatCard
            title="평균 소요시간"
            value={
              stats?.averageDurationMs ? formatMillisecondsToKorean(stats.averageDurationMs) : "-"
            }
            isLoading={statsQuery.isPending}
          />
          <StatCard
            title="공유 수"
            value={stats ? `${stats.shareCount}회` : "-"}
            isLoading={statsQuery.isPending}
          />
        </section>
      </div>

      <Separator className="h-2" />

      <EditorSectionCard
        title="콘텐츠 통계"
        description="참여 현황, 결과 분포, 응답 내역을 확인합니다."
      >
        <div className="divide-y divide-zinc-200">
          <StatsDetailAccordion missionId={missionId} />
          <ResultDistributionAccordion missionId={missionId} />
          <ResponseResultsAccordion missionId={missionId} />
        </div>
      </EditorSectionCard>

      <Separator className="h-2" />

      <div className="divide-y divide-zinc-200 border border-zinc-200 bg-white">
        <ActionStatsSection missionId={missionId} />
        <AiReportSection missionId={missionId} hasResponses={(stats?.total ?? 0) > 0} />
      </div>
    </>
  );
}

export function StatCard({
  title,
  value,
  subValue,
  isLoading,
}: { title: string; value: string; subValue?: string; isLoading: boolean }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <Typo.Body size="small" className="text-zinc-500">
        {title}
      </Typo.Body>
      <Typo.SubTitle className="mt-1 text-2xl">
        {isLoading ? "..." : value}
        {!isLoading && subValue && (
          <span className="text-sm font-normal text-zinc-400">/{subValue}</span>
        )}
      </Typo.SubTitle>
    </div>
  );
}
