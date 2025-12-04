import { getUserSurveys } from "@/actions/mission";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import { useInfiniteQuery } from "@tanstack/react-query";

export function useAdminSurveys(options?: { limit?: number }) {
  const limit = options?.limit ?? 10;

  const query = useInfiniteQuery({
    queryKey: missionQueryKeys.userMissions(),
    queryFn: ({ pageParam }) => {
      return getUserSurveys({
        cursor: pageParam,
        limit,
      });
    },
    initialPageParam: "",
    getNextPageParam: lastPage => lastPage.nextCursor,
    staleTime: 5 * 60 * 1000,
  });

  const surveys = query.data?.pages.flatMap(page => page.data) ?? [];

  return {
    surveys,
    isLoading: query.isLoading,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
  };
}
