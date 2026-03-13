"use client";

import { incrementShareCount } from "@/actions/mission/update";
import { useCallback } from "react";

export function useShareTracking(missionId: string) {
  const trackShare = useCallback(() => {
    incrementShareCount(missionId);
  }, [missionId]);

  return { trackShare };
}
