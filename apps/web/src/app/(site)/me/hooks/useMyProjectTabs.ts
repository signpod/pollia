"use client";

import type { MyMissionResponse } from "@/types/dto/mission-response";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { useMyResponses } from "./useMyResponses";

const TABS = [
  { value: "my-content", label: "내 콘텐츠" },
  { value: "participation", label: "참여" },
  { value: "liked", label: "찜" },
  { value: "rewards", label: "리워드" },
] as const;

const DEFAULT_TAB = TABS[0].value;
const VALID_TAB_VALUES = new Set(TABS.map(t => t.value));

export type TabValue = (typeof TABS)[number]["value"];

export type ParticipationFilter = "in-progress" | "completed";
const DEFAULT_FILTER: ParticipationFilter = "in-progress";
const VALID_FILTERS = new Set<ParticipationFilter>(["in-progress", "completed"]);

function replaceParams(params: Record<string, string | null>) {
  const url = new URL(window.location.href);
  for (const [key, value] of Object.entries(params)) {
    if (value === null) url.searchParams.delete(key);
    else url.searchParams.set(key, value);
  }
  window.history.replaceState(null, "", url.toString());
}

export function useMyProjectTabs() {
  const { data } = useMyResponses();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab");
  const initialFilter = searchParams.get("filter");

  const [currentTab, setCurrentTab] = useState<string>(
    VALID_TAB_VALUES.has(initialTab as TabValue) ? (initialTab as string) : DEFAULT_TAB,
  );

  const [participationFilter, setParticipationFilter] = useState<ParticipationFilter>(
    VALID_FILTERS.has(initialFilter as ParticipationFilter)
      ? (initialFilter as ParticipationFilter)
      : DEFAULT_FILTER,
  );

  const { inProgressResponses, completedResponses } = useMemo(() => {
    const responses = data?.data ?? [];
    const inProgress: MyMissionResponse[] = [];
    const completed: MyMissionResponse[] = [];
    for (const r of responses) {
      if (r.completedAt === null) inProgress.push(r);
      else completed.push(r);
    }
    return { inProgressResponses: inProgress, completedResponses: completed };
  }, [data]);

  const handleTabChange = useCallback((value: string) => {
    setCurrentTab(value);
    replaceParams({
      tab: value === DEFAULT_TAB ? null : value,
      filter: null,
    });
    if (value === "participation") {
      setParticipationFilter(DEFAULT_FILTER);
    }
  }, []);

  const handleFilterChange = useCallback((value: ParticipationFilter) => {
    setParticipationFilter(value);
    replaceParams({
      filter: value === DEFAULT_FILTER ? null : value,
    });
  }, []);

  return {
    tabs: TABS,
    currentTab,
    handleTabChange,
    inProgressResponses,
    completedResponses,
    participationFilter,
    handleFilterChange,
  };
}

export type UseMyProjectTabsReturn = ReturnType<typeof useMyProjectTabs>;
