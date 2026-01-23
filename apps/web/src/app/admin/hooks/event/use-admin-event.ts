"use client";

import { getEvent } from "@/actions/event";
import { adminEventQueryKeys } from "@/app/admin/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";

export function useAdminEvent(eventId: string) {
  const query = useQuery({
    queryKey: adminEventQueryKeys.detail(eventId),
    queryFn: () => getEvent(eventId),
    staleTime: 5 * 60 * 1000,
  });

  return {
    event: query.data?.data,
    isLoading: query.isLoading,
    error: query.error,
  };
}

export type UseAdminEventReturn = ReturnType<typeof useAdminEvent>;
