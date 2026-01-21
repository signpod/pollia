"use client";

import { getEventWithMissions } from "@/actions/event";
import { adminEventQueryKeys } from "@/app/admin/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";

export function useAdminEventWithMissions(eventId: string) {
  const query = useQuery({
    queryKey: adminEventQueryKeys.detailWithMissions(eventId),
    queryFn: () => getEventWithMissions(eventId),
    staleTime: 5 * 60 * 1000,
  });

  return {
    event: query.data?.data,
    isLoading: query.isLoading,
    error: query.error,
  };
}

export type UseAdminEventWithMissionsReturn = ReturnType<typeof useAdminEventWithMissions>;
