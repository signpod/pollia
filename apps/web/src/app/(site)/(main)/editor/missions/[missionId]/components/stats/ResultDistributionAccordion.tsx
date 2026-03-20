"use client";

import { useReadMissionStats } from "@/hooks/mission-response";
import { Typo } from "@repo/ui/components";
import { ChevronDown } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

interface ResultDistributionAccordionProps {
  missionId: string;
}

const BAR_COLORS = ["#18181b", "#3f3f46", "#52525b", "#71717a", "#a1a1aa"];

export function ResultDistributionAccordion({ missionId }: ResultDistributionAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data, isPending, error } = useReadMissionStats(missionId);

  const handleToggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const items = useMemo(() => {
    const stats = data?.data?.completionReachStats;
    if (!stats || stats.length === 0) return [];

    const maxCount = Math.max(...stats.map(s => s.encounterCount));

    return stats.map(item => ({
      id: item.completionId,
      name: item.completionTitle,
      count: item.encounterCount,
      rate: item.reachRate,
      percent: maxCount > 0 ? (item.encounterCount / maxCount) * 100 : 0,
    }));
  }, [data]);

  return (
    <section>
      <button
        type="button"
        onClick={handleToggle}
        className="flex w-full items-center justify-between px-5 py-4"
      >
        <Typo.SubTitle>결과 분포</Typo.SubTitle>
        <ChevronDown
          className={`size-5 text-zinc-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="px-5 pb-5">
          {isPending && (
            <div className="flex h-[180px] items-center justify-center text-sm text-zinc-500">
              결과 분포를 불러오는 중입니다.
            </div>
          )}

          {!isPending && error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              결과 분포 데이터를 불러오지 못했습니다.
            </div>
          )}

          {!isPending && !error && items.length === 0 && (
            <div className="flex h-[180px] items-center justify-center text-sm text-zinc-500">
              완료화면이 없습니다.
            </div>
          )}

          {!isPending && !error && items.length > 0 && (
            <div className="flex flex-col gap-3">
              {items.map((item, index) => (
                <div key={item.id} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-700 truncate max-w-[60%]">{item.name}</span>
                    <span className="text-sm tabular-nums text-zinc-500">
                      {item.count}명 ({item.rate.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-zinc-100">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${item.percent}%`,
                        backgroundColor: BAR_COLORS[index % BAR_COLORS.length],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
