"use client";

import { useReadActionStats } from "@/hooks/action-stats/useReadActionStats";
import { useReadQuizStats } from "@/hooks/quiz-stats/useReadQuizStats";
import type { ActionStatItem } from "@/types/dto/action-stats";
import type { QuizQuestionCorrectRate } from "@/types/dto/quiz-stats";
import { Typo } from "@repo/ui/components";
import { ChevronDown } from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";
import { CountOnlyDisplay } from "../../../../missions/[missionId]/components/action-stats/CountOnlyDisplay";
import { TextResponseList } from "../../../../missions/[missionId]/components/action-stats/TextResponseList";

const QuizChoiceBarChart = dynamic(
  () => import("./QuizChoiceBarChart").then(m => ({ default: m.QuizChoiceBarChart })),
  { ssr: false },
);
const ScaleDistributionChart = dynamic(
  () =>
    import("../../../../missions/[missionId]/components/action-stats/ScaleDistributionChart").then(
      m => ({ default: m.ScaleDistributionChart }),
    ),
  { ssr: false },
);

interface QuizActionStatsSectionProps {
  missionId: string;
}

export function QuizActionStatsSection({ missionId }: QuizActionStatsSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const actionStatsQuery = useReadActionStats(missionId);
  const quizStatsQuery = useReadQuizStats(missionId);

  const items = actionStatsQuery.data?.data ?? [];
  const questionStats = quizStatsQuery.data?.data?.questionStats ?? [];
  const isPending = actionStatsQuery.isPending || quizStatsQuery.isPending;
  const error = actionStatsQuery.error || quizStatsQuery.error;

  const questionStatMap = useMemo(
    () => new Map(questionStats.map(q => [q.actionId, q])),
    [questionStats],
  );

  const handleToggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return (
    <section>
      <button
        type="button"
        onClick={handleToggle}
        className="flex w-full items-center justify-between px-5 py-4"
      >
        <div className="flex items-center gap-2">
          <Typo.SubTitle>문항별 통계</Typo.SubTitle>
          {items.length > 0 && (
            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-600">
              {items.length}개 문항
            </span>
          )}
        </div>
        <ChevronDown
          className={`size-5 text-zinc-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="px-5 pb-5">
          {isPending ? (
            <div className="flex h-[180px] items-center justify-center text-sm text-zinc-500">
              데이터를 불러오는 중입니다.
            </div>
          ) : error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              통계를 불러오지 못했습니다.
            </div>
          ) : items.length === 0 ? (
            <div className="flex h-[180px] items-center justify-center text-sm text-zinc-500">
              아직 문항이 없습니다.
            </div>
          ) : (
            <div className="space-y-6">
              {items.map(item => (
                <QuizActionStatCard
                  key={item.actionId}
                  item={item}
                  questionStat={questionStatMap.get(item.actionId)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function QuizActionStatCard({
  item,
  questionStat,
}: { item: ActionStatItem; questionStat?: QuizQuestionCorrectRate }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium text-zinc-800">{item.title}</h4>
          {questionStat && questionStat.totalCount > 0 && (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
              정답률 {questionStat.correctRate}%
            </span>
          )}
        </div>
        <span className="text-xs text-zinc-400">{item.totalResponses}건</span>
      </div>
      <QuizActionStatRenderer item={item} questionStat={questionStat} />
    </div>
  );
}

function QuizActionStatRenderer({
  item,
  questionStat,
}: { item: ActionStatItem; questionStat?: QuizQuestionCorrectRate }) {
  switch (item.type) {
    case "choice":
      return <QuizChoiceBarChart data={item} questionStat={questionStat} />;
    case "scale":
      return <ScaleDistributionChart data={item} />;
    case "text":
      return <TextResponseList data={item} />;
    case "count":
      return <CountOnlyDisplay data={item} />;
  }
}
