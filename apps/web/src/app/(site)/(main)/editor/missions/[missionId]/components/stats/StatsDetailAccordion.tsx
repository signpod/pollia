"use client";

import type { DateRangeString } from "@/types/common/dateRange";
import { Typo } from "@repo/ui/components";
import { ChevronDown } from "lucide-react";
import { useCallback, useState } from "react";
import { ActionTimingChart } from "./ActionTimingChart";
import { DailyParticipationChart } from "./DailyParticipationChart";
import { DateRangeFilter } from "./DateRangeFilter";
import { StatsSummaryCards } from "./StatsSummaryCards";

interface StatsDetailAccordionProps {
  missionId: string;
}

export function StatsDetailAccordion({ missionId }: StatsDetailAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRangeString | undefined>(undefined);

  const handleToggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return (
    <section className="rounded-xl border border-zinc-200 bg-white">
      <button
        type="button"
        onClick={handleToggle}
        className="flex w-full items-center justify-between px-5 py-4"
      >
        <Typo.SubTitle>상세 분석</Typo.SubTitle>
        <ChevronDown
          className={`size-5 text-zinc-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="space-y-4 px-5 pb-5">
          <DateRangeFilter value={dateRange} onChange={setDateRange} />
          <StatsSummaryCards missionId={missionId} dateRange={dateRange} />
          <DailyParticipationChart missionId={missionId} dateRange={dateRange} />
          <ActionTimingChart missionId={missionId} dateRange={dateRange} />
        </div>
      )}
    </section>
  );
}
