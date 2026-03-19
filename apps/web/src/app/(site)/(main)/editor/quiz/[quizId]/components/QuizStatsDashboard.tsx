"use client";

import { Separator } from "@/components/ui/separator";
import { useReadMissionStats } from "@/hooks/mission-response";
import { useReadQuizStats } from "@/hooks/quiz-stats/useReadQuizStats";
import { formatMillisecondsToKorean } from "@/lib/utils";
import { EditorSectionCard } from "../../../components/view/EditorSectionCard";
import { StatCard } from "../../../missions/[missionId]/components/MissionStatsDashboard";
import { AiReportSection } from "../../../missions/[missionId]/components/report/AiReportSection";
import { ResponseResultsAccordion } from "../../../missions/[missionId]/components/stats/ResponseResultsAccordion";
import { ResultDistributionAccordion } from "../../../missions/[missionId]/components/stats/ResultDistributionAccordion";
import { StatsDetailAccordion } from "../../../missions/[missionId]/components/stats/StatsDetailAccordion";
import { QuizActionStatsSection } from "./stats/QuizActionStatsSection";

interface QuizStatsDashboardProps {
  missionId: string;
}

export function QuizStatsDashboard({ missionId }: QuizStatsDashboardProps) {
  const statsQuery = useReadMissionStats(missionId);
  const stats = statsQuery.data?.data;

  const quizStatsQuery = useReadQuizStats(missionId);
  const quizStats = quizStatsQuery.data?.data;

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
            title="평균 점수"
            value={quizStats ? `${quizStats.averageTotalScore}점` : "-"}
            subValue={quizStats ? `${quizStats.perfectScore}점` : undefined}
            isLoading={quizStatsQuery.isPending}
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
        <QuizActionStatsSection missionId={missionId} />
        <AiReportSection missionId={missionId} hasResponses={(stats?.total ?? 0) > 0} />
      </div>
    </>
  );
}
