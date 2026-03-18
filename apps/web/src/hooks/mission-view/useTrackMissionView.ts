"use client";

import { trackMissionView } from "@/actions/mission-view/track";
import { useEffect } from "react";

const VIEW_STORAGE_PREFIX = "mission-view:";

function getTodayKey(missionId: string): string {
  const today = new Date().toISOString().slice(0, 10);
  return `${VIEW_STORAGE_PREFIX}${missionId}:${today}`;
}

function hasViewedToday(missionId: string): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(getTodayKey(missionId)) === "1";
}

function markAsViewed(missionId: string): void {
  localStorage.setItem(getTodayKey(missionId), "1");
}

export function useTrackMissionView(missionId: string) {
  useEffect(() => {
    // if (hasViewedToday(missionId)) return;
    // markAsViewed(missionId);
    trackMissionView({ missionId }).catch(() => {});
  }, [missionId]);
}
