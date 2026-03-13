"use client";

import { useReadActionStats } from "@/hooks/action-stats/useReadActionStats";
import type { ActionStatItem } from "@/types/dto/action-stats";
import { Typo } from "@repo/ui/components";
import { ChevronDown } from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
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
  const [isOpen, setIsOpen] = useState(false);
  const { data, isPending, error } = useReadActionStats(missionId);
  const items = data?.data ?? [];

  const handleToggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return (
    <section className="border border-zinc-200 bg-white">
      <button
        type="button"
        onClick={handleToggle}
        className="flex w-full items-center justify-between px-5 py-4"
      >
        <div className="flex items-center gap-2">
          <Typo.SubTitle>질문별 통계</Typo.SubTitle>
          {items.length > 0 && (
            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-600">
              {items.length}개 질문
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
              아직 질문이 없습니다.
            </div>
          ) : (
            <div className="space-y-6">
              {items.map(item => (
                <ActionStatCard key={item.actionId} item={item} />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
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
