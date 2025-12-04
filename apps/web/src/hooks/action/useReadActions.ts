import { getMissionActions } from "@/actions/action";
import { actionQueryKeys } from "@/constants/queryKeys/actionQueryKeys";
import { ActionType } from "@prisma/client";
import { useInfiniteQuery } from "@tanstack/react-query";

export const useReadActions = (params?: {
  options?: {
    searchQuery?: string;
    selectedActionTypes?: ActionType[];
    isDraft?: boolean;
    limit?: number;
  };
}) => {
  return useInfiniteQuery({
    queryKey: actionQueryKeys.actions({
      searchQuery: params?.options?.searchQuery,
      selectedActionTypes: params?.options?.selectedActionTypes ?? [],
      isDraft: params?.options?.isDraft ?? false,
    }),
    queryFn: ({ pageParam }) => {
      return getMissionActions({
        searchQuery: params?.options?.searchQuery,
        selectedQuestionTypes: params?.options?.selectedActionTypes ?? [],
        isDraft: params?.options?.isDraft,
        cursor: pageParam,
        limit: params?.options?.limit ?? 10,
      });
    },
    select: data => {
      return data.pages.flatMap(page =>
        page.data.map(item => ({
          ...item,
          isDraft: item.missionId === null,
        })),
      );
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: lastPage => lastPage.nextCursor,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export type UseReadActionReturn = ReturnType<typeof useReadActions>;
