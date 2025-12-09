import { getUserMissions } from "@/actions/mission";
import { adminMissionQueryKeys } from "@/app/admin/constants/queryKeys";
import { useInfiniteQuery } from "@tanstack/react-query";

export function useAdminMissions(options?: { limit?: number }) {
  const limit = options?.limit ?? 10;

  const query = useInfiniteQuery({
    queryKey: adminMissionQueryKeys.missions(),
    queryFn: ({ pageParam }) => {
      return getUserMissions({
        cursor: pageParam,
        limit,
      });
    },
    initialPageParam: "",
    getNextPageParam: lastPage => lastPage.nextCursor,
    staleTime: 5 * 60 * 1000,
  });

  const missions = query.data?.pages.flatMap(page => page.data) ?? [];

  return {
    missions,
    isLoading: query.isLoading,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
  };
}
