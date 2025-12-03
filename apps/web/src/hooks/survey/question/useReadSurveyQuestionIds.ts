"use client";

import { getSurveyQuestionIds } from "@/actions/action";
import { surveyQueryKeys } from "@/constants/queryKeys/surveyQueryKeys";
import { useQuery } from "@tanstack/react-query";

export const useReadSurveyQuestionIds = (surveyId: string) => {
  return useQuery({
    queryKey: surveyQueryKeys.surveyQuestionIds({ surveyId }),
    queryFn: () => getSurveyQuestionIds(surveyId),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    initialData: { data: { questionIds: [] } },
  });
};

export type UseReadSurveyQuestionIdsReturn = ReturnType<typeof useReadSurveyQuestionIds>;
