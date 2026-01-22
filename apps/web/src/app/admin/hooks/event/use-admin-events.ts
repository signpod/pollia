"use client";

import { getUserEvents } from "@/actions/event";
import { adminEventQueryKeys } from "@/app/admin/constants/queryKeys";
import type { SortOrderType } from "@/types/common/sort";
import { useInfiniteQuery } from "@tanstack/react-query";

interface UseAdminEventsOptions {
  limit?: number;
  sortOrder?: SortOrderType;
}

export function useAdminEvents(options: UseAdminEventsOptions = {}) {
  const { limit = 10, sortOrder } = options;

  const query = useInfiniteQuery({
    queryKey: adminEventQueryKeys.list({ limit, sortOrder }),
    queryFn: ({ pageParam }) => {
      return getUserEvents({
        cursor: pageParam,
        limit,
        sortOrder,
      });
    },
    initialPageParam: "",
    getNextPageParam: lastPage => lastPage.nextCursor,
    staleTime: 5 * 60 * 1000,
  });

  const events = query.data?.pages.flatMap(page => page.data) ?? [];

  return {
    events,
    isLoading: query.isLoading,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
  };
}

export type UseAdminEventsReturn = ReturnType<typeof useAdminEvents>;
