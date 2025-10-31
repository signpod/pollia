import { getUserSurveys } from "@/actions/survey/read-survey";
import { surveySortOrderAtom } from "@/atoms/me/searchAtoms";
import { surveyQueryKeys } from "@/constants/queryKeys/surveyQueryKeys";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";

export const useReadSurvey = (params?: {
  options?: {
    userId?: string;
    limit?: number;
  };
}) => {
  const sortOrder = useAtomValue(surveySortOrderAtom);

  return useInfiniteQuery({
    queryKey: surveyQueryKeys.userSurveys(params?.options?.userId),
    queryFn: ({ pageParam }) => {
      return getUserSurveys({
        cursor: pageParam,
        limit: params?.options?.limit ?? 10,
        sortOrder,
      });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export type UseReadSurveyReturn = ReturnType<typeof useReadSurvey>;
