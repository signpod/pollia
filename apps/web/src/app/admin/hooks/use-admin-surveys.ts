import { getUserSurveys } from "@/actions/mission";
import { surveyQueryKeys } from "@/constants/queryKeys/surveyQueryKeys";
import { useInfiniteQuery } from "@tanstack/react-query";

export function useAdminSurveys(options?: { limit?: number }) {
  const limit = options?.limit ?? 10;

  const query = useInfiniteQuery({
    queryKey: surveyQueryKeys.userSurveys(),
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
