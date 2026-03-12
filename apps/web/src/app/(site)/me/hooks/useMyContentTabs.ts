"use client";

import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import type { MyMissionResponse } from "@/types/dto/mission-response";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { useMyResponses } from "./useMyResponses";

const TABS = [
  { value: "participation", label: "참여" },
  { value: "liked", label: "찜" },
  { value: "rewards", label: "리워드" },
  { value: "my-content", label: `내 ${UBIQUITOUS_CONSTANTS.MISSION}` },
] as const;

const DEFAULT_TAB = TABS[0].value;
const VALID_TAB_VALUES = new Set(TABS.map(t => t.value));

export type TabValue = (typeof TABS)[number]["value"];

export function useMyContentTabs() {
  const { data } = useMyResponses();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab");

  const [currentTab, setCurrentTab] = useState<string>(
    VALID_TAB_VALUES.has(initialTab as TabValue) ? (initialTab as string) : DEFAULT_TAB,
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
    const url = new URL(window.location.href);
    if (value === DEFAULT_TAB) {
      url.searchParams.delete("tab");
    } else {
      url.searchParams.set("tab", value);
    }
    url.searchParams.delete("filter");
    window.history.replaceState(null, "", url.toString());
  }, []);

  return {
    tabs: TABS,
    currentTab,
    handleTabChange,
    inProgressResponses,
    completedResponses,
  };
}

export type UseMyContentTabsReturn = ReturnType<typeof useMyContentTabs>;
