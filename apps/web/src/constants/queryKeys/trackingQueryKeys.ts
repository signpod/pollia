import type { DateRangeString } from "@/types/common/dateRange";

export const trackingQueryKeys = {
  missionFunnel: (
    missionId: string,
    options?: { membersOnly?: boolean; dateRange?: DateRangeString },
  ) => ["mission-funnel", missionId, options ?? {}] as const,
} as const;

export type TrackingQueryKeys = typeof trackingQueryKeys;
