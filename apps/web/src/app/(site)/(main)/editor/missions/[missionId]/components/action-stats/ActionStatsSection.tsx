"use client";

import { useReadActionStats } from "@/hooks/action-stats/useReadActionStats";
import type { ActionStatItem } from "@/types/dto/action-stats";
import { BarChart3 } from "lucide-react";
import dynamic from "next/dynamic";
import { StatsAccordion } from "../StatsAccordion";
import { CountOnlyDisplay } from "./CountOnlyDisplay";
import { TextResponseList } from "./TextResponseList";

const ChoiceBarChart = dynamic(
  () => import("./ChoiceBarChart").then(m => ({ default: m.ChoiceBarChart })),
  { ssr: false },
);
const ScaleDistributionChart = dynamic(
  () => import("./ScaleDistributionChart").then(m => ({ default: m.ScaleDistributionChart })),
  { ssr: false },
);

interface ActionStatsSectionProps {
  missionId: string;
}

export function ActionStatsSection({ missionId }: ActionStatsSectionProps) {
  const { data, isPending, error } = useReadActionStats(missionId);
  const items = data?.data ?? [];

  return (
    <StatsAccordion
      icon={BarChart3}
      title="액션별 통계"
      badge={
        items.length > 0 ? (
          <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-600">
            {items.length}개 액션
          </span>
        ) : null
      }
    >
      {isPending ? (
        <div className="flex items-center justify-center px-5 py-20">
          <div className="size-6 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
        </div>
      ) : error ? (
        <div className="px-5 py-10 text-center text-sm text-red-500">
          통계를 불러오지 못했습니다.
        </div>
      ) : items.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-zinc-400">아직 액션이 없습니다.</div>
      ) : (
        <div className="space-y-6 px-5 py-5">
          {items.map(item => (
            <ActionStatCard key={item.actionId} item={item} />
          ))}
        </div>
      )}
    </StatsAccordion>
  );
}

function ActionStatCard({ item }: { item: ActionStatItem }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-zinc-800">{item.title}</h4>
        <span className="text-xs text-zinc-400">{item.totalResponses}건</span>
      </div>
      <ActionStatRenderer item={item} />
    </div>
  );
}

function ActionStatRenderer({ item }: { item: ActionStatItem }) {
  switch (item.type) {
    case "choice":
      return <ChoiceBarChart data={item} />;
    case "scale":
      return <ScaleDistributionChart data={item} />;
    case "text":
      return <TextResponseList data={item} />;
    case "count":
      return <CountOnlyDisplay data={item} />;
  }
}
